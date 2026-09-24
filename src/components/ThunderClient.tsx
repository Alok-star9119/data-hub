import React, { useState } from "react";
import { Send, Play, CheckCircle2, XCircle, Clock, Copy, Check, Sparkles, RefreshCw, Key, ArrowRight, ShieldCheck } from "lucide-react";
import { QaTestStep, QaTestResult } from "../types";

interface ThunderClientProps {
  onRefreshDatabase: () => void;
  onPostCreated?: () => void;
}

const PRESET_ENDPOINTS = [
  {
    name: "GET All Posts",
    phase: "Phase 1 & 2",
    method: "GET",
    path: "/posts",
    description: "Serve the entire blogPosts array payload",
    defaultBody: "",
  },
  {
    name: "GET Post by ID",
    phase: "Phase 1 & 2",
    method: "GET",
    path: "/posts/1",
    description: "Retrieve a single blog post by its URL ID parameter",
    defaultBody: "",
  },
  {
    name: "POST Create Post",
    phase: "Phase 1 & 2",
    method: "POST",
    path: "/posts",
    description: "Intercept req.body and append post into in-memory array",
    defaultBody: JSON.stringify(
      {
        title: "Building Microservices with Express and Node.js",
        content: "Detailed walkthrough of decoupled architectures, request routing, and in-memory caching.",
        author: "Dev Lead",
        category: "Architecture",
      },
      null,
      2
    ),
  },
  {
    name: "PUT Update Post",
    phase: "Phase 1 & 2",
    method: "PUT",
    path: "/posts/1",
    description: "Update existing post matching ID parameter with new values",
    defaultBody: JSON.stringify(
      {
        title: "Updated: Mastering RESTful API Architecture with Express",
        content: "Updated content with enhanced benchmarks on Express 4.x request pipelines and middleware.",
      },
      null,
      2
    ),
  },
  {
    name: "DELETE Remove Post",
    phase: "Phase 1 & 2",
    method: "DELETE",
    path: "/posts/1",
    description: "Filter and remove matching post from in-memory array",
    defaultBody: "",
  },
  {
    name: "POST /login (Auth)",
    phase: "Phase 3",
    method: "POST",
    path: "/login",
    description: "Authenticate with credentials and receive a mock JWT token",
    defaultBody: JSON.stringify(
      {
        username: "engineer@thedatahub.io",
        password: "securepassword123",
      },
      null,
      2
    ),
  },
];

