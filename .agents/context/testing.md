# Testing context

Vitest is the fast contract runner and happy-dom is the default deterministic
DOM environment. SSR entry tests opt into the Node environment. Executable
`*.test.ts` suites are colocated beside the source they verify under `src/`;
only shared setup and fixtures remain under `test/`.

Suite names start with the canonical concern prefix followed by a responsibility:
`core/`, `factory/`, `service/`, or `schema/`. Tests import Vitest APIs explicitly
and exercise public behavior. Element tests do not pierce a live `<sinaps-i>`
closed shadow root; focused factory tests may inspect a tree they construct
directly.

Required confidence layers are lint-staged, Biome, TypeScript, colocated Vitest,
package builds, SemVer validation, versioned shell audits, and `npm pack --dry-run`
in CI.
