# TEND — Surreal Wellness Rehabilitation

A WebXR experience about how digital habits reshape the body.

## Quick start

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in a browser, or connect a VR headset
to the same network and navigate to `http://<your-local-ip>:5173`.

## Project structure

```
tend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── public/
│   └── hdri/
│       └── README.md          ← place the .hdr file here for offline use
└── src/
    ├── main.ts                ← entry point
    ├── style.css
    ├── core/
    │   ├── Renderer.ts        ← WebGLRenderer + WebXR setup
    │   ├── Camera.ts          ← PerspectiveCamera + OrbitControls
    │   ├── Lighting.ts        ← ambient / key / fill / orb lights
    │   └── Environment.ts     ← HDRI loader + fallback sky
    ├── objects/
    │   ├── Platform.ts        ← octagonal stone platform
    │   ├── Ruins.ts           ← crumbling wall fragments + rubble
    │   ├── StainedGlass.ts    ← gothic stained-glass windows
    │   ├── FloorMarker.ts     ← "STAND HERE" ring + foot guides
    │   ├── NeckReliefOrb.ts   ← the pain relief orb (build + animate)
    │   └── Particles.ts       ← floating dust / spore particles
    ├── scene/
    │   └── World.ts           ← assembles everything + runs the loop
    └── ui/
        ├── LoadingScreen.ts   ← progress bar controller
        └── XRButton.ts        ← Enter VR button
```

## Adding the next exercise station

1. Create `src/objects/YourStation.ts` with a `createYourStation(scene)` function.
2. Import and call it in `src/scene/World.ts`.
3. If it needs per-frame updates, return the object and call its animate
   function inside the `renderer.setAnimationLoop` callback.

## Deploying to Netlify

```bash
npm run build
# drag the `dist/` folder into Netlify, or connect the GitHub repo
```

WebXR requires HTTPS. Netlify provides this automatically.
