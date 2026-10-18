import plugin from "bun-plugin-tailwind";

const result = await Bun.build({
  entrypoints: ["./src/index.html"],
  outdir: "./dist",
  plugins: [plugin],
  minify: true,
  sourcemap: "linked",
  target: "browser",
  compile: true,
  publicPath: "/",
});

if (!result.success) {
  console.error(result.logs);
  process.exit(1);
}
