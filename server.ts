import path from "path";
import { createServer as createViteServer } from "vite";
import { app } from "./server/app";

const PORT = Number(process.env.PORT || 3000);
const SPEC_PORT = 5000;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use((await import("express")).default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`THE DATA HUB - RESTful API Server active on port ${PORT}`);
  });

  if (process.env.NODE_ENV !== "production" && PORT !== SPEC_PORT) {
    const secondaryServer = app.listen(SPEC_PORT, "0.0.0.0", () => {
      console.log(`[Local Spec] Also listening on port ${SPEC_PORT}`);
    });
    secondaryServer.on("error", () => {});
  }

  return server;
}

startServer().catch((err) => {
  console.error("Failed to boot server:", err);
  process.exit(1);
});
