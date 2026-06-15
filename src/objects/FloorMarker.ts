import * as THREE from "three";

/**
 * Floor marker
 * ( glowing ring, foot guides, directional arrow, "STAND HERE" label )
 */
export function createFloorMarker(scene: THREE.Scene): void {
  const markerMat = new THREE.MeshStandardMaterial({
    color: 0xd0f0e0,
    emissive: new THREE.Color(0x80ffcc),
    emissiveIntensity: 0.6,
    side: THREE.DoubleSide,
    roughness: 0.3,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xb0e8d0,
    emissive: new THREE.Color(0x60ddaa),
    emissiveIntensity: 0.4,
    side: THREE.DoubleSide,
    roughness: 0.4,
  });

  // Outer ring
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.55, 0.62, 64),
    markerMat,
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  scene.add(ring);

  // Foot guide rectangles
  for (const xOff of [-0.18, 0.18]) {
    const foot = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.28), accentMat);
    foot.rotation.x = -Math.PI / 2;
    foot.position.set(xOff, 0.05, 0.0);
    scene.add(foot);
  }

  // Directional arrow (pointing north toward the orb)
  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(0, 0.18);
  arrowShape.lineTo(0.08, 0);
  arrowShape.lineTo(0.03, 0);
  arrowShape.lineTo(0.03, -0.12);
  arrowShape.lineTo(-0.03, -0.12);
  arrowShape.lineTo(-0.03, 0);
  arrowShape.lineTo(-0.08, 0);
  arrowShape.closePath();
  const arrow = new THREE.Mesh(new THREE.ShapeGeometry(arrowShape), accentMat);
  arrow.rotation.x = -Math.PI / 2;
  arrow.position.set(0, 0.05, -0.7);
  scene.add(arrow);

  // "STAND HERE" canvas label
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 512, 128);
  ctx.font = '500 22px "Share Tech Mono", "Courier New"';
  ctx.fillStyle = "rgba(160, 240, 200, 0.7)";
  ctx.textAlign = "center";
  ctx.fillText("STAND  HERE", 256, 72);

  const labelTex = new THREE.CanvasTexture(canvas);
  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 0.35),
    new THREE.MeshBasicMaterial({
      map: labelTex,
      transparent: true,
      side: THREE.DoubleSide,
    }),
  );
  labelMesh.rotation.x = -Math.PI / 2;
  labelMesh.position.set(0, 0.05, 0.9);
  scene.add(labelMesh);
}
