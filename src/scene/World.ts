import * as THREE from "three";
import { createRenderer } from "../core/Renderer";
import { createCamera } from "../core/Camera";
import { createLights } from "../core/Lighting";
import { loadEnvironment } from "../core/Environment";
import { createPlatform } from "../objects/Platform";
import { createRuins } from "../objects/Ruins";
import { createFloorMarker } from "../objects/FloorMarker";
import {
  createNeckReliefOrb,
  animateOrb,
  type OrbParams,
} from "../objects/NeckReliefOrb";
import { createParticles } from "../objects/Particles";
import { LoadingScreen } from "../ui/LoadingScreen";
import { initXRButton } from "../ui/XRButton";
import { createIvy } from "../objects/ivy";
import { Overlay } from "../ui/Overlay";
import { ProximityDetector } from "../ui/ProximityDetector";

const MODES: OrbParams["movementMode"][] = [
  "figure8",
  "vertical",
  "horizontal",
];

type ExperienceState = "idle" | "briefing" | "active";

export async function buildWorld(): Promise<void> {
  const loader = new LoadingScreen();
  loader.setProgress(5, "Initialising renderer…");

  // Delay proximity so VR camera has time to settle
  let proximityActive = false;
  setTimeout(() => {
    proximityActive = true;
  }, 2000);

  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0f12, 0.012);

  const { camera, controls } = createCamera(renderer);
  const lights = createLights(scene);

  initXRButton(renderer);
  // Place user 4m back from the floor marker on VR entry
  renderer.xr.addEventListener("sessionstart", () => {
    const baseLayer = renderer.xr.getReferenceSpace();
    if (!baseLayer) return;
    const offset = new XRRigidTransform({ x: 0, y: 0, z: -2 });
    const offsetSpace = baseLayer.getOffsetReferenceSpace(offset);
    renderer.xr.setReferenceSpace(offsetSpace);
  });

  loader.setProgress(15, "Loading sky…");
  await loadEnvironment(scene);

  loader.setProgress(40, "Building platform…");
  createPlatform(scene);
  createIvy(scene);

  loader.setProgress(55, "Placing ruins…");
  createRuins(scene);

  loader.setProgress(68, "Marking station…");
  createFloorMarker(scene);

  loader.setProgress(78, "Summoning orb…");
  const { group: orbGroup, params: orbParams } = createNeckReliefOrb(scene);

  // ── VR controller ──────────────────────────────────────────────────────
  const vrController = renderer.xr.getController(0);
  scene.add(vrController);

  // Visible ray line
  const rayGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -5),
  ]);
  const rayMat = new THREE.LineBasicMaterial({
    color: 0x80ffcc,
    opacity: 0.6,
    transparent: true,
  });
  vrController.add(new THREE.Line(rayGeo, rayMat));

  loader.setProgress(90, "Scattering dust…");
  const particles = createParticles(scene);

  loader.setProgress(100, "Ready");
  setTimeout(() => loader.hide(), 600);

  // ── State ──────────────────────────────────────────────────────────────
  let state: ExperienceState = "idle";
  // Temporary state display — remove when done debugging
  const stateDisplay = document.createElement("div");
  stateDisplay.style.cssText = `
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  background: rgba(0,0,0,0.8);
  color: #80ffcc;
  font-family: monospace;
  font-size: 14px;
  padding: 12px;
`;
  document.body.appendChild(stateDisplay);

  function updateStateDisplay(): void {
    stateDisplay.textContent = `state: ${state}`;
  }
  updateStateDisplay();
  const overlay = new Overlay(scene, camera, renderer); // ← fixed
  let modeIndex = 0;

  function cycleMode(): void {
    updateStateDisplay();
    if (state !== "active") return;
    modeIndex = (modeIndex + 1) % MODES.length;
    orbParams.movementMode = MODES[modeIndex];
    orbGroup.position.set(orbParams.posX, orbParams.posY, orbParams.posZ);
  }

  function startBriefing(): void {
    updateStateDisplay();
    if (state !== "idle") return;
    state = "briefing";

    // First overlay
    overlay.show(["Keep your gaze on the orb"]);

    setTimeout(() => {
      if (state !== "briefing") return;

      // Second overlay
      overlay.show(["Touch the orb to change movement"]);

      setTimeout(() => {
        if (state !== "briefing") return;
        overlay.hide();
        state = "active";
        updateStateDisplay();
      }, 5000);
    }, 5000);
  }

  function resetExperience(): void {
    if (state === "idle") return;
    state = "idle";
    orbParams.movementMode = "figure8";
    modeIndex = 0;
    orbGroup.position.set(orbParams.posX, orbParams.posY, orbParams.posZ);
    overlay.hide();
  }

  // ── Keyboard (desktop) ─────────────────────────────────────────────────
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") startBriefing();
    if (e.code === "Escape") resetExperience();
  });

  // ── Proximity ──────────────────────────────────────────────────────────
  const proximity = new ProximityDetector({
    target: new THREE.Vector3(0, 0, 0),
    radius: 1.2,
    onEnter: () => startBriefing(),
    onExit: () => resetExperience(),
  });

  // ── Raycaster ──────────────────────────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Desktop mouse click
  window.addEventListener("click", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(orbGroup.children, true);
    if (hits.length > 0) cycleMode();
  });

  // VR controller trigger via selectstart — most reliable on Quest
  vrController.addEventListener("selectstart", () => {
    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3(0, 0, -1);
    origin.setFromMatrixPosition(vrController.matrixWorld);
    direction.transformDirection(vrController.matrixWorld);
    raycaster.set(origin, direction);
    const hits = raycaster.intersectObjects(orbGroup.children, true);
    if (hits.length > 0) cycleMode();
  });

  // ── Animation loop ──────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let vrTriggerWasPressed = false;

  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime();

    overlay.update();

    // Orb — only animates when active
    if (state === "active") {
      animateOrb(orbGroup, orbParams, t, lights.orbGlow);
    } else {
      lights.orbGlow.position.copy(orbGroup.position);
    }

    // Proximity — guarded so VR camera has time to settle
    if (proximityActive) proximity.update(camera.position);

    particles.rotation.y += 0.0006;
    controls.update();

    // VR gamepad fallback
    if (renderer.xr.isPresenting) {
      const inputSource = renderer.xr.getSession()?.inputSources[0];
      const trigger = inputSource?.gamepad?.buttons[0]?.pressed ?? false;
      vrTriggerWasPressed = trigger;
    }

    renderer.render(scene, camera);
  });
}
