import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author?: string;
  category?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ServerLogEntry {
  id: string;
  method: string;
  path: string;
  formattedTime: string;
  rawTimestamp: number;
  status: number;
  durationMs: number;
}

const app = express();
const PORT = 3000;
const SPEC_PORT = 5000;

// Body Parser Middleware
app.use(express.json());

// In-Memory Database for Request Logs (Accessible for the Testing Studio & UI)
const serverLogs: ServerLogEntry[] = [];

// ============================================================================
// Phase 3: Custom Middleware Engineering
// Intercepts every incoming request and logs HTTP Method, URL path, and timestamp
// to the server console: e.g., [GET] /posts - 10:05 AM
// ============================================================================
function customRequestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const method = req.method;
  const urlPath = req.originalUrl || req.url;

  // Format timestamp (e.g., "10:05 AM")
  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Print exact specified format to server console:
  console.log(`[${method}] ${urlPath} - ${timeString}`);

  // Track response completion for duration and status in UI logs
  res.on("finish", () => {
    // Only capture API, post, login, and root requests in the in-memory log buffer to prevent static asset clutter
    if (
      urlPath.startsWith("/posts") ||
      urlPath.startsWith("/login") ||
      urlPath.startsWith("/api") ||
      urlPath === "/"
    ) {
      serverLogs.unshift({
        id: Math.random().toString(36).substring(2, 9),
        method,
        path: urlPath,
        formattedTime: timeString,
        rawTimestamp: startTime,
        status: res.statusCode,
        durationMs: Date.now() - startTime,
      });

      // Keep recent 150 logs
      if (serverLogs.length > 150) {
        serverLogs.pop();
      }
    }
  });

  next();
}

app.use(customRequestLogger);

// ============================================================================
// Phase 2: In-Memory Database
// Instantiate an empty array variable (let blogPosts = [])
// ============================================================================
let blogPosts: BlogPost[] = [];

