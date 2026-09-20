// Run against a dedicated Chromium sandbox tab, never a user's application tab:
// node test/browser-presentations.mjs <browser-cdp-websocket> [sandbox-url]
import assert from 'node:assert/strict'

const [endpoint, url = 'http://127.0.0.1:5174/'] = process.argv.slice(2)
if (!endpoint) throw new Error('Pass a dedicated browser CDP WebSocket URL')
const socket = new WebSocket(endpoint)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})
let sequence = 0
let session
const pending = new Map()
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data)
  const request = pending.get(message.id)
  if (!request) return
  pending.delete(message.id)
  clearTimeout(request.timer)
  if (message.error) request.reject(new Error(JSON.stringify(message.error)))
  else request.resolve(message.result)
})
function call(method, params = {}, sessionId = session) {
  return new Promise((resolve, reject) => {
    const id = ++sequence
    const timer = setTimeout(() => {
      pending.delete(id)
      reject(new Error(`CDP timeout: ${method}`))
    }, 10000)
    pending.set(id, { resolve, reject, timer })
    socket.send(JSON.stringify({ id, method, params, sessionId }))
  })
}
async function evaluate(expression) {
  const response = await call('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  })
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails))
  return response.result.value
}
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms))
async function key(key, code = key) {
  await call('Input.dispatchKeyEvent', {
    type: key === 'Enter' ? 'keyDown' : 'rawKeyDown',
    key,
    code,
    text: key === 'Enter' ? '\r' : undefined,
    windowsVirtualKeyCode:
      key === 'Enter' ? 13 : key === 'Tab' ? 9 : key === 'Escape' ? 27 : undefined
  })
  await call('Input.dispatchKeyEvent', { type: 'keyUp', key, code })
  await delay()
}
async function internal(selector, expression = 'this.getBoundingClientRect().toJSON()') {
  // CDP can inspect closed roots for testing; consumers never traverse them.
  const { root } = await call('DOM.getDocument', { depth: -1, pierce: true })
  function flatten(node) {
    return [
      node,
      ...(node.children ?? []).flatMap(flatten),
      ...(node.shadowRoots ?? []).flatMap(flatten)
    ]
  }
  const node = flatten(root).find((entry) => {
    const attributes = Object.fromEntries(
      Array.from({ length: (entry.attributes?.length ?? 0) / 2 }, (_, index) =>
        entry.attributes.slice(index * 2, index * 2 + 2)
      )
    )
    return selector(attributes, entry)
  })
  assert.ok(node, 'Internal test target exists')
  const { object } = await call('DOM.resolveNode', { nodeId: node.nodeId })
  const response = await call('Runtime.callFunctionOn', {
    objectId: object.objectId,
    functionDeclaration: `function () { return (${expression}) }`,
    returnByValue: true
  })
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails))
  return response.result.value
}
const list = (expression) => internal((attributes) => attributes.role === 'listbox', expression)
const panel = (expression) =>
  internal((attributes) => attributes.part === 'presentation', expression)
