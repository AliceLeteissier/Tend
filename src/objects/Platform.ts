import * as THREE from "three";

/**
 * Loads a PBR texture set onto the platform floor.
 * Drop your texture files in public/assets/textures/floor/
 * and update the filenames in TEXTURE_PATHS below.
 */

const TEXTURE_PATHS = {
  albedo: "/assets/textures/floor/floor_albedo.jpg",
  normal: "/assets/textures/floor/floor_normal.jpg",
  roughness: "/assets/textures/floor/floor_roughness.jpg",
  ao: "/assets/textures/floor/floor_ao.jpg",
};

// How many times the texture tiles across the floor surface.
// Increase if the texture looks stretched, decrease if too busy.
const TEXTURE_REPEAT = 4;

export function createPlatform(scene: THREE.Scene): void {
  const loader = new THREE.TextureLoader();

  function loadTex(path: string, colorSpace = false): THREE.Texture {
    const tex = loader.load(path);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(TEXTURE_REPEAT, TEXTURE_REPEAT);
    // Only the albedo map should be in sRGB — all others are linear data
    if (colorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const albedoMap = loadTex(TEXTURE_PATHS.albedo, true);
  const normalMap = loadTex(TEXTURE_PATHS.normal);
  const roughnessMap = loadTex(TEXTURE_PATHS.roughness);
  const aoMap = loadTex(TEXTURE_PATHS.ao);

  // Textured floor material
  const stoneMat = new THREE.MeshStandardMaterial({
    map: albedoMap,
    normalMap: normalMap,
    roughnessMap: roughnessMap,
    aoMap: aoMap,
    roughness: 1.0, // roughnessMap drives this — keep at 1.0
    metalness: 0.0,
  });

  // Plain stone for the sides and lip (no tiling needed there)
  const sideMat = new THREE.MeshStandardMaterial({
    color: 0x9a9088,
    roughness: 0.92,
    metalness: 0.04,
  });

  // Main hexagonal body — sides use sideMat, top/bottom use stoneMat
  // CylinderGeometry face order: [side, top cap, bottom cap]
  const body = new THREE.Mesh(new THREE.CylinderGeometry(11.0, 11.4, 0.35, 6), [
    sideMat,
    stoneMat,
    sideMat,
  ]);
  body.position.y = -0.175;
  body.receiveShadow = true;
  // aoMap needs a second UV set — assign uv to uv1
  body.geometry.setAttribute("uv1", body.geometry.getAttribute("uv"));
  scene.add(body);

  // Inner recessed floor — fully textured
  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(10.0, 10.0, 0.01, 6),
    stoneMat,
  );
  inner.position.y = 0.01;
  inner.receiveShadow = true;
  inner.geometry.setAttribute("uv1", inner.geometry.getAttribute("uv"));
  scene.add(inner);
}
