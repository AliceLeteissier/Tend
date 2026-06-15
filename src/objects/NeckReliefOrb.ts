import * as THREE from "three";
import GUI from "lil-gui";

export interface OrbParams {
  // Position
  posX: number;
  posY: number;
  posZ: number;
  // Size
  coreRadius: number;
  // Color
  coreColor: string;
  emissiveColor: string;
  emissiveIntensity: number;
  // Glow
  midOpacity: number;
  outerOpacity: number;
  // Animation
  floatSpeed: number;
  floatAmount: number;
  figureEightSpeed: number;
  figureEightWidth: number;
  figureEightHeight: number;
  pulseSpeed: number;
  // Rings
  ringsVisible: boolean;
  ringSpeed: number;
  // Light
  lightIntensity: number;
  lightDistance: number;
  // Defferent modes:
  movementMode: "figure8" | "vertical" | "horizontal";
  verticalRange: number;
  horizontalRange: number;
  horizontalCurve: number; // how much the arc bows toward/away from user
}

const DEFAULT_PARAMS: OrbParams = {
  posX: 0,
  posY: 1.65,
  posZ: -1.4,
  coreRadius: 0.22,
  coreColor: "#1a3a5c", // deep navy blue
  emissiveColor: "#4488ff", // soft blue glow
  emissiveIntensity: 1.2,
  midOpacity: 0.2,
  outerOpacity: 0.07,
  floatSpeed: 3,
  floatAmount: 0.5,
  figureEightSpeed: 1.5, // how fast it traces the 8
  figureEightWidth: 1.5, // horizontal spread of the 8
  figureEightHeight: 1, // vertical spread of the 8
  pulseSpeed: 0,
  ringsVisible: true,
  ringSpeed: 0.004,
  lightIntensity: 1.5,
  lightDistance: 5,
  movementMode: "figure8",
  verticalRange: 1.0,
  horizontalRange: 1.5,
  horizontalCurve: 0.3,
};

export function createNeckReliefOrb(scene: THREE.Scene): {
  group: THREE.Group;
  params: OrbParams;
} {
  const params: OrbParams = { ...DEFAULT_PARAMS };

  const group = new THREE.Group();
  group.position.set(params.posX, params.posY, params.posZ);
  scene.add(group);

  // ── Core ──────────────────────────────────────────────────────────────────
  const coreMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(params.coreColor),
    emissive: new THREE.Color(params.emissiveColor),
    emissiveIntensity: params.emissiveIntensity,
    roughness: 0.05,
    metalness: 0.3,
    transparent: true,
    opacity: 0.92,
  });
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(params.coreRadius, 64, 64),
    coreMat,
  );
  group.add(core); // index 0

  // ── Mid shell ─────────────────────────────────────────────────────────────
  const midMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x2255cc),
    emissive: new THREE.Color(0x2255cc),
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: params.midOpacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mid = new THREE.Mesh(new THREE.SphereGeometry(0.26, 48, 48), midMat);
  group.add(mid); // index 1
  mid.name = "orb-mid";

  // ── Outer haze ────────────────────────────────────────────────────────────
  const outerMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x112244),
    transparent: true,
    opacity: params.outerOpacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const outer = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 32, 32),
    outerMat,
  );
  outer.name = "orb-outer";
  group.add(outer); // index 2

  // // ── Orbit rings ───────────────────────────────────────────────────────────
  // const ringGeo = new THREE.TorusGeometry(0.34, 0.012, 12, 80);
  // const ringMat = new THREE.MeshStandardMaterial({
  //   color: 0xaaccff,
  //   emissive: new THREE.Color(0x4488ff),
  //   emissiveIntensity: 0.8,
  //   transparent: true,
  //   opacity: 0.55,
  // });
  // const ring1 = new THREE.Mesh(ringGeo, ringMat);
  // ring1.name = "orb-ring1";
  // ring1.rotation.x = Math.PI / 5;
  // group.add(ring1); // index 3

  // const ring2 = new THREE.Mesh(ringGeo, ringMat.clone());
  // ring2.name = "orb-ring2";
  // ring2.rotation.set(Math.PI / 2.5, Math.PI / 4, 0);
  // group.add(ring2); // index 4

  // ── lil-gui ───────────────────────────────────────────────────────────────
  const gui = new GUI({ title: "TEND — Orb", width: 300 });

  const modeFolder = gui.addFolder("Movement mode");

  modeFolder
    .add(params, "movementMode", ["figure8", "vertical", "horizontal"])
    .name("Mode")
    .onChange((v: string) => {
      // Reset position to base when switching modes
      // so orb doesn't jump from a far position
      group.position.set(params.posX, params.posY, params.posZ);
      console.log("Movement mode:", v);
    });

  modeFolder
    .add(params, "figureEightSpeed", 0, 4, 0.01)
    .name("Speed (all modes)");
  modeFolder.add(params, "figureEightWidth", 0, 3, 0.01).name("Figure-8 width");
  modeFolder
    .add(params, "figureEightHeight", 0, 2, 0.01)
    .name("Figure-8 height");
  modeFolder.add(params, "verticalRange", 0, 3, 0.01).name("Vertical range");
  modeFolder
    .add(params, "horizontalRange", 0, 4, 0.01)
    .name("Horizontal range");
  modeFolder
    .add(params, "horizontalCurve", 0, 1, 0.01)
    .name("Horizontal curve");

  const posFolder = gui.addFolder("Position");
  posFolder
    .add(params, "posX", -10, 10, 0.01)
    .name("X")
    .onChange((v: number) => {
      group.position.x = v;
    });
  posFolder
    .add(params, "posY", 0, 5, 0.01)
    .name("Y (base height)")
    .onChange((v: number) => {
      group.position.y = v;
    });
  posFolder
    .add(params, "posZ", -10, 10, 0.01)
    .name("Z")
    .onChange((v: number) => {
      group.position.z = v;
    });

  const appearFolder = gui.addFolder("Appearance");
  appearFolder
    .addColor(params, "coreColor")
    .name("Core colour")
    .onChange((v: string) => {
      coreMat.color.set(v);
    });
  appearFolder
    .addColor(params, "emissiveColor")
    .name("Emissive colour")
    .onChange((v: string) => {
      coreMat.emissive.set(v);
      midMat.color.set(v);
      midMat.emissive.set(v);
    });
  appearFolder
    .add(params, "emissiveIntensity", 0, 5, 0.01)
    .name("Emissive intensity")
    .onChange((v: number) => {
      coreMat.emissiveIntensity = v;
    });
  appearFolder
    .add(params, "midOpacity", 0, 1, 0.01)
    .name("Glow opacity")
    .onChange((v: number) => {
      midMat.opacity = v;
    });
  appearFolder
    .add(params, "outerOpacity", 0, 0.5, 0.001)
    .name("Haze opacity")
    .onChange((v: number) => {
      outerMat.opacity = v;
    });

  const animFolder = gui.addFolder("Animation");
  animFolder.add(params, "floatSpeed", 0, 6, 0.01).name("Float speed");
  animFolder.add(params, "floatAmount", 0, 1, 0.01).name("Float amount");
  animFolder.add(params, "figureEightSpeed", 0, 3, 0.01).name("Figure-8 speed");
  animFolder.add(params, "figureEightWidth", 0, 3, 0.01).name("Figure-8 width");
  animFolder
    .add(params, "figureEightHeight", 0, 2, 0.01)
    .name("Figure-8 height");
  animFolder.add(params, "pulseSpeed", 0, 10, 0.01).name("Pulse speed");

  // const ringFolder = gui.addFolder("Rings");
  // ringFolder
  //   .add(params, "ringsVisible")
  //   .name("Visible")
  //   .onChange((v: boolean) => {
  //     ring1.visible = v;
  //     ring2.visible = v;
  //   });
  // ringFolder.add(params, "ringSpeed", 0, 0.05, 0.001).name("Rotation speed");

  const lightFolder = gui.addFolder("Glow light");
  lightFolder.add(params, "lightIntensity", 0, 5, 0.01).name("Intensity");
  lightFolder.add(params, "lightDistance", 0, 20, 0.1).name("Reach");

  gui
    .add(
      {
        log: () => console.log("Orb params:", JSON.stringify(params, null, 2)),
      },
      "log",
    )
    .name("📋 Log values to console");

  return { group, params };
}

