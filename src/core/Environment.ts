import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

/**
 * Loads the Poly Haven HDRI as scene background + environment map.
 * Falls back to a hand-painted gradient sky on network failure.
 */
export function loadEnvironment(scene: THREE.Scene): Promise<void> {
  return new Promise((resolve) => {
    const loader = new RGBELoader()
    loader.load(
      'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/overcast_soil_puresky_1k.hdr',
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping
        scene.environment = texture
        scene.background  = texture
        resolve()
      },
      undefined,
      () => {
        // CORS / offline fallback
        buildFallbackSky(scene)
        resolve()
      }
    )
  })
}

function buildFallbackSky(scene: THREE.Scene): void {
  const geo = new THREE.SphereGeometry(200, 32, 16)
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color(0x8ba8c2) },
      botColor: { value: new THREE.Color(0xc8d8d0) },
    },
    vertexShader: /* glsl */`
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 topColor;
      uniform vec3 botColor;
      varying vec3 vPos;
      void main() {
        float t = clamp((vPos.y + 60.0) / 120.0, 0.0, 1.0);
        gl_FragColor = vec4(mix(botColor, topColor, t), 1.0);
      }
    `,
  })
  scene.add(new THREE.Mesh(geo, mat))
}
