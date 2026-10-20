import plugin from "bun-plugin-tailwind";
import { cpSync, existsSync } from "fs";

// 1. Build client bundle
console.log("Building client bundle...");
const clientResult = await Bun.build({
  entrypoints: ["./src/index.html"],
  outdir: "./dist",
  plugins: [plugin],
  minify: true,
  sourcemap: "linked",
  target: "browser",
  publicPath: "/",
  env: "BUN_PUBLIC_*",
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
});

if (!clientResult.success) {
  console.error("Client build failed:", clientResult.logs);
  process.exit(1);
}

// 2. Copy public directory assets into dist
if (existsSync("public")) {
  console.log("Copying public assets to dist...");
  cpSync("public", "dist", { recursive: true });
}

// 3. Build server bundle for dist
console.log("Building server bundle...");
const serverResult = await Bun.build({
  entrypoints: ["./src/server.ts"],
  outdir: "./dist",
  target: "node",
  minify: true,
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
});

if (!serverResult.success) {
  console.error("Server build failed:", serverResult.logs);
  process.exit(1);
}

console.log("✅ Build complete! Server and client ready in ./dist");