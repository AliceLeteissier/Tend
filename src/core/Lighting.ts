import * as THREE from 'three'

export interface SceneLights {
  ambient: THREE.AmbientLight
  key: THREE.DirectionalLight
  fill: THREE.PointLight
  /** Positioned each frame to follow the orb */
  orbGlow: THREE.PointLight
}

export function createLights(scene: THREE.Scene): SceneLights {
  const ambient = new THREE.AmbientLight(0xd0e8f0, 0.4)
  scene.add(ambient)

  const key = new THREE.DirectionalLight(0xc8e8ff, 1.2)
  key.position.set(4, 10, 5)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.near = 0.5
  key.shadow.camera.far = 40
  key.shadow.camera.left   = -12
  key.shadow.camera.right  =  12
  key.shadow.camera.top    =  12
  key.shadow.camera.bottom = -12
  key.shadow.bias = -0.001
  scene.add(key)

  // Warm candle-like fill — references gothic/18th-century mood
  const fill = new THREE.PointLight(0xffd8a0, 0.6, 20)
  fill.position.set(-3, 1, -2)
  scene.add(fill)

  // Orb reactive glow — position synced in the animation loop
  const orbGlow = new THREE.PointLight(0x80ffcc, 1.8, 5)
  scene.add(orbGlow)

  return { ambient, key, fill, orbGlow }
}
