import plugin from "bun-plugin-tailwind";
import { cpSync, existsSync, rmSync } from "fs";

const onVercel = !!process.env.VERCEL;
rmSync("dist", { recursive: true, force: true });

// 1. Client: built from index.html directly so Tailwind is processed.
//    Vercel needs it at the root of dist; locally it goes in dist/client.
const client = await Bun.build({
  entrypoints: ["./src/index.html"],
  outdir: onVercel ? "./dist" : "./dist/client",
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

if (existsSync("public")) cpSync("public", "dist", { recursive: true });

// 2. Server: only needed locally (Vercel has no server)
if (!onVercel) {
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
}

console.log("✅ Build complete");
