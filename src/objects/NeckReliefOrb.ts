import * as THREE from "three";

/**
 * The Pain Relief Orb — ~50 cm diameter, glowing, floating, gently orbiting.
 *
 * Returns the Group so the animation loop can move / pulse it each frame.
 * The group is placed at eye level (y ≈ 1.65) slightly north of the marker.
 *
 * Layers (inner → outer):
 *   1. Solid emissive core
 *   2. Translucent mid-shell (additive blending, pulsed)
 *   3. Atmospheric outer haze (additive blending)
 *   4–5. Two slowly counter-rotating orbit rings
 *   6. Floating label sprite
 */
export function createNeckReliefOrb(scene: THREE.Scene): THREE.Group {
  const group = new THREE.Group();
  group.position.set(0, 1.65, -1.4);
  scene.add(group);

  // ── Core ──────────────────────────────────────────────────────────────────
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 64, 64),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0x80ffcc),
      emissiveIntensity: 1.4,
      roughness: 0.05,
      metalness: 0.7,
      transparent: true,
      opacity: 0.92,
    }),
  );
  group.add(core);

  // ── Mid shell (additive glow) ──────────────────────────────────────────────
  const mid = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 48, 48),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x40ffaa),
      emissive: new THREE.Color(0x40ffaa),
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  group.add(mid);

  // ── Outer haze ────────────────────────────────────────────────────────────
  const outer = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 32, 32),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x20e888),
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  group.add(outer);

  // ── Orbit rings ───────────────────────────────────────────────────────────
  const ringGeo = new THREE.TorusGeometry(0.34, 0.012, 12, 80);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xccffee,
    emissive: new THREE.Color(0x80ffcc),
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.55,
  });

  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.rotation.x = Math.PI / 5;
  group.add(ring1);

  const ring2 = new THREE.Mesh(ringGeo, ringMat.clone());
  ring2.rotation.set(Math.PI / 2.5, Math.PI / 4, 0);
  group.add(ring2);

  // ── Station label (canvas texture, always faces camera) ───────────────────
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 512;
  labelCanvas.height = 96;
  const ctx = labelCanvas.getContext("2d")!;
  ctx.clearRect(0, 0, 512, 96);
  ctx.font = '400 16px "Share Tech Mono", "Courier New"';
  ctx.fillStyle = "rgba(180, 255, 215, 0.8)";
  ctx.textAlign = "center";
  ctx.fillText("NECK RELIEF ORB", 256, 46);
  ctx.font = '300 11px "Share Tech Mono", "Courier New"';
  ctx.fillStyle = "rgba(180, 255, 215, 0.4)";
  ctx.fillText("STATION  I", 256, 68);

  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.22),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(labelCanvas),
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  labelMesh.position.set(0, 0.55, 0);
  labelMesh.renderOrder = 1;
  group.add(labelMesh);

  return group;
}

/**
 * Call this every frame inside the animation loop.
 * @param group   The orb Group returned by createNeckReliefOrb
 * @param t       Elapsed time in seconds from THREE.Clock
 * @param orbLight  The dedicated PointLight for orb glow
 */
export function animateOrb(
  group: THREE.Group,
  t: number,
  orbLight: THREE.PointLight,
): void {
  // Lazy float + gentle horizontal orbit
  group.position.y = 1.65 + Math.sin(t * 0.8) * 0.07;
  group.position.x = Math.sin(t * 0.3) * 0.18;
  group.position.z = -1.4 + Math.cos(t * 0.3) * 0.12;

  // Mid shell pulse
  const mid = group.children[1] as THREE.Mesh;
  const midMat = mid.material as THREE.MeshStandardMaterial;
  midMat.opacity = 0.18 + Math.sin(t * 1.4) * 0.08;
  mid.scale.setScalar(1 + Math.sin(t * 1.4) * 0.04);

  // Outer haze breathe
  const outer = group.children[2] as THREE.Mesh;
  const outerMat = outer.material as THREE.MeshStandardMaterial;
  outerMat.opacity = 0.06 + Math.sin(t * 0.9 + 1) * 0.04;
  outer.scale.setScalar(1 + Math.sin(t * 0.9) * 0.06);

  // Ring rotation
  const ring1 = group.children[3] as THREE.Mesh;
  const ring2 = group.children[4] as THREE.Mesh;
  ring1.rotation.z += 0.004;
  ring2.rotation.x += 0.003;

  // Sync point light to orb world position
  orbLight.position.copy(group.position);
  orbLight.intensity = 1.5 + Math.sin(t * 1.4) * 0.4;
}
