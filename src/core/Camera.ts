import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export interface CameraRig {
  camera: THREE.PerspectiveCamera
  controls: OrbitControls
}

export function createCamera(renderer: THREE.WebGLRenderer): CameraRig {
  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    500
  )
  camera.position.set(0, 1.65, 5)
  camera.lookAt(0, 1.6, 0)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 1.4, 0)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.minDistance = 2
  controls.maxDistance = 14
  controls.maxPolarAngle = Math.PI * 0.58

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  })

  return { camera, controls }
}
