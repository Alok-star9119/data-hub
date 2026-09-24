import React, { useState } from "react";
import { Database, Plus, Trash2, Edit3, ArrowRight, RefreshCw, Calendar, User, Tag, FileText, CheckCircle2 } from "lucide-react";
import { BlogPost } from "../types";

interface DatabaseExplorerProps {
  posts: BlogPost[];
  isLoading: boolean;
  onRefresh: () => void;
  onSeed: () => void;
  onReset: () => void;
  onSelectPostForThunderClient: (id: string, method: 'GET' | 'PUT' | 'DELETE') => void;
}

export const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({
  posts,
  isLoading,
  onRefresh,
  onSeed,
  onReset,
  onSelectPostForThunderClient,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCategory, setNewCategory] = useState("Engineering");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick deletion directly from DB viewer
  const handleDelete = async (id: string) => {
    if (!confirm(`Confirm deletion of Post ID #${id} via DELETE /posts/${id}?`)) return;
    try {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) {
      alert("Failed to delete post");
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert("Title and content are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          author: newAuthor.trim() || "Fullstack Engineer",
          category: newCategory,
        }),
      });

      if (res.ok) {
        setNewTitle("");
        setNewContent("");
        setNewAuthor("");
        setIsCreating(false);
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to create post");
      }
    } catch (e: any) {
      alert(`Error creating post: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wide border border-emerald-200">
                Phase 2 In-Memory Store
              </span>
              <span className="text-xs text-neutral-500 font-mono">let blogPosts: BlogPost[] = []</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mt-1">
              Active Memory Storage ({posts.length} {posts.length === 1 ? "Record" : "Records"})
            </h2>
            <p className="text-xs text-neutral-600 max-w-2xl mt-0.5">
              Live inspection of the server-side memory buffer. In-memory storage provides instant response cycles for rapid REST API prototyping and testing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreating ? "Cancel" : "New Post (POST)"}</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh from GET /posts"
              className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-indigo-600" : ""}`} />
            </button>

            <button
              onClick={onSeed}
              title="Seed starter posts"
              className="px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-medium text-xs transition-colors"
            >
              Seed 3 Posts
            </button>

            <button
              onClick={onReset}
              title="Reset to empty array"
              className="px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 font-medium text-xs transition-colors"
            >
              Reset to [ ]
            </button>
          </div>
        </div>

        {/* Inline Post Creation Form */}
        {isCreating && (
          <form onSubmit={handleCreatePost} className="mt-4 pt-4 border-t border-neutral-100 bg-neutral-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Simulate HTTP POST /posts</span>
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">req.body JSON payload</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
              <div className="md:col-span-2">
                <label className="block text-neutral-600 font-medium mb-1">Post Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Express Route Handlers and Controller Architecture"
                  className="w-full bg-white border border-neutral-300 rounded px-3 py-1.5 text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">Author</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g., Jane Doe"
                  className="w-full bg-white border border-neutral-300 rounded px-3 py-1.5 text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-neutral-600 font-medium mb-1">Post Content *</label>
                <textarea
                  required
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write post content describing architectural insights..."
                  className="w-full bg-white border border-neutral-300 rounded p-2.5 text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded text-neutral-600 hover:bg-neutral-200 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Execute POST /posts</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Posts Cards Grid or Empty State */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-neutral-300 p-12 text-center">
          <Database className="w-12 h-12 text-neutral-400 mx-auto mb-3 stroke-1" />
          <h3 className="text-base font-bold text-neutral-800">In-Memory Database is Empty</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 mb-4">
            Variable <code className="bg-neutral-100 text-neutral-800 px-1 py-0.5 rounded font-mono">let blogPosts = []</code> has no elements in the current runtime environment.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={onSeed}
              className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-colors"
            >
              Seed 3 Standard Posts
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-medium transition-colors"
            >
              Create First Post (POST)
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs hover:border-neutral-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-neutral-900 text-white font-mono text-[10px] font-bold">
                      ID #{post.id}
                    </span>
                    {post.category && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-600 font-medium flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        {post.category}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {post.updatedAt ? "Modified" : "Created"}: {new Date(post.updatedAt || post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Title & Content */}
                <h3 className="text-sm font-bold text-neutral-900 line-clamp-2 mb-1.5">
                  {post.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                  {post.content}
                </p>
              </div>

              {/* Footer & Actions */}
              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-500 text-[11px] flex items-center gap-1">
                  <User className="w-3 h-3 text-neutral-400" />
                  <span>{post.author || "Anonymous"}</span>
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onSelectPostForThunderClient(post.id, 'GET')}
                    title="Load in Thunder Client (GET /posts/:id)"
                    className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600 hover:text-blue-600 transition-colors"
                  >
                    <span className="sr-only">Inspect</span>
                    <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      GET
                    </span>
                  </button>

                  <button
                    onClick={() => onSelectPostForThunderClient(post.id, 'PUT')}
                    title="Update in Thunder Client (PUT /posts/:id)"
                    className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600 hover:text-amber-600 transition-colors"
                  >
                    <span className="sr-only">Edit</span>
                    <span className="font-mono text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      PUT
                    </span>
                  </button>

                  <button
                    onClick={() => handleDelete(post.id)}
                    title="Delete post (DELETE /posts/:id)"
                    className="p-1.5 rounded hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
