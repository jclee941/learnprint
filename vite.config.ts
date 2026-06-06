import react from "@vitejs/plugin-react";
import { defineConfig, type UserConfig } from "vite";
import type { InlineConfig } from "vitest";

interface ViteConfigWithTest extends UserConfig {
  test: InlineConfig;
}

const config: ViteConfigWithTest = {
  // GitHub Pages serves project sites under /<repo>/. The Pages workflow sets
  // VITE_BASE=/learnprint/ for correct asset URLs; default "/" keeps the BFF
  // (`npm run serve`) and dev server serving at root.
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  server: {
    // UI 개발 서버에서 /api 요청을 BFF(server/index.ts, npm run serve)로 프록시
    proxy: {
      "/api": "http://localhost:4173",
    },
  },
  preview: {
    // Cloudflare Tunnel(trycloudflare.com 등) 임의 호스트로 노출 허용 (preview 전용)
    allowedHosts: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
};

export default defineConfig(config);
