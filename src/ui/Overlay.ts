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

    // Preload gothic font
    document.fonts.load('400 30px "IM fell english", serif');
  }

  show(lines: string[]): void {
    // ── Split lines into 3 parts — shared between desktop and VR ──────────
    const allLines: string[] = [];
    lines.forEach((line) => {
      const words = line.split(" ");
      const third = Math.ceil(words.length / 3);
      const line1 = words.slice(0, third).join(" ");
      const line2 = words.slice(third, third * 2).join(" ");
      const line3 = words.slice(third * 2).join(" ");
      allLines.push(line1);
      if (line2) allLines.push(line2);
      if (line3) allLines.push(line3);
    });

    // ── HTML overlay — desktop ────────────────────────────────────────────
    this.el.innerHTML = `
    <div style="
      background: rgba(255, 255, 255, 0.97);
      border-radius: 24px;
      border: 1px solid rgba(5, 10, 30, 0.15);
      padding: 32px 48px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      max-width: 560px;
    ">
      ${allLines
        .map(
          (line) => `
        <p style="
          font-family: 'IM Fell English', Georgia, serif;
          font-size: 22px;
          letter-spacing: 0.1em;
          color: rgba(5, 10, 30, 0.95);
          text-align: center;
          margin: 0;
          line-height: 1.5;
        ">${line}</p>
      `,
        )
        .join("")}
    </div>
  `;
    void this.el.offsetHeight;
    this.el.style.opacity = "1";

    // ── 3D panel — VR only ───────────────────────────────────────────────
    if (!this.renderer.xr.isPresenting) return;

    this.removePanel();

    const W = 512;
    const H = 380;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);

    // White background
    ctx.fillStyle = "rgba(255, 255, 255, 0.97)";
    this.roundRect(ctx, 0, 0, W, H, 24);
    ctx.fill();

    // Border
    ctx.strokeStyle = "rgba(5, 10, 30, 0.15)";
    ctx.lineWidth = 2;
    this.roundRect(ctx, 2, 2, W - 4, H - 4, 22);
    ctx.stroke();

    // Center text vertically — reuse allLines from above
    const lineHeight = 60;
    const totalHeight = allLines.length * lineHeight;
    const startY = (H - totalHeight) / 2 + lineHeight * 0.8;

    allLines.forEach((line, i) => {
      ctx.font = '400 32px "IM Fell English", Georgia, serif';
      ctx.fillStyle = "rgba(5, 10, 30, 0.95)";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(5, 10, 30, 0.1)";
      ctx.shadowBlur = 4;
      ctx.fillText(line, W / 2, startY + i * lineHeight);
      ctx.shadowBlur = 0;
    });

    const texture = new THREE.CanvasTexture(canvas);
    this.panel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 1.05),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
      }),
    );

    this.panel.renderOrder = 999;
    this.panel.position.set(0, 1.5, -2);
    this.panel.name = "overlay-panel";
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
    this.panel.position
      .copy(this.camera.position)
      .addScaledVector(forward, 1.8);
    this.panel.position.y = this.camera.position.y + 0.3;
    this.panel.quaternion.copy(this.camera.quaternion);
  }

  private removePanel(): void {
    if (this.panel) {
      this.scene.remove(this.panel);
      this.panel = null;
    }
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  remove(): void {
    this.hide();
    this.el.remove();
  }
}