/**
 * Call every frame from the animation loop.
 *
 * FIGURE-8 MATH traced using a lemniscate formula

 */
export function animateOrb(
  group: THREE.Group,
  params: OrbParams,
  t: number,
  orbLight: THREE.PointLight,
): void {
  const s = t * params.figureEightSpeed;

  switch (params.movementMode) {
    case "figure8":
      group.position.x = params.posX + params.figureEightWidth * Math.sin(s);
      group.position.y =
        params.posY + params.figureEightHeight * Math.sin(s) * Math.cos(s);
      group.position.z = params.posZ;
      break;

    case "vertical":
      // Clean up/down on Y, nothing else moves
      group.position.x = params.posX;
      group.position.y = params.posY + Math.sin(s) * params.verticalRange;
      group.position.z = params.posZ;
      break;

    case "horizontal":
      // Left/right on X with a gentle Z arc — orb bows toward user at centre
      // sin goes -1 → 0 → 1 → 0 → -1, cos gives the arc peak at centre
      group.position.x = params.posX + Math.sin(s) * params.horizontalRange;
      group.position.y = params.posY;
      group.position.z =
        params.posZ - Math.abs(Math.cos(s)) * params.horizontalCurve;
      break;
  }
  // Find children by name instead of fragile index
  group.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const mat = child.material as THREE.MeshStandardMaterial;

    switch (child.name) {
      case "orb-mid":
        mat.opacity =
          params.midOpacity * (0.8 + Math.sin(t * params.pulseSpeed) * 0.2);
        child.scale.setScalar(1 + Math.sin(t * params.pulseSpeed) * 0.04);
        break;
      case "orb-outer":
        mat.opacity =
          params.outerOpacity *
          (0.7 + Math.sin(t * params.pulseSpeed * 0.6 + 1) * 0.3);
        child.scale.setScalar(1 + Math.sin(t * params.pulseSpeed * 0.6) * 0.06);
        break;
      case "orb-ring1":
        child.rotation.z += params.ringSpeed;
        break;
      case "orb-ring2":
        child.rotation.x += params.ringSpeed * 0.75;
        break;
    }
  });

  // Sync light
  orbLight.position.copy(group.position);
  orbLight.intensity =
    params.lightIntensity + Math.sin(t * params.pulseSpeed) * 0.4;
  orbLight.distance = params.lightDistance;
}
