import type { GraphConfig } from "./graph/createGraph";
import type { SceneConfig } from "./scene/graphScene";

export const graphConfig: GraphConfig = {
  nodeCount: 170,
  neighborsPerNode: 5,
  hubCount: 7,
  shape: { radius: 1, lobeDepth: 0.25, roughness: 0.06 },
};

export const sceneConfig: SceneConfig = {
  rotationSpeed: { x: 0.07, y: 0.28 },
  jitter: { amplitude: 0.045, frequency: 1.4 },
  camera: { distance: 3.4, focalLength: 2.6, zoom: 0.36 },
};

export const timing = {
  revealSeconds: 2.4,
  pulseSeconds: 1.8,
};
