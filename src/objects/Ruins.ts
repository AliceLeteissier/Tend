import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface AssetPlacement {
  x: number;
  y: number;
  z: number;
  rotY: number;
  scale: number;
}

const PLACEMENTS: AssetPlacement[] = [
  // Side 0 — NE face
  { x: 4.763, y: 0, z: -8.25, rotY: -0.5236, scale: 1.0 },
  // Side 2 — SE face
  { x: 4.763, y: 0, z: 8.25, rotY: -2.618, scale: 1.0 },
  // Side 4 — W face
  { x: -9.526, y: 0, z: 0, rotY: 1.5708, scale: 1.0 },
];

export function createRuins(scene: THREE.Scene): void {
  const loader = new GLTFLoader();

  loader.load(
    "/assets/ruin1.glb", // ← rename to your actual file
    (gltf) => {
      console.log("✅ ruin1.glb loaded");
      const instances: THREE.Group[] = [];

      PLACEMENTS.forEach((p) => {
        const instance = gltf.scene.clone();
        instance.position.set(p.x, p.y, p.z);
        instance.rotation.y = p.rotY;
        instance.scale.setScalar(p.scale);

        instance.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(instance);
        instances.push(instance as unknown as THREE.Group);
      });
    },
    undefined,
    (err) => console.error("Ruin load failed:", err),
  );
}
