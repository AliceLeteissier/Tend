import GUI from 'lil-gui'
import * as THREE from 'three'
import type { AssetPlacement } from '../objects/Ruins'

/**
 * Creates a lil-gui panel for a set of asset instances.
 * Each instance gets its own folder with x/y/z/rotY/scale sliders.
 * Changes apply live in the scene — no reload needed.
 *
 * @param label      Panel header, e.g. "Ruins" or "Windows"
 * @param instances  The THREE.Object3D instances already added to the scene
 * @param placements The matching placement config array (mutated live)
 */
export function setupAssetGUI(
  label: string,
  instances: THREE.Object3D[],
  placements: AssetPlacement[]
): void {
  const gui = new GUI({ title: `TEND — ${label}`, width: 280 })

  instances.forEach((instance, i) => {
    const p   = placements[i]
    const folder = gui.addFolder(`${label} ${i + 1}`)

    folder.add(p, 'x', -20, 20, 0.01).name('Position X').onChange((v: number) => {
      instance.position.x = v
    })
    folder.add(p, 'y', -5, 10, 0.01).name('Position Y').onChange((v: number) => {
      instance.position.y = v
    })
    folder.add(p, 'z', -20, 20, 0.01).name('Position Z').onChange((v: number) => {
      instance.position.z = v
    })
    folder.add(p, 'rotY', -Math.PI, Math.PI, 0.001).name('Rotation Y').onChange((v: number) => {
      instance.rotation.y = v
    })
    folder.add(p, 'scale', 0.001, 5, 0.001).name('Scale').onChange((v: number) => {
      instance.scale.setScalar(v)
    })

    // Print current values to console so you can copy them back into the code
    folder.add({ log: () => {
      console.log(`${label} ${i + 1}:`, JSON.stringify(p, null, 2))
    }}, 'log').name('📋 Log values to console')

    folder.open()
  })
}
