import plugin from "bun-plugin-tailwind";
import { cpSync, existsSync, rmSync } from "fs";

rmSync("dist", { recursive: true, force: true });

// 1. Client bundle -> dist/client
const client = await Bun.build({
  entrypoints: ["./src/index.html"],
  outdir: "./dist/client",
  plugins: [plugin],
  minify: true,
  target: "browser",
  publicPath: "/",
  env: "BUN_PUBLIC_*",
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
});
if (!client.success) {
  console.error(client.logs);
  process.exit(1);
}

// 2. Server bundle -> dist/index.js
const server = await Bun.build({
  entrypoints: ["./src/index.tsx"],
  outdir: "./dist",
  target: "bun",
  minify: true,
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
});
if (!server.success) {
  console.error(server.logs);
  process.exit(1);
}

if (existsSync("public")) cpSync("public", "dist", { recursive: true });
console.log("✅ Build complete");
