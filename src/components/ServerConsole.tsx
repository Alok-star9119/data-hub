import React, { useState, useEffect } from "react";
import { Terminal, Trash2, RefreshCw, Filter, ShieldCheck, Activity, Copy, Check } from "lucide-react";
import { RequestLog } from "../types";

interface ServerConsoleProps {
  logs: RequestLog[];
  isLoading: boolean;
  onRefresh: () => void;
  onClearLogs: () => void;
}

export const ServerConsole: React.FC<ServerConsoleProps> = ({
  logs,
  isLoading,
  onRefresh,
  onClearLogs,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>("ALL");
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const filteredLogs = logs.filter((log) => {
    if (selectedMethod === "ALL") return true;
    return log.method.toUpperCase() === selectedMethod.toUpperCase();
  });

  const handleCopyLogs = () => {
    const text = filteredLogs
      .map((l) => `[${l.method}] ${l.path} - ${l.formattedTime} (Status: ${l.status}, Latency: ${l.durationMs}ms)`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMethodColor = (m: string) => {
    switch (m.toUpperCase()) {
      case "GET":
        return "text-sky-400";
      case "POST":
        return "text-emerald-400";
      case "PUT":
        return "text-amber-400";
      case "DELETE":
        return "text-rose-400";
      default:
        return "text-neutral-300";
    }
  };

  const getStatusColor = (s: number) => {
    if (s >= 200 && s < 300) return "text-emerald-400";
    if (s >= 400 && s < 500) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="space-y-6">
      {/* Overview & Architecture Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wide border border-indigo-200">
                Phase 3 Custom Middleware
              </span>
              <span className="text-xs text-neutral-500 font-mono">app.use(customRequestLogger)</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mt-1">
              Live Server Terminal & Middleware Logs
            </h2>
            <p className="text-xs text-neutral-600 max-w-2xl mt-0.5">
              Custom Express middleware intercepts each incoming HTTP request, extracts the HTTP method and route path, computes the 12-hour formatted timestamp, and streams it to the Node.js stdout console: <code className="font-mono text-neutral-800 font-medium">[METHOD] /path - time</code>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Logs</span>
            </button>

            <button
              onClick={onClearLogs}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-medium text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Terminal</span>
            </button>
          </div>
        </div>

        {/* Middleware Code Snippet Spotlight */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs bg-neutral-50 p-3 rounded-lg">
          <div className="font-mono text-[11px] text-neutral-700">
            <span className="text-purple-600 font-bold">function</span>{" "}
            <span className="text-blue-600 font-bold">customRequestLogger</span>(req, res, next) &#123;{" "}
            <span className="text-emerald-700">console.log</span>(`[&#36;&#123;req.method&#125;] &#36;&#123;req.url&#125; - &#36;&#123;timeString&#125;`); next(); &#125;
          </div>
          <div className="flex items-center gap-3 text-neutral-500 text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Middleware Active
            </span>
            <span>Intercepting all routes</span>
          </div>
        </div>
      </div>

      {/* Terminal Window */}
      <div className="bg-neutral-950 rounded-xl border border-neutral-800 shadow-lg overflow-hidden font-mono">
        {/* Terminal Titlebar */}
        <div className="bg-neutral-900/90 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs text-neutral-400 font-semibold ml-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-neutral-400" />
              node server.ts (Express stdout)
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            {/* Filter */}
            <div className="flex items-center space-x-1 bg-neutral-800 px-2 py-1 rounded border border-neutral-700 text-neutral-300">
              <Filter className="w-3 h-3 text-neutral-400" />
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="bg-transparent text-[11px] text-neutral-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-neutral-900">ALL</option>
                <option value="GET" className="bg-neutral-900">GET</option>
                <option value="POST" className="bg-neutral-900">POST</option>
                <option value="PUT" className="bg-neutral-900">PUT</option>
                <option value="DELETE" className="bg-neutral-900">DELETE</option>
              </select>
            </div>

            <button
              onClick={handleCopyLogs}
              className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Terminal Log Stream Area */}
        <div className="p-4 text-xs space-y-1.5 min-h-[340px] max-h-[500px] overflow-y-auto">
          {/* System Startup banner */}
          <div className="text-neutral-500 pb-2 border-b border-neutral-900 space-y-0.5 text-[11px]">
            <p className="text-emerald-400 font-semibold">[Server Initialization] Node.js process booted.</p>
            <p className="text-neutral-400">[Express Engine] Bound to ingress gateway on Port 3000 & Port 5000 spec.</p>
            <p className="text-neutral-400">[Phase 3 Middleware] customRequestLogger attached to Express pipeline.</p>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-neutral-600">
              <Activity className="w-6 h-6 mx-auto mb-2 text-neutral-700 animate-pulse" />
              <p>No incoming HTTP requests logged yet for this filter.</p>
              <p className="text-[11px] text-neutral-700 mt-1">
                Execute requests in the Thunder Client tab to observe real-time middleware interception.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-1 px-2 rounded hover:bg-neutral-900/60 transition-colors text-[12px] group"
              >
                <div className="flex items-center space-x-2.5">
                  <span className={`font-bold ${getMethodColor(log.method)} w-14`}>
                    [{log.method}]
                  </span>
                  <span className="text-neutral-200 font-semibold">{log.path}</span>
                  <span className="text-neutral-500">-</span>
                  <span className="text-neutral-400">{log.formattedTime}</span>
                </div>

                <div className="flex items-center space-x-3 text-[11px] opacity-80 group-hover:opacity-100">
                  <span className={`font-semibold ${getStatusColor(log.status)}`}>
                    {log.status}
                  </span>
                  <span className="text-neutral-500">{log.durationMs}ms</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Terminal Status Bar */}
        <div className="bg-neutral-900 px-4 py-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center space-x-3">
            <span>Total Captured: <strong className="text-neutral-300">{logs.length}</strong></span>
            <span>•</span>
            <span>Displaying: <strong className="text-neutral-300">{filteredLogs.length}</strong></span>
          </div>
          <div className="text-[10px] text-neutral-400">
            Sprint Requirement: [METHOD] /path - time format enforced
          </div>
        </div>
      </div>
    </div>
  );
};
