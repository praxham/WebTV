import { $, serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

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
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);

try {
  await $`firefox --no-remote -P kiosk --kiosk ${server.url}`.quiet();
} catch (err) {
  try {
    // Opens Google Chrome in full-screen kiosk mode
    await $`google-chrome --kiosk ${server.url}`.quiet();
  } catch {
    try {
      // Fallback for Chromium if regular Chrome isn't installed
      await $`chromium --kiosk ${server.url}`.quiet();
    } catch (err) {
      console.log(
        "Could not auto-launch window. Please open browser manually.",
      );
    }
  }
}
