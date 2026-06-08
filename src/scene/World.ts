import * as THREE from "three";
import { createRenderer } from "../core/Renderer";
import { createCamera } from "../core/Camera";
import { createLights } from "../core/Lighting";
import { loadEnvironment } from "../core/Environment";
import { createPlatform } from "../objects/Platform";
import { createRuins } from "../objects/Ruins";
import { createFloorMarker } from "../objects/FloorMarker";
import { createNeckReliefOrb, animateOrb } from "../objects/NeckReliefOrb";
import { createParticles } from "../objects/Particles";
import { LoadingScreen } from "../ui/LoadingScreen";
import { initXRButton } from "../ui/XRButton";
import { createIvy } from "../objects/ivy";

export async function buildWorld(): Promise<void> {
  const loader = new LoadingScreen();
  loader.setProgress(5, "Initialising renderer…");

  // ── Core ──────────────────────────────────────────────────────────────────
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0f12, 0.012);

  const { camera, controls } = createCamera(renderer);
  const lights = createLights(scene);

  initXRButton(renderer);

  // ── Environment ───────────────────────────────────────────────────────────
  loader.setProgress(15, "Loading sky…");
  await loadEnvironment(scene);

  // ── Scene objects ─────────────────────────────────────────────────────────
  loader.setProgress(40, "Building platform…");
  createPlatform(scene);
  createIvy(scene);

  loader.setProgress(55, "Placing ruins…");
  createRuins(scene);

  loader.setProgress(68, "Marking station…");
  createFloorMarker(scene);

  loader.setProgress(78, "Summoning orb…");
  const orbGroup = createNeckReliefOrb(scene);

  loader.setProgress(90, "Scattering dust…");
  const particles = createParticles(scene);

  loader.setProgress(100, "Ready");
  setTimeout(() => loader.hide(), 600);

  // ── Animation loop ────────────────────────────────────────────────────────
  const clock = new THREE.Clock();

  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime();

    animateOrb(orbGroup, t, lights.orbGlow);
    particles.rotation.y += 0.0006;

    controls.update();
    renderer.render(scene, camera);
  });
}
