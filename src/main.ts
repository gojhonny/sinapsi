import { animate, frame } from "motion";
import "./style.css";
import { graphConfig, sceneConfig, timing } from "./config";
import { createGraph } from "./graph/createGraph";
import { CanvasRenderer } from "./render/canvasRenderer";
import { GraphScene } from "./scene/graphScene";
import { palette } from "./theme";

const MS_PER_SECOND = 1000;

function requireCanvas(selector: string): HTMLCanvasElement {
  const canvas = document.querySelector<HTMLCanvasElement>(selector);
  if (!canvas) throw new Error(`Missing canvas element: ${selector}`);
  return canvas;
}

function start(): void {
  document.body.style.backgroundColor = palette.background;

  const renderer = new CanvasRenderer(requireCanvas("#graph"));
  const scene = new GraphScene(createGraph(graphConfig), sceneConfig);

  animate(0, 1, {
    duration: timing.revealSeconds,
    ease: "easeOut",
    onUpdate: (value) => {
      scene.reveal = value;
    },
  });

  animate(0, 1, {
    duration: timing.pulseSeconds,
    ease: "easeInOut",
    repeat: Infinity,
    repeatType: "mirror",
    onUpdate: (value) => {
      scene.pulse = value;
    },
  });

  frame.update(({ delta }) => {
    scene.advance(delta / MS_PER_SECOND);
    renderer.render(scene.snapshot(renderer.viewport));
  }, true);

  window.addEventListener("resize", () => renderer.resize());
}

start();
