import * as THREE from "three";

/**
 * Dust particles drifting around the platform.
 */
export function createParticles(scene: THREE.Scene): THREE.Points {
  const COUNT = 280;
  const positions = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = 1.5 + Math.random() * 5;
    positions[i * 3] = Math.cos(theta) * r;
    positions[i * 3 + 1] = Math.random() * 6;
    positions[i * 3 + 2] = Math.sin(theta) * r;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xaaffd8,
    size: 0.018,
    transparent: true,
    opacity: 0.45,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);
  return points;
}