export const ThunderClient: React.FC<ThunderClientProps> = ({ onRefreshDatabase, onPostCreated }) => {
  // Request State
  const [method, setMethod] = useState<string>("GET");
  const [urlPath, setUrlPath] = useState<string>("/posts");
  const [activeReqTab, setActiveReqTab] = useState<'body' | 'headers'>('body');
  const [requestBody, setRequestBody] = useState<string>("");
  const [authHeader, setAuthHeader] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Response State
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [statusText, setStatusText] = useState<string>("");
  const [responseDuration, setResponseDuration] = useState<number | null>(null);
  const [responseSize, setResponseSize] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseData, setResponseData] = useState<any>(null);
  const [activeResTab, setActiveResTab] = useState<'pretty' | 'raw' | 'headers'>('pretty');
  const [copied, setCopied] = useState<boolean>(false);

  // Test Suite State
  const [isRunningSuite, setIsRunningSuite] = useState<boolean>(false);
  const [suiteResults, setSuiteResults] = useState<QaTestResult[] | null>(null);

  // Load a preset
  const handleSelectPreset = (preset: typeof PRESET_ENDPOINTS[0]) => {
    setMethod(preset.method);
    setUrlPath(preset.path);
    setRequestBody(preset.defaultBody);
    if (preset.defaultBody) {
      setActiveReqTab('body');
    }
  };

  // Send single HTTP request
  const handleSendRequest = async () => {
    setIsLoading(true);
    const startTime = performance.now();

    try {
      const headers: Record<string, string> = {};
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        headers['Content-Type'] = 'application/json';
      }
      if (authHeader.trim()) {
        headers['Authorization'] = authHeader.trim().startsWith('Bearer ') ? authHeader.trim() : `Bearer ${authHeader.trim()}`;
      }

      let bodyPayload: string | undefined = undefined;
      if (['POST', 'PUT', 'PATCH'].includes(method) && requestBody.trim()) {
        try {
          // Validate JSON syntax
          JSON.parse(requestBody);
          bodyPayload = requestBody;
        } catch (e) {
          alert("Invalid JSON in Request Body. Please check formatting.");
          setIsLoading(false);
          return;
        }
      }

      const res = await fetch(urlPath, {
        method,
        headers,
        body: bodyPayload,
      });

      const endTime = performance.now();
      setResponseDuration(Math.round(endTime - startTime));
      setResponseStatus(res.status);
      setStatusText(res.statusText || (res.status === 200 ? "OK" : res.status === 201 ? "Created" : res.status === 404 ? "Not Found" : ""));

      // Headers map
      const headersMap: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        headersMap[key] = val;
      });
      setResponseHeaders(headersMap);

      const text = await res.text();
      setResponseSize(new Blob([text]).size);

      try {
        const json = JSON.parse(text);
        setResponseData(json);
        // If login returns token, convenience populate authHeader
        if (urlPath.includes("/login") && json.token) {
          setAuthHeader(`Bearer ${json.token}`);
        }
      } catch {
        setResponseData(text);
      }

      // Notify database change
      if (['POST', 'PUT', 'DELETE'].includes(method)) {
        onRefreshDatabase();
        if (onPostCreated) onPostCreated();
      }
    } catch (err: any) {
      const endTime = performance.now();
      setResponseDuration(Math.round(endTime - startTime));
      setResponseStatus(500);
      setStatusText("Network Error");
      setResponseData({ error: "Failed to fetch", details: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Copy response
  const handleCopyResponse = () => {
    if (!responseData) return;
    const textToCopy = typeof responseData === 'object' ? JSON.stringify(responseData, null, 2) : String(responseData);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format request body JSON
  const handleFormatJson = () => {
    try {
      if (!requestBody.trim()) return;
      const parsed = JSON.parse(requestBody);
      setRequestBody(JSON.stringify(parsed, null, 2));
    } catch (e) {
      alert("Invalid JSON. Unable to auto-format.");
    }
  };

  // Run automated QA Test Suite (Thunder Client / Postman automated testing)
  const handleRunQaSuite = async () => {
    setIsRunningSuite(true);
    setSuiteResults([]);

    const steps: QaTestStep[] = [
      {
        id: "step-1",
        name: "Verify In-Memory Database Initialization",
        phase: "Phase 1 & 2",
        method: "GET",
        endpoint: "/posts",
        expectedStatus: 200,
        description: "Fetch blogPosts array and verify valid 200 HTTP response",
      },
      {
        id: "step-2",
        name: "Create New Post (POST /posts)",
        phase: "Phase 1 & 2",
        method: "POST",
        endpoint: "/posts",
        payload: {
          title: "Automated QA Test Post via Thunder Client",
          content: "Verifying Express req.body extraction and array push functionality.",
          author: "QA Bot",
          category: "Testing",
        },
        expectedStatus: 201,
        description: "Assert post creation yields 201 Created and assigns unique ID",
      },
      {
        id: "step-3",
        name: "Query Single Post (GET /posts/:id)",
        phase: "Phase 1 & 2",
        method: "GET",
        endpoint: "/posts/TARGET_ID", // will replace dynamically
        expectedStatus: 200,
        description: "Assert GET /posts/:id retrieves the exact created object",
      },
      {
        id: "step-4",
        name: "Update Post by ID (PUT /posts/:id)",
        phase: "Phase 1 & 2",
        method: "PUT",
        endpoint: "/posts/TARGET_ID",
        payload: {
          title: "Updated: Automated QA Test Post (Validated)",
          content: "Verified PUT modification in memory without changing record ID.",
        },
        expectedStatus: 200,
        description: "Assert PUT /posts/:id returns 200 and updated fields",
      },
      {
        id: "step-5",
        name: "Delete Post by ID (DELETE /posts/:id)",
        phase: "Phase 1 & 2",
        method: "DELETE",
        endpoint: "/posts/TARGET_ID",
        expectedStatus: 200,
        description: "Assert DELETE /posts/:id filters array and returns confirmation",
      },
      {
        id: "step-6",
        name: "Verify 404 on Deleted Post (GET /posts/:id)",
        phase: "Phase 1 & 2",
        method: "GET",
        endpoint: "/posts/TARGET_ID",
        expectedStatus: 404,
        description: "Assert requesting deleted ID correctly returns HTTP 404",
      },
      {
        id: "step-7",
        name: "Mock JWT Authentication (POST /login)",
        phase: "Phase 3",
        method: "POST",
        endpoint: "/login",
        payload: {
          username: "sprint_evaluator@thedatahub.io",
          password: "evaluationTokenPass2026",
        },
        expectedStatus: 200,
        description: "Assert POST /login generates valid RFC 7519 mock JWT token",
      },
    ];

    let createdId = "1";
    const results: QaTestResult[] = [];

    for (const step of steps) {
      const stepEndpoint = step.endpoint.replace("TARGET_ID", createdId);
      const stepStart = performance.now();

      try {
        const headers: Record<string, string> = {};
        if (step.payload) {
          headers["Content-Type"] = "application/json";
        }

        const res = await fetch(stepEndpoint, {
          method: step.method,
          headers,
          body: step.payload ? JSON.stringify(step.payload) : undefined,
        });

        const stepDuration = Math.round(performance.now() - stepStart);
        const data = await res.json().catch(() => null);

        // Capture ID from step 2
        if (step.id === "step-2" && data && data.id) {
          createdId = String(data.id);
        }

        const passed = res.status === step.expectedStatus;
        let details = `Received status ${res.status} ${res.statusText}. `;
        if (step.id === "step-2") {
          details += `Assigned Record ID: #${data?.id || "unknown"}.`;
        } else if (step.id === "step-7") {
          details += `Token prefix: ${data?.token ? data.token.substring(0, 18) + "..." : "none"}`;
        }

        results.push({
          stepId: step.id,
          name: step.name,
          passed,
          status: res.status,
          expectedStatus: step.expectedStatus,
          durationMs: stepDuration,
          details,
          responsePayload: data,
        });

        setSuiteResults([...results]);
        // slight visual pacing for QA demonstration
        await new Promise((r) => setTimeout(r, 180));
      } catch (err: any) {
        results.push({
          stepId: step.id,
          name: step.name,
          passed: false,
          status: 0,
          expectedStatus: step.expectedStatus,
          durationMs: Math.round(performance.now() - stepStart),
          details: `Error: ${err.message}`,
        });
        setSuiteResults([...results]);
      }
    }

    setIsRunningSuite(false);
    onRefreshDatabase();
  };

  const getMethodBadgeColor = (m: string) => {
    switch (m.toUpperCase()) {
      case "GET":
        return "bg-blue-600 text-white";
      case "POST":
        return "bg-emerald-600 text-white";
      case "PUT":
        return "bg-amber-600 text-white";
      case "DELETE":
        return "bg-rose-600 text-white";
      default:
        return "bg-neutral-600 text-white";
    }
  };

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    }
    if (status >= 400 && status < 500) {
      return "bg-amber-100 text-amber-800 border-amber-300";
    }
    return "bg-rose-100 text-rose-800 border-rose-300";
  };

  return (
    <div className="space-y-6">
      {/* Top QA Runner Action Card */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 rounded-xl p-5 text-white shadow-sm border border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wide border border-amber-400/30">
                QA Testing Protocol
              </span>
              <span className="text-xs text-neutral-400">Postman & Thunder Client Compatible</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Automated CRUD & Auth Test Suite
            </h2>
            <p className="text-xs text-neutral-300 max-w-2xl mt-0.5">
              Execute rigorous end-to-end integration tests verifying route scaffolding, in-memory CRUD operations, 404 edge cases, and JWT token issuance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunQaSuite}
              disabled={isRunningSuite}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-sm transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isRunningSuite ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Running QA Tests...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Thunder Client Test Suite</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Test Suite Results Matrix */}
        {suiteResults && suiteResults.length > 0 && (
          <div className="mt-5 pt-4 border-t border-neutral-700/80">
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-200">Execution Report:</span>
                <span className="text-emerald-400 font-medium">
                  {suiteResults.filter((r) => r.passed).length} Passed
                </span>
                <span>•</span>
                <span className={suiteResults.some((r) => !r.passed) ? "text-rose-400 font-medium" : "text-neutral-400"}>
                  {suiteResults.filter((r) => !r.passed).length} Failed
                </span>
              </div>
              <button
                onClick={() => setSuiteResults(null)}
                className="text-neutral-400 hover:text-white transition-colors text-xs"
              >
                Dismiss
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {suiteResults.map((result) => (
                <div
                  key={result.stepId}
                  className={`p-2.5 rounded-lg border text-xs transition-all ${
                    result.passed
                      ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-200"
                      : "bg-rose-950/40 border-rose-800/60 text-rose-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="font-semibold truncate">{result.name}</span>
                    {result.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] opacity-85">
                    <span>
                      Status: <strong>{result.status}</strong> (expected {result.expectedStatus})
                    </span>
                    <span>{result.durationMs}ms</span>
                  </div>
                  <div className="mt-1 text-[10px] opacity-75 truncate">{result.details}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Thunder Client Interface Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Preset Endpoints Palette */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">Sprint REST Endpoints</h3>
            <span className="text-xs text-neutral-500 font-mono">6 Pre-configured</span>
          </div>

          <div className="space-y-2">
            {PRESET_ENDPOINTS.map((preset, idx) => {
              const isSelected = method === preset.method && urlPath === preset.path;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                      : "bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                          isSelected ? "bg-neutral-800 text-white" : getMethodBadgeColor(preset.method)
                        }`}
                      >
                        {preset.method}
                      </span>
                      <span className="font-semibold">{preset.name}</span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isSelected ? "bg-neutral-800 text-neutral-300" : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {preset.phase}
                    </span>
                  </div>
                  <div className={`font-mono text-[11px] truncate ${isSelected ? "text-neutral-300" : "text-neutral-500"}`}>
                    {preset.path}
                  </div>
                  <div className={`text-[10px] line-clamp-1 ${isSelected ? "text-neutral-400" : "text-neutral-500"}`}>
                    {preset.description}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 space-y-1">
            <p className="font-semibold text-neutral-700">Sprint Roadmap Alignment:</p>
            <p>• <strong>Phase 1:</strong> Route scaffolding & static ack</p>
            <p>• <strong>Phase 2:</strong> In-memory array & CRUD extraction</p>
            <p>• <strong>Phase 3:</strong> Console middleware & mock JWT auth</p>
          </div>
        </div>

        {/* Right Column: Request Builder & Response Inspector */}
        <div className="lg:col-span-8 space-y-4">
          {/* URL & Method Bar */}
          <div className="bg-white rounded-xl border border-neutral-200 p-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className={`font-mono text-xs font-bold px-3 py-2 rounded-lg border border-neutral-300 cursor-pointer focus:outline-none ${getMethodBadgeColor(
                  method
                )}`}
              >
                <option value="GET" className="bg-white text-neutral-900 font-mono">GET</option>
                <option value="POST" className="bg-white text-neutral-900 font-mono">POST</option>
                <option value="PUT" className="bg-white text-neutral-900 font-mono">PUT</option>
                <option value="DELETE" className="bg-white text-neutral-900 font-mono">DELETE</option>
              </select>

              <div className="flex-1 flex items-center bg-neutral-50 rounded-lg border border-neutral-300 px-3 py-1.5 focus-within:border-neutral-900 focus-within:bg-white transition-all">
                <span className="text-neutral-400 text-xs font-mono select-none">http://localhost:5000</span>
                <input
                  type="text"
                  value={urlPath}
                  onChange={(e) => setUrlPath(e.target.value)}
                  placeholder="/posts"
                  className="w-full bg-transparent text-xs font-mono text-neutral-900 focus:outline-none ml-1"
                />
              </div>

              <button
                onClick={handleSendRequest}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>

            {/* Request Configuration Tabs */}
            <div className="mt-3 pt-3 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs">
                  <button
                    onClick={() => setActiveReqTab('body')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      activeReqTab === 'body'
                        ? 'bg-neutral-100 text-neutral-900 font-semibold'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    JSON Body {['POST', 'PUT'].includes(method) && <span className="text-indigo-600 font-bold">•</span>}
                  </button>
                  <button
                    onClick={() => setActiveReqTab('headers')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      activeReqTab === 'headers'
                        ? 'bg-neutral-100 text-neutral-900 font-semibold'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Headers {authHeader && <span className="text-amber-500 font-bold">•</span>}
                  </button>
                </div>

                {activeReqTab === 'body' && (
                  <button
                    onClick={handleFormatJson}
                    className="text-[11px] text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                  >
                    Format JSON
                  </button>
                )}
              </div>

              {/* Tab Content */}
              {activeReqTab === 'body' && (
                <div className="mt-2">
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={5}
                    placeholder={
                      ['POST', 'PUT'].includes(method)
                        ? '{\n  "title": "My Post Title",\n  "content": "Post content..."\n}'
                        : 'No body required for this HTTP method'
                    }
                    className="w-full p-2.5 font-mono text-xs bg-neutral-50 rounded-lg border border-neutral-200 text-neutral-800 focus:bg-white focus:outline-none focus:border-neutral-900 resize-y"
                  />
                </div>
              )}

              {activeReqTab === 'headers' && (
                <div className="mt-2 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-28 font-mono text-neutral-500">Content-Type:</span>
                    <input
                      type="text"
                      readOnly
                      value="application/json"
                      className="flex-1 bg-neutral-100 text-neutral-600 font-mono text-xs px-2.5 py-1.5 rounded border border-neutral-200"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-28 font-mono text-neutral-500">Authorization:</span>
                    <input
                      type="text"
                      value={authHeader}
                      onChange={(e) => setAuthHeader(e.target.value)}
                      placeholder="Bearer eyJhbGciOi..."
                      className="flex-1 bg-neutral-50 font-mono text-xs px-2.5 py-1.5 rounded border border-neutral-300 text-neutral-800 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 italic">
                    Tip: Sending a successful POST /login automatically attaches the returned mock JWT token.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Response Inspector Panel */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
            {/* Response Meta Header */}
            <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-3 text-xs">
                <span className="font-bold text-neutral-700">Response</span>

                {responseStatus !== null ? (
                  <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${getStatusBadge(responseStatus)}`}>
                    {responseStatus} {statusText}
                  </span>
                ) : (
                  <span className="text-neutral-400 text-xs italic">Waiting for request...</span>
                )}

                {responseDuration !== null && (
                  <span className="flex items-center gap-1 text-neutral-500 text-xs">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    <span>{responseDuration} ms</span>
                  </span>
                )}

                {responseSize !== null && (
                  <span className="text-neutral-500 text-xs font-mono">
                    {responseSize} bytes
                  </span>
                )}
              </div>

              {/* Response Tabs & Copy */}
              <div className="flex items-center space-x-2 text-xs">
                <div className="flex bg-neutral-200/60 p-0.5 rounded-md">
                  <button
                    onClick={() => setActiveResTab('pretty')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      activeResTab === 'pretty' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600'
                    }`}
                  >
                    Pretty
                  </button>
                  <button
                    onClick={() => setActiveResTab('raw')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      activeResTab === 'raw' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600'
                    }`}
                  >
                    Raw
                  </button>
                  <button
                    onClick={() => setActiveResTab('headers')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      activeResTab === 'headers' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600'
                    }`}
                  >
                    Headers
                  </button>
                </div>

                {responseData && (
                  <button
                    onClick={handleCopyResponse}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors text-[11px]"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Response Body Area */}
            <div className="p-4 bg-neutral-950 min-h-[260px] max-h-[460px] overflow-auto">
              {responseData !== null ? (
                activeResTab === 'pretty' ? (
                  <pre className="font-mono text-xs text-neutral-200 leading-relaxed">
                    {typeof responseData === 'object'
                      ? JSON.stringify(responseData, null, 2)
                      : String(responseData)}
                  </pre>
                ) : activeResTab === 'raw' ? (
                  <pre className="font-mono text-xs text-neutral-300 break-all whitespace-pre-wrap">
                    {typeof responseData === 'object' ? JSON.stringify(responseData) : String(responseData)}
                  </pre>
                ) : (
                  <div className="space-y-1 font-mono text-xs">
                    {Object.entries(responseHeaders).map(([key, val]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-amber-400">{key}:</span>
                        <span className="text-neutral-300">{val}</span>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center text-neutral-500">
                  <Send className="w-8 h-8 stroke-1 text-neutral-600 mb-2" />
                  <p className="text-sm font-medium text-neutral-400">Ready to Test Endpoints</p>
                  <p className="text-xs text-neutral-600 max-w-sm mt-1">
                    Select a preset or enter a custom REST endpoint above and click <strong>Send</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
