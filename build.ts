import plugin from "bun-plugin-tailwind";

const result = await Bun.build({
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

if (!result.success) {
  console.error(result.logs);
  process.exit(1);
}