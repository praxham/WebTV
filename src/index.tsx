import { $, serve } from "bun";
import { join, normalize } from "path";
import index from "./index.html";
import config from "../public/config.json";

const PUBLIC_DIR = join(import.meta.dir, "..", "public");

const server = serve({
  port: config.port || 3000,
  routes: {
    "/assets/*": async (req) => {
      const { pathname } = new URL(req.url);
      const filePath = normalize(
        join(PUBLIC_DIR, decodeURIComponent(pathname)),
      );

      // block path traversal like /assets/../../.env
      if (!filePath.startsWith(PUBLIC_DIR)) {
        return new Response("Forbidden", { status: 403 });
      }

      const file = Bun.file(filePath);
      if (!(await file.exists())) {
        return new Response("Not found", { status: 404 });
      }
      return new Response(file);
    },

    "/api/execute-cli-command": {
      POST: async (req) => {
        try {
          const { cliCommand } = await req.json();
          await $`sh -c ${cliCommand}`;
          return Response.json({
            success: true,
            message: "Successfully Executed Cli ",
          });
        } catch (error) {
          console.error(error);
          return Response.json({
            success: false,
            message: "Something Went Wrong!",
          });
        }
      },
    },

    "/api/kill-standalone": async (req) => {
      try {
        setTimeout(shutdownApp, 150);
        return Response.json({ success: true, message: "Shutting down" });
      } catch (error) {
        console.error(error);
        return Response.json({
          success: false,
          message: "Something Went Wrong!",
        });
      }
    },

    "/api/run-standalone": () => {
      return Response.json({ success: true });
    },

    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);

const targetUrl = `http://localhost:${server.port}`;

const PROFILE_DIR = "/tmp/kiosk-profile";
let browserProcess: any;

for (const bin of ["chromium", "chromium-browser", "google-chrome"]) {
  try {
    const proc = Bun.spawn(
      [
        bin,
        "--kiosk",
        `--user-data-dir=${PROFILE_DIR}`,
        "--no-first-run",
        "--disable-background-networking", // silences the GCM error
        targetUrl,
      ],
      { stdout: "inherit", stderr: "inherit" },
    );
    browserProcess = proc;
    proc.exited.then((code) => console.log(`${bin} exited (${code})`));
    break;
  } catch (e) {
    // Try next browser binary
  }
}

if (!browserProcess) {
  console.error(
    "Could not auto-launch window. Please open browser manually.",
  );
}

const shutdownApp = async () => {
  browserProcess?.kill();
  // catches wrappers and child processes: everything started with our profile
  await $`pkill -f -- ${"--user-data-dir=" + PROFILE_DIR}`.nothrow().quiet();
  process.exit(0);
};

process.on("SIGINT", shutdownApp);
process.on("SIGTERM", shutdownApp);
