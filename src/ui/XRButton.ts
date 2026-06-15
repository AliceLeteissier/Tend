import * as THREE from "three";

/**
 * Shows the Enter VR button only when the browser supports immersive-vr.
 * Attaches the XRSession to the renderer automatically.
 */
export function initXRButton(renderer: THREE.WebGLRenderer): void {
  if (!("xr" in navigator)) return;

  navigator
    .xr!.isSessionSupported("immersive-vr")
    .then((supported) => {
      if (!supported) return;

      const btn = document.getElementById("xr-button") as HTMLButtonElement;
      btn.style.display = "block";

      btn.addEventListener("click", () => {
        navigator
          .xr!.requestSession("immersive-vr", {
            requiredFeatures: ["local-floor"],
            optionalFeatures: ["hand-tracking"],
          })
          .then((session) => renderer.xr.setSession(session))
          .catch(console.warn);
      });
    })
    .catch(() => {
      /* XR not available */
    });
}
