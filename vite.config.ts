import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true, // expose on local network so a VR headset can connect
  },
  build: {
    target: 'esnext',
  },
})
