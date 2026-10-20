import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { exec, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = __dirname.endsWith("dist")
  ? __dirname
  : path.join(__dirname, "..", "dist");

// Read config.json
let config: { port?: number } = {};
try {
  let configPath = path.join(DIST_DIR, "config.json");
  if (!fs.existsSync(configPath)) {
    configPath = path.join(DIST_DIR, "..", "public", "config.json");
  }
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }
} catch {
  // Use default configuration
}

const port = Number(process.env.PORT) || config.port || 3000;

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json; charset=utf-8",
};

function getRequestBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", (err) => reject(err));
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url || "/", `http://localhost:${port}`);
    const pathname = decodeURIComponent(parsedUrl.pathname);

    // API: Execute CLI command
    if (pathname === "/api/execute-cli-command" && req.method === "POST") {
      try {
        const body = await getRequestBody(req);
        const { cliCommand } = JSON.parse(body || "{}");
        if (!cliCommand) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, message: "cliCommand is required" }),
          );
          return;
        }

        exec(cliCommand, (error) => {
          if (error) {
            console.error("CLI execution error:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: false,
                message: "Something Went Wrong!",
              }),
            );
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: true,
                message: "Successfully Executed Cli ",
              }),
            );
          }
        });
        return;
      } catch (error) {
        console.error("API error:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            message: "Something Went Wrong!",
          }),
        );
        return;
      }
    }

    // API: Kill standalone
    if (pathname === "/api/kill-standalone") {
      setTimeout(shutdownApp, 150);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "Shutting down" }));
      return;
    }

    // API: Run standalone
    if (pathname === "/api/run-standalone") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // Static file serving from DIST_DIR
    const relativePath =
      pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const safePath = path.normalize(path.join(DIST_DIR, relativePath));

    // Block path traversal
    if (!safePath.startsWith(DIST_DIR)) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Forbidden");
      return;
    }

    if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
      const ext = path.extname(safePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      fs.createReadStream(safePath).pipe(res);
      return;
    }

    // SPA fallback: return index.html for non-file routes
    const indexPath = path.join(DIST_DIR, "index.html");
    if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      fs.createReadStream(indexPath).pipe(res);
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  } catch (err) {
    console.error("Server error:", err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

const PROFILE_DIR = "/tmp/kiosk-profile";
let browserProcess: any;

server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}/`);

  const targetUrl = `http://localhost:${port}`;

  for (const bin of ["chromium", "chromium-browser", "google-chrome"]) {
    try {
      const proc = spawn(
        bin,
        [
          "--kiosk",
          `--user-data-dir=${PROFILE_DIR}`,
          "--no-first-run",
          "--disable-background-networking",
          targetUrl,
        ],
        { stdio: "inherit" },
      );

      proc.on("error", () => {
        // Ignored, fallback
      });

      proc.on("exit", (code) => {
        console.log(`${bin} exited (${code})`);
      });

      browserProcess = proc;
      break;
    } catch {
      // Try next browser binary
    }
  }

  if (!browserProcess) {
    console.error(
      "Could not auto-launch window. Please open browser manually.",
    );
  }
});

const shutdownApp = () => {
  try {
    browserProcess?.kill();
  } catch {}
  exec(`pkill -f -- --user-data-dir=${PROFILE_DIR}`, () => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdownApp);
process.on("SIGTERM", shutdownApp);
