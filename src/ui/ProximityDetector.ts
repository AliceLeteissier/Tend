import * as THREE from "three";

/**
 * Watches the camera position each frame.
 * Fires onEnter once when camera gets within `radius` of `target`.
 * Fires onExit once when camera leaves again.
 * Call update() every frame.
 */
export class ProximityDetector {
  private target: THREE.Vector3;
  private radius: number;
  private inside: boolean = false;
  private onEnter: () => void;
  private onExit: () => void;

  constructor(options: {
    target: THREE.Vector3;
    radius: number;
    onEnter: () => void;
    onExit: () => void;
  }) {
    this.target = options.target;
    this.radius = options.radius;
    this.onEnter = options.onEnter;
    this.onExit = options.onExit;
  }

  update(cameraPosition: THREE.Vector3): void {
    // Only check XZ distance — ignore Y so crouching doesn't trigger exit
    const dx = cameraPosition.x - this.target.x;
    const dz = cameraPosition.z - this.target.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const isInside = distance < this.radius;

    if (isInside && !this.inside) {
      this.inside = true;
      this.onEnter();
    } else if (!isInside && this.inside) {
      this.inside = false;
      this.onExit();
    }
  }
}
