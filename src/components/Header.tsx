import React from "react";
import { Server, Database, Terminal, Shield, RefreshCw, PlusCircle, Trash2, Cpu } from "lucide-react";

interface HeaderProps {
  activeTab: 'thunder' | 'database' | 'console' | 'docs';
  setActiveTab: (tab: 'thunder' | 'database' | 'console' | 'docs') => void;
  postCount: number;
  serverOnline: boolean;
  onSeed: () => void;
  onReset: () => void;
  isSeeding: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  postCount,
  serverOnline,
  onSeed,
  onReset,
  isSeeding,
}) => {
  return (
    <header className="border-b border-neutral-200 bg-white/95 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-sm">
              <Server className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-neutral-900 font-sans">
                  The Data Hub
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                  RESTful API Server
                </span>
              </div>
              <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
                <span>Node.js & Express</span>
                <span>•</span>
                <span className="font-mono text-neutral-600">Port 5000 / 3000</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {serverOnline ? "Online" : "Connecting..."}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Database Controller */}
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-700 font-mono">
              <Database className="w-3.5 h-3.5 text-neutral-500" />
              <span>blogPosts:</span>
              <strong className="text-neutral-900 font-semibold">{postCount}</strong>
            </div>

            <button
              onClick={onSeed}
              disabled={isSeeding}
              title="Seed 3 mock blog posts into in-memory array"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Seed DB</span>
            </button>

            <button
              onClick={onReset}
              title="Reset in-memory array to empty: let blogPosts = []"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-600 font-medium hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset ([ ])</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 border-t border-neutral-100 pt-2 pb-1 overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab('thunder')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'thunder'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>Thunder Client & QA Suite</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded ${activeTab === 'thunder' ? 'bg-neutral-800 text-amber-300' : 'bg-amber-100 text-amber-800'}`}>
              Interactive
            </span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'database'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>In-Memory DB</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded font-mono bg-neutral-100 text-neutral-600 border border-neutral-200">
              {postCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'console'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Server Console</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded font-mono bg-neutral-100 text-neutral-600 border border-neutral-200">
              Middleware
            </span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'docs'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Shield className="w-4 h-4 text-purple-400" />
            <span>API Docs & cURL</span>
          </button>
        </div>
      </div>
    </header>
  );
};
