/**
 * Thin wrapper around the HTML loading screen.
 * Progress values: 0–100.
 */
export class LoadingScreen {
  private bar:    HTMLElement
  private status: HTMLElement
  private screen: HTMLElement

  constructor() {
    this.bar    = document.getElementById('loading-bar')!
    this.status = document.getElementById('loading-status')!
    this.screen = document.getElementById('loading-screen')!
  }

  setProgress(pct: number, message: string): void {
    this.bar.style.width  = `${pct}%`
    this.status.textContent = message
  }

  hide(): void {
    this.screen.classList.add('hidden')
    // Remove from DOM after transition
    this.screen.addEventListener('transitionend', () => this.screen.remove(), { once: true })
  }
}
