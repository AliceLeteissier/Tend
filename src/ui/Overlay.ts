import * as THREE from "three";

export class Overlay {
  private el: HTMLDivElement;
  private panel: THREE.Mesh | null = null;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer,
  ) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    // Preload gothic font so it's ready before first show() call
    document.fonts.load('400 30px "UnifrakturMaguntia"');

    this.el = document.createElement("div");
    this.el.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 50;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 1.2s ease;
      background: transparent;
    `;
    document.body.appendChild(this.el);
  }

  show(lines: string[]): void {
    // ── HTML overlay — desktop only ──────────────────────────────────────
    this.el.innerHTML = lines
      .map(
        (line) => `
  <p style="
    font-family: 'UnifrakturMaguntia', Georgia, serif;
    font-size: 20px;
    letter-spacing: 0.15em;
    color: rgba(20, 40, 80, 0.95);
    text-align: center;
    margin: 0;
    max-width: 560px;
    line-height: 1.6;
    text-shadow:
      0 0 8px rgba(255, 255, 255, 1),
      0 0 16px rgba(255, 255, 255, 1),
      0 0 30px rgba(255, 255, 255, 1),
      0 0 50px rgba(255, 255, 255, 1),
      0 0 80px rgba(255, 255, 255, 0.9),
      0 0 120px rgba(255, 255, 255, 0.5);
  ">${line}</p>
`,
      )
      .join("");
    void this.el.offsetHeight;
    this.el.style.opacity = "1";

    // ── 3D panel — VR only ───────────────────────────────────────────────
    if (!this.renderer.xr.isPresenting) return;

    this.removePanel();

    const W = 512;
    const H = 200;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);

    lines.forEach((line, i) => {
      ctx.font = '400 30px "UnifrakturMaguntia", Georgia, serif';
      ctx.fillStyle = "rgba(5, 10, 30, 1)";
      ctx.textAlign = "center";

      // White glow behind text — same effect as desktop text-shadow
      ctx.shadowColor = "rgba(255, 255, 255, 1)";
      ctx.shadowBlur = 30;
      ctx.fillText(line, W / 2, 70 + i * 56);
      ctx.shadowBlur = 60;
      ctx.fillText(line, W / 2, 70 + i * 56);
      ctx.shadowBlur = 0; // ← reset so glow doesn't affect other draws
    });

    const texture = new THREE.CanvasTexture(canvas);
    this.panel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 0.6),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );

    this.panel.position.set(0, 1.5, -2);
    this.panel.name = "overlay-panel";
    this.panel.renderOrder = 999;
    (this.panel.material as THREE.MeshBasicMaterial).depthTest = false;
    this.scene.add(this.panel);
  }

  hide(): void {
    this.el.style.opacity = "0";
    this.removePanel();
  }

  update(): void {
    if (!this.panel) return;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
      this.camera.quaternion,
    );
    // 1.2m in front instead of 2.0 — stays in front of orb even when close
    this.panel.position
      .copy(this.camera.position)
      .addScaledVector(forward, 1.2);
    // Slightly above eye level so it doesn't overlap the orb
    this.panel.position.y = this.camera.position.y + 0.3;
    this.panel.quaternion.copy(this.camera.quaternion);
  }

  private removePanel(): void {
    if (this.panel) {
      this.scene.remove(this.panel);
      this.panel = null;
    }
  }

  remove(): void {
    this.hide();
    this.el.remove();
  }
}
