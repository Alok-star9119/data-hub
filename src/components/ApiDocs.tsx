import React, { useState } from "react";
import { BookOpen, Copy, Check, Download, ExternalLink, Code2, ShieldCheck, Terminal, Cpu } from "lucide-react";

export const ApiDocs: React.FC = () => {
  const [copiedCurl, setCopiedCurl] = useState<string | null>(null);
  const [copiedPostman, setCopiedPostman] = useState<boolean>(false);

  const copySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCurl(id);
    setTimeout(() => setCopiedCurl(null), 2000);
  };

  const postmanCollection = {
    info: {
      name: "The Data Hub - RESTful API Server",
      description: "Comprehensive CRUD and Auth collection for The Data Hub (Node.js & Express)",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    item: [
      {
        name: "Phase 1 & 2: GET All Posts",
        request: {
          method: "GET",
          header: [],
          url: { raw: "http://localhost:5000/posts", host: ["http://localhost:5000"], path: ["posts"] },
        },
      },
      {
        name: "Phase 1 & 2: GET Post by ID",
        request: {
          method: "GET",
          header: [],
          url: { raw: "http://localhost:5000/posts/1", host: ["http://localhost:5000"], path: ["posts", "1"] },
        },
      },
      {
        name: "Phase 1 & 2: POST Create Post",
        request: {
          method: "POST",
          header: [{ key: "Content-Type", value: "application/json" }],
          body: {
            mode: "raw",
            raw: JSON.stringify({
              title: "Modern REST Architecture",
              content: "How stateless HTTP verbs model real-world business domains.",
              author: "Lead Architect",
            }, null, 2),
          },
          url: { raw: "http://localhost:5000/posts", host: ["http://localhost:5000"], path: ["posts"] },
        },
      },
      {
        name: "Phase 1 & 2: PUT Update Post",
        request: {
          method: "PUT",
          header: [{ key: "Content-Type", value: "application/json" }],
          body: {
            mode: "raw",
            raw: JSON.stringify({
              title: "Updated: Modern REST Architecture",
              content: "Expanded with middleware pipelines and idempotent updates.",
            }, null, 2),
          },
          url: { raw: "http://localhost:5000/posts/1", host: ["http://localhost:5000"], path: ["posts", "1"] },
        },
      },
      {
        name: "Phase 1 & 2: DELETE Remove Post",
        request: {
          method: "DELETE",
          header: [],
          url: { raw: "http://localhost:5000/posts/1", host: ["http://localhost:5000"], path: ["posts", "1"] },
        },
      },
      {
        name: "Phase 3: POST /login (Mock Auth)",
        request: {
          method: "POST",
          header: [{ key: "Content-Type", value: "application/json" }],
          body: {
            mode: "raw",
            raw: JSON.stringify({
              username: "engineer@thedatahub.io",
              password: "securepassword123",
            }, null, 2),
          },
          url: { raw: "http://localhost:5000/login", host: ["http://localhost:5000"], path: ["login"] },
        },
      },
    ],
  };

  const handleCopyPostman = () => {
    navigator.clipboard.writeText(JSON.stringify(postmanCollection, null, 2));
    setCopiedPostman(true);
    setTimeout(() => setCopiedPostman(false), 2000);
  };

  const handleDownloadPostman = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(postmanCollection, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "the-data-hub-postman-collection.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const CURL_EXAMPLES = [
    {
      id: "curl-get-all",
      name: "GET /posts (Serve entire array)",
      code: `curl -X GET http://localhost:5000/posts`,
    },
    {
      id: "curl-get-one",
      name: "GET /posts/1 (Fetch single record)",
      code: `curl -X GET http://localhost:5000/posts/1`,
    },
    {
      id: "curl-post",
      name: "POST /posts (Create new post with JSON body)",
      code: `curl -X POST http://localhost:5000/posts \\
  -H "Content-Type: application/json" \\
  -d '{"title": "High Performance Express Servers", "content": "Analyzing event loop delays and stream piping.", "author": "Systems Engineer"}'`,
    },
    {
      id: "curl-put",
      name: "PUT /posts/1 (Update post by ID)",
      code: `curl -X PUT http://localhost:5000/posts/1 \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Updated: Express Architecture", "content": "Updated content via PUT endpoint."}'`,
    },
    {
      id: "curl-delete",
      name: "DELETE /posts/1 (Remove record from memory)",
      code: `curl -X DELETE http://localhost:5000/posts/1`,
    },
    {
      id: "curl-login",
      name: "POST /login (Mock JWT Authentication)",
      code: `curl -X POST http://localhost:5000/login \\
  -H "Content-Type: application/json" \\
  -d '{"username": "developer@thedatahub.io", "password": "supersecretpassword"}'`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Architecture Header */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-xs font-semibold uppercase tracking-wide border border-purple-200">
                Specification & Reference
              </span>
              <span className="text-xs text-neutral-500 font-mono">REST Architecture Guide</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mt-1">
              API Blueprint & Exportable Collections
            </h2>
            <p className="text-xs text-neutral-600 max-w-2xl mt-0.5">
              Export full test collections directly to Postman or Thunder Client, or copy ready-to-run cURL snippets directly into your developer terminal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPostman}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              {copiedPostman ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPostman ? "Collection Copied!" : "Copy Postman JSON"}</span>
            </button>

            <button
              onClick={handleDownloadPostman}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-medium text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .json</span>
            </button>
          </div>
        </div>
      </div>

      {/* Phase Roadmap Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-neutral-900 text-sm">Phase 1: Scaffolding</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              P0 MANDATORY
            </span>
          </div>
          <p className="text-neutral-600 text-[11px] leading-relaxed mb-2">
            Node.js & Express framework initialized. Server bound to Port 5000 / 3000. 5 standard REST endpoints mapped for the Blog resource.
          </p>
          <div className="font-mono text-[10px] text-neutral-500 bg-neutral-50 p-2 rounded border border-neutral-100">
            GET /posts<br />
            GET /posts/:id<br />
            POST /posts<br />
            PUT /posts/:id<br />
            DELETE /posts/:id
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-neutral-900 text-sm">Phase 2: In-Memory DB</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
              P1 PRIORITY
            </span>
          </div>
          <p className="text-neutral-600 text-[11px] leading-relaxed mb-2">
            In-memory state instantiated (<code className="font-mono text-neutral-800">let blogPosts = []</code>). POST extracts <code className="font-mono">req.body</code>, GET serves array, DELETE filters matching ID.
          </p>
          <div className="font-mono text-[10px] text-neutral-500 bg-neutral-50 p-2 rounded border border-neutral-100">
            POST: push(req.body)<br />
            GET: res.json(blogPosts)<br />
            DELETE: filter(p =&gt; p.id !== id)<br />
            QA: Thunder Client Testing
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-neutral-900 text-sm">Phase 3: Middleware & Auth</span>
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">
              P2 ADVANCED
            </span>
          </div>
          <p className="text-neutral-600 text-[11px] leading-relaxed mb-2">
            Custom middleware intercepts requests and writes <code className="font-mono">[METHOD] /path - time</code> to console. Mock JWT authentication scaffolded at POST /login.
          </p>
          <div className="font-mono text-[10px] text-neutral-500 bg-neutral-50 p-2 rounded border border-neutral-100">
            [GET] /posts - 10:05 AM<br />
            POST /login: Bearer JWT<br />
            RFC 7519 Compliant Token
          </div>
        </div>
      </div>

      {/* cURL Command Reference Matrix */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-neutral-900 mb-1 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-neutral-700" />
          <span>Terminal cURL Execution Commands</span>
        </h3>
        <p className="text-xs text-neutral-500 mb-4">
          You can run these directly in your bash or zsh terminal against the active server:
        </p>

        <div className="space-y-3">
          {CURL_EXAMPLES.map((cmd) => (
            <div key={cmd.id} className="rounded-lg border border-neutral-200 overflow-hidden text-xs">
              <div className="bg-neutral-50 px-3 py-2 border-b border-neutral-200 flex items-center justify-between">
                <span className="font-semibold text-neutral-800">{cmd.name}</span>
                <button
                  onClick={() => copySnippet(cmd.id, cmd.code)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-neutral-900"
                >
                  {copiedCurl === cmd.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy cURL</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 bg-neutral-950 text-neutral-200 font-mono text-[11px] overflow-x-auto whitespace-pre">
                {cmd.code}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