// Helper initial seed data (for quick test restoration)
const initialSeedData: BlogPost[] = [
  {
    id: "1",
    title: "Mastering RESTful API Architecture with Express",
    content: "Understanding stateful vs stateless endpoints, HTTP verbs, idempotent operations, and consistent resource naming conventions.",
    author: "Elena Rostova",
    category: "Backend Architecture",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "2",
    title: "Why In-Memory Data Stores Accelerate Prototyping",
    content: "Eliminating database connection overhead during early sprint scaffolding enables instant iteration and deterministic test runs.",
    author: "Marcus Vance",
    category: "Data Pipelines",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: "3",
    title: "Securing APIs: Mocking JWT Authentication in Express",
    content: "How Bearer token schemas work in modern fullstack pipelines, decoding base64 tokens, and validating user claims.",
    author: "Sarah Chen",
    category: "Security",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

// Helper router to mount same logic at both `/posts` and `/api/posts`
function registerPostRoutes(prefix: string) {
  // GET: Serve the entire array payload
  app.get(`${prefix}`, (req: Request, res: Response) => {
    res.status(200).json(blogPosts);
  });

  // GET /:id: Find post by ID matching ID parameter
  app.get(`${prefix}/:id`, (req: Request, res: Response) => {
    const { id } = req.params;
    const post = blogPosts.find((p) => p.id === id);

    if (!post) {
      res.status(404).json({
        error: "Post not found",
        message: `No post exists with ID: ${id}`,
        statusCode: 404,
      });
      return;
    }

    res.status(200).json(post);
  });

  // POST: Intercept and extract the payload from req.body and push it to your array
  app.post(`${prefix}`, (req: Request, res: Response) => {
    const { title, content, author, category } = req.body;

    if (!title || !content) {
      res.status(400).json({
        error: "Validation failed",
        message: "Fields 'title' and 'content' are required.",
        statusCode: 400,
      });
      return;
    }

    // Generate unique sequential or timestamp-based ID
    const maxNumericId = blogPosts.reduce((max, p) => {
      const num = parseInt(p.id, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newId = String(maxNumericId > 0 ? maxNumericId + 1 : blogPosts.length + 1);

    const newPost: BlogPost = {
      id: req.body.id ? String(req.body.id) : newId,
      title: String(title).trim(),
      content: String(content).trim(),
      author: author ? String(author).trim() : "Anonymous Engineer",
      category: category ? String(category).trim() : "General",
      createdAt: new Date().toISOString(),
    };

    blogPosts.push(newPost);

    res.status(201).json(newPost);
  });

  // PUT /:id: Update existing post matching ID
  app.put(`${prefix}/:id`, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = blogPosts.findIndex((p) => p.id === id);

    if (index === -1) {
      res.status(404).json({
        error: "Post not found",
        message: `Cannot update non-existent post with ID: ${id}`,
        statusCode: 404,
      });
      return;
    }

    const currentPost = blogPosts[index];
    const updatedPost: BlogPost = {
      ...currentPost,
      ...req.body,
      id: currentPost.id, // Preserve original ID
      updatedAt: new Date().toISOString(),
    };

    blogPosts[index] = updatedPost;

    res.status(200).json(updatedPost);
  });

  // DELETE: Filter and remove an object from the array matching the passed ID parameter
  app.delete(`${prefix}/:id`, (req: Request, res: Response) => {
    const { id } = req.params;
    const postToDelete = blogPosts.find((p) => p.id === id);

    if (!postToDelete) {
      res.status(404).json({
        error: "Post not found",
        message: `Cannot delete non-existent post with ID: ${id}`,
        statusCode: 404,
      });
      return;
    }

    blogPosts = blogPosts.filter((p) => p.id !== id);

    res.status(200).json({
      message: `Post ${id} removed successfully`,
      deletedPost: postToDelete,
      remainingCount: blogPosts.length,
      statusCode: 200,
    });
  });
}

// Register both root paths (`/posts` per sprint spec) and `/api/posts`
registerPostRoutes("/posts");
registerPostRoutes("/api/posts");

// ============================================================================
// Phase 3: Auth Scaffolding
// POST /login: Accepts credential parameters and returns a mock JSON Web Token (JWT)
// ============================================================================
function handleLogin(req: Request, res: Response) {
  const { username, email, password } = req.body || {};
  const userIdentifier = username || email || "developer@thedatahub.io";

  if (!password) {
    res.status(400).json({
      error: "Authentication error",
      message: "Password parameter is required.",
      statusCode: 400,
    });
    return;
  }

  // Generate realistic standard RFC 7519 Mock JWT Token (Header.Payload.Signature)
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: userIdentifier,
      iss: "the-data-hub-api",
      role: "lead-engineer",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      scope: ["posts:read", "posts:write", "posts:delete"],
    })
  ).toString("base64url");
  const signature = Buffer.from(`mock_sig_${Date.now()}_datahub_secret`).toString("base64url");
  const mockJwt = `${header}.${payload}.${signature}`;

  res.status(200).json({
    message: "Login successful. Mock JWT generated.",
    token: mockJwt,
    tokenType: "Bearer",
    expiresIn: 86400,
    user: {
      id: "usr_94819",
      username: userIdentifier,
      role: "lead-engineer",
    },
    statusCode: 200,
  });
}

app.post("/login", handleLogin);
app.post("/api/login", handleLogin);

// ============================================================================
// Diagnostics, Testing Utilities & QA Helper Endpoints
// ============================================================================

// Server status & architecture info
app.get("/api/status", (req: Request, res: Response) => {
  res.status(200).json({
    server: "The Data Hub RESTful API Server",
    status: "online",
    port: PORT,
    targetPort: SPEC_PORT,
    inMemoryRecords: blogPosts.length,
    endpointsCount: 5,
    authActive: true,
    customMiddlewareActive: true,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Real-time server log stream
app.get("/api/logs", (req: Request, res: Response) => {
  res.status(200).json(serverLogs);
});

app.delete("/api/logs", (req: Request, res: Response) => {
  serverLogs.length = 0;
  res.status(200).json({ message: "Server logs cleared" });
});

// Seed data helper
app.post("/api/seed", (req: Request, res: Response) => {
  blogPosts = JSON.parse(JSON.stringify(initialSeedData));
  res.status(200).json({
    message: "In-memory database seeded with 3 standard blog posts",
    count: blogPosts.length,
    posts: blogPosts,
  });
});

// Reset to empty array (let blogPosts = [])
app.post("/api/reset", (req: Request, res: Response) => {
  blogPosts = [];
  res.status(200).json({
    message: "In-memory database reset to empty array (let blogPosts = [])",
    count: 0,
    posts: [],
  });
});

// Start Server and Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Primary listener on Port 3000 (required for Cloud Run / nginx external ingress)
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n======================================================`);
    console.log(`  THE DATA HUB - RESTful API Server Active`);
    console.log(`  Listening on Port ${PORT} (Ingress Gateway)`);
    console.log(`  Phase 1: REST Endpoints Active (/posts, /posts/:id)`);
    console.log(`  Phase 2: In-Memory Database Active (let blogPosts = [])`);
    console.log(`  Phase 3: Custom Logging Middleware & Auth Active (/login)`);
    console.log(`======================================================\n`);
  });

  // Also bind to SPEC_PORT 5000 if permissible, with graceful error handling
  try {
    const secondaryServer = app.listen(SPEC_PORT, "0.0.0.0", () => {
      console.log(`  [Port Binding] Also listening on Port ${SPEC_PORT} (Local Spec Port)`);
    });
    secondaryServer.on("error", () => {
      // Ignored if port 5000 is restricted or in use
    });
  } catch (err) {
    // Port 5000 restricted in some container sandboxes
  }
}

startServer().catch((err) => {
  console.error("Failed to boot server:", err);
});