const close = (expression) => internal((attributes) => attributes.part === 'close', expression)
async function check(name, action) {
  await action()
  console.log(`PASS ${name}`)
}
try {
  const { targetInfos } = await call('Target.getTargets')
  const target = targetInfos.find((item) => item.type === 'page' && item.url.startsWith(url))
  assert.ok(target, `Open the sandbox first: ${url}`)
  session = (await call('Target.attachToTarget', { targetId: target.targetId, flatten: true }))
    .sessionId
  await call('Page.bringToFront')
  await call('Page.navigate', { url })
  await delay(1000)
  await call('Emulation.setDeviceMetricsOverride', {
    width: 1200,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  })
  await evaluate(
    `window.scrollTo(0,0); document.querySelector('sinaps-i').style.cssText='display:block;width:600px;height:550px;margin:60px auto'; document.querySelector('main').style.cssText='display:block;padding:0;min-height:1800px'; document.querySelector('h1').remove(); document.querySelector('sinaps-i').move='idle'; window.__clicks=[]; document.querySelector('sinaps-i').addEventListener('sinapsi-node-click',event=>window.__clicks.push(event.detail)); document.body.insertAdjacentHTML('beforeend','<button id="outside" style="position:fixed;left:10px;top:10px">Outside</button>');`
  )
  await delay(800)
  await check('closed root, localized listbox; focus does not open content', async () => {
    assert.equal(await evaluate(`document.querySelector('sinaps-i').shadowRoot`), null)
    assert.equal(await list(`this.getAttribute('aria-label')`), 'Catalog and product context')
    await list(`this.focus({preventScroll:true})`)
    assert.equal(await panel('this.hidden'), true)
  })
  await check('Enter opens one card; Tab reaches close and returns focus', async () => {
    await key('Enter')
    assert.equal(await panel('this.hidden'), false)
    assert.equal(await panel(`this.matches(':popover-open')`), true)
    assert.match(await panel('this.textContent'), /Anna Souza/)
    assert.equal(await evaluate('window.__clicks.length'), 1)
    await key('Tab')
    assert.equal(
      await close('this.getRootNode().activeElement === this'),
      true,
      JSON.stringify(
        await close(
          '({rootActive:this.getRootNode().activeElement?.outerHTML,documentActive:document.activeElement?.outerHTML})'
        )
      )
    )
    await key('Enter')
    assert.equal(await panel('this.hidden'), true)
    assert.equal(await list('this.getRootNode().activeElement === this'), true)
    assert.equal(await evaluate('window.__clicks.length'), 1)
  })
  await check('no-avatar card and content-only update retain selection', async () => {
    await key('ArrowDown')
    await key('Enter')
    assert.equal(await panel(`this.querySelectorAll('img').length`), 0)
    assert.match(await panel('this.textContent'), /Catalog mapping/)
    const before = await panel()
    await evaluate(
      `{const graph=document.querySelector('sinaps-i');const next=graph.nodes;next.graph[1].presentation.description='<strong>Safe plain text</strong>';graph.nodes=next;}`
    )
    await delay()
    assert.equal(await panel(`this.querySelector('.presentation-description').children.length`), 0)
    assert.match(await panel('this.textContent'), /<strong>Safe plain text<\/strong>/)
    assert.equal(
      await list(`this.querySelector('[aria-selected="true"]').dataset.nodeId`),
      'sku-map'
    )
    const after = await panel()
    assert.ok(Math.abs(before.x - after.x) < 1)
  })
  await check('arrows preview without replacement; tooltip has only description', async () => {
    await key('ArrowDown')
    assert.match(await panel('this.textContent'), /Catalog mapping/)
    await key('Enter')
    assert.equal(await panel(`this.dataset.type`), 'tooltip')
    assert.equal(
      await panel(`this.querySelectorAll('[part="title"],img,[part="badge"]').length`),
      0
    )
    assert.match(await panel('this.textContent'), /Search results/)
    await key('Escape')
    assert.equal(await panel('this.hidden'), true)
  })
  await check('same-node toggle, legacy replacement and Escape scoping', async () => {
    await key('Enter')
    await key('Enter')
    assert.equal(await panel('this.hidden'), true)
    await key('ArrowDown')
    await key('Enter')
    assert.match(await panel('this.textContent'), /Description-only/)
    await key('ArrowDown')
    await key('Enter')
    assert.equal(await panel('this.hidden'), true)
  })
  await check('offscreen hides and restores without focus left in hidden popup', async () => {
    await key('ArrowDown')
    await key('Enter')
    await key('Tab')
    assert.equal(await close('this.getRootNode().activeElement === this'), true)
    await evaluate('window.scrollTo(0,1200)')
    await delay(200)
    assert.equal(await panel('this.hidden'), true)
    assert.equal(await list('this.getRootNode().activeElement === this'), true)
    assert.ok((await evaluate('window.scrollY')) > 600)
    await evaluate('window.scrollTo(0,0)')
    await delay(200)
    assert.equal(await panel('this.hidden'), false)
    assert.equal(await list('this.getRootNode().activeElement === this'), true)
  })
  await check('outside click closes without stealing external focus', async () => {
    await call('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: 35,
      y: 25,
      button: 'left',
      clickCount: 1
    })
    await call('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: 35,
      y: 25,
      button: 'left',
      clickCount: 1
    })
    await delay()
    assert.equal(await panel('this.hidden'), true)
    assert.equal(await evaluate('document.activeElement.id'), 'outside')
  })
  await check('moving popup follows the actually painted selection at DPR 2', async () => {
    // Observe Canvas API output, without adding a second projection or runtime API.
    await evaluate(`window.__rings=[]; {
      const proto=CanvasRenderingContext2D.prototype;
      for(const name of ['beginPath','arc','stroke','clearRect']) {
        const original=proto[name];
        proto[name]=function(...args) {
          if(name==='beginPath') this.__testArc=null;
          if(name==='arc') this.__testArc=args.slice(0,3);
          if(name==='clearRect') window.__rings=[];
          if(name==='stroke'&&this.__testArc) window.__rings.push(this.__testArc);
          return Reflect.apply(original,this,args);
        };
      }
    }`)
    await list('this.focus({preventScroll:true})')
    await key('Enter')
    await evaluate(
      `document.querySelector('sinaps-i').move='rotate'; document.querySelector('sinaps-i').speed=1; document.querySelector('#outside').focus({preventScroll:true})`
    )
    await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 10, y: 850 })
    const samples = []
    for (let index = 0; index < 10; index++) {
      await delay(120)
      const sample = await panel(
        `({rect:this.getBoundingClientRect().toJSON(),canvas:document.querySelector('sinaps-i').getBoundingClientRect().toJSON(),ring:window.__rings[0],side:this.dataset.side,hidden:this.hidden})`
      )
      assert.equal(sample.hidden, false)
      assert.ok(sample.ring)
      const x = sample.canvas.x + sample.ring[0]
      const y = sample.canvas.y + sample.ring[1]
      const { width, height } = sample.rect
      let expectedX = x - width / 2
      let expectedY = y - height * 0.35
      if (sample.side === 'left') expectedX = x - 18 - width
      if (sample.side === 'right') expectedX = x + 18
      if (sample.side === 'top') expectedY = y - 18 - height
      if (sample.side === 'bottom') expectedY = y + 18
      expectedX = Math.max(8, Math.min(expectedX, 1200 - 8 - width))
      expectedY = Math.max(8, Math.min(expectedY, 900 - 8 - height))
      assert.ok(Math.abs(sample.rect.x - expectedX) < 1, 'Panel X follows painted node')
      assert.ok(Math.abs(sample.rect.y - expectedY) < 1, 'Panel Y follows painted node')
      samples.push({ x, y })
    }
    assert.ok(
      Math.hypot(samples[0].x - samples.at(-1).x, samples[0].y - samples.at(-1).y) > 1,
      'Scene moved while card remained open'
    )
  })
  await check('trusted touch toggles a node; dragging does not activate it', async () => {
    await evaluate(`document.querySelector('sinaps-i').move='idle'`)
    await list('this.focus({preventScroll:true})')
    await key('Escape')
    await delay()
    const point = await evaluate(
      `(()=>{const box=document.querySelector('sinaps-i').getBoundingClientRect();return{x:box.x+window.__rings[0][0],y:box.y+window.__rings[0][1]}})()`
    )
    await evaluate(
      `window.__touches=[];document.querySelector('sinaps-i').addEventListener('pointerdown',event=>window.__touches.push({type:event.pointerType,trusted:event.isTrusted}))`
    )
    await call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
    const before = await evaluate('window.__clicks.length')
    await call('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ ...point, radiusX: 1, radiusY: 1, force: 1 }]
    })
    await call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await delay()
    assert.equal(await panel('this.hidden'), false)
    assert.equal(await evaluate('window.__clicks.length'), before + 1)
    assert.deepEqual(await evaluate('window.__touches[0]'), { type: 'touch', trusted: true })
    await call('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ ...point, radiusX: 1, radiusY: 1, force: 1 }]
    })
    await call('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: point.x, y: point.y + 60, radiusX: 1, radiusY: 1, force: 1 }]
    })
    await call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await delay()
    assert.equal(await evaluate('window.__clicks.length'), before + 1)
    await call('Emulation.setTouchEmulationEnabled', { enabled: false })
  })
  console.log('Browser semantics passed (Chromium, DPR 2).')
} finally {
  socket.close()
}
