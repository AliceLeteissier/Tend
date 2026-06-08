import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import GUI from "lil-gui";

const CIRCUMRADIUS = 11.0;
const SPACING = 1.2;
const GLOBAL_SCALE = 0.5;
const Y_OFFSET = 0.0;
const RANDOM_ROT = 0.4;
const RANDOM_SCALE = 0.25;

function showDebug(msg: string, isError = false): void {
  let box = document.getElementById("ivy-debug");
  if (!box) {
    box = document.createElement("div");
    box.id = "ivy-debug";
    box.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 9999;
      background: rgba(0,0,0,0.85);
      color: #80ffcc;
      font-family: monospace;
      font-size: 13px;
      padding: 16px;
      max-width: 500px;
      border: 1px solid #80ffcc;
      white-space: pre-wrap;
    `;
    document.body.appendChild(box);
  }
  box.style.color = isError ? "#ff6b6b" : "#80ffcc";
  box.style.borderColor = isError ? "#ff6b6b" : "#80ffcc";
  box.textContent = msg;
}

function getHexVertices(R: number): THREE.Vector3[] {
  const verts: THREE.Vector3[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 6 + (i * Math.PI) / 3;
    verts.push(new THREE.Vector3(R * Math.cos(angle), 0, R * Math.sin(angle)));
  }
  return verts;
}

function computePlacements(
  R: number,
  spacing: number,
): { pos: THREE.Vector3; rotY: number }[] {
  const verts = getHexVertices(R);
  const result: { pos: THREE.Vector3; rotY: number }[] = [];

  for (let i = 0; i < 6; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % 6];
    const edgeLen = new THREE.Vector3().subVectors(b, a).length();
    const midpoint = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const outwardAngle = Math.atan2(midpoint.x, midpoint.z);
    const steps = Math.floor(edgeLen / spacing);

    for (let s = 0; s <= steps; s++) {
      const t = steps === 0 ? 0.5 : s / steps;
      const pos = new THREE.Vector3().lerpVectors(a, b, t);
      result.push({ pos, rotY: outwardAngle });
    }
  }

  return result;
}

export function createIvy(scene: THREE.Scene): void {
  showDebug("⏳ Attempting to load ivy...");

  const params = {
    yOffset: Y_OFFSET,
    scale: GLOBAL_SCALE,
    randomRot: RANDOM_ROT,
    randomScale: RANDOM_SCALE,
  };

  const loader = new GLTFLoader();

  loader.load(
    "/assets/ivy.glb",
    (gltf) => {
      showDebug(`✅ Loaded — ${gltf.scene.children.length} children in scene`);

      const placements = computePlacements(CIRCUMRADIUS, SPACING);
      const instances: THREE.Object3D[] = [];

      let seed = 42;
      const rand = () => {
        seed = (seed * 16807 + 0) % 2147483647;
        return (seed - 1) / 2147483646;
      };

      placements.forEach(({ pos, rotY }) => {
        const instance = gltf.scene.clone();
        const rndRot = (rand() - 0.5) * 2 * params.randomRot;
        const rndScale = 1 + (rand() - 0.5) * 2 * params.randomScale;

        instance.position.set(pos.x, params.yOffset, pos.z);
        instance.rotation.y = rotY + rndRot;
        instance.scale.setScalar(params.scale * rndScale);

        instance.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(instance);
        instances.push(instance);
      });

      showDebug(`✅ Done — ${instances.length} instances placed`);

      // GUI
      const gui = new GUI({ title: "TEND — Ivy", width: 280 });

      gui
        .add(params, "yOffset", -2, 2, 0.01)
        .name("Y offset (sink/lift)")
        .onChange((v: number) =>
          instances.forEach((inst) => {
            inst.position.y = v;
          }),
        );

      gui
        .add(params, "scale", 0.001, 5, 0.001)
        .name("Global scale")
        .onChange((v: number) => {
          instances.forEach((inst, i) => {
            const rndScale =
              1 + (((i * 0.37) % 1) - 0.5) * 2 * params.randomScale;
            inst.scale.setScalar(v * rndScale);
          });
        });

      gui
        .add(
          {
            log: () =>
              console.log("Ivy params:", JSON.stringify(params, null, 2)),
          },
          "log",
        )
        .name("📋 Log values to console");
    },
    undefined,
    (err) => {
      showDebug(`❌ Load failed:\n${err}`, true);
    },
  );
}
