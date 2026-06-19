# DEPLOYMENT GUIDE — VIDYA AI

## 1. Build Compilation
Run the Vite packaging compile scripts:
```bash
npm run build
```
Outputs build assets under the `/dist` folder.

## 2. PWA Activation
Ensure the service worker file (`sw.js`) is registered at the entry root. Manifest files configures desktop shortcuts and offline icon caches.
