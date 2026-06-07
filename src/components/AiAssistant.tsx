/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Terminal, BookOpen, AlertCircle, RefreshCw, Send, Code, Layers } from "lucide-react";
import { SUGGESTED_DEVELOPER_PROMPTS } from "../data";

export default function AiAssistant() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMarkdown, setResponseMarkdown] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("Clinical Gatekeepers");

  const [chatHistory, setChatHistory] = useState<{ query: string; reply: string; timestamp: string }[]>([]);

  const handleQuery = async (customText?: string) => {
    const finalQuery = customText || query;
    if (!finalQuery.trim()) return;

    setLoading(true);
    setQuery("");

    try {
      const response = await fetch("/api/architect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: finalQuery,
          contextCategory: activeCategory
        })
      });

      const data = await response.json();
      if (data.error) {
        setResponseMarkdown(`⚠️ Error: ${data.error}`);
      } else {
        setResponseMarkdown(data.text);
        setChatHistory((prev) => [
          {
            query: finalQuery,
            reply: data.text,
            timestamp: new Date().toLocaleTimeString().slice(0, 5)
          },
          ...prev
        ]);
      }
    } catch (e: any) {
      setResponseMarkdown(`⚠️ Request Failed: Can't establish secure endpoint query. Network offline.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* 6 Developer Templates Selector */}
      <div className="lg:col-span-4 bg-[var(--clr-bg-card)] dark:bg-[#121520] border border-neutral-154 dark:border-[#1e2335] rounded-3xl p-5 shadow-xs flex flex-col justify-between transition duration-300">
        <div className="space-y-4">
          <div>
            <h3 className="font-sans font-semibold text-neutral-800 dark:text-neutral-200 text-sm flex items-center gap-1.5">
              <BookOpen className="w-4.5 h-4.5 text-teal-600" /> Suggested Senior Blueprints
            </h3>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              Select one of the pre-drafted expert templates below to instantly generate code from CareFlow Architect.
            </p>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {SUGGESTED_DEVELOPER_PROMPTS.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  setActiveCategory(item.category);
                  setQuery(item.prompt);
                }}
                className={`p-3 border rounded-xl cursor-pointer text-left transition ${
                  query === item.prompt
                    ? "bg-teal-50/80 dark:bg-teal-950/20 border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-300 shadow-xs"
                    : "border-neutral-154 dark:border-neutral-800/80 hover:border-[#FF841A]/40 hover:bg-white dark:hover:bg-[#151824]"
                }`}
              >
                <div className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
                  {item.category}
                </div>
                <div className="font-sans font-semibold text-xs text-neutral-850 dark:text-neutral-300 leading-snug">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-154 dark:border-neutral-800 bg-[#E5DFCE]/10 dark:bg-neutral-900/40 p-3 rounded-2xl text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal mt-4 flex gap-1.5 items-start">
          <Sparkles className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
          <span>
            <strong>AI Note:</strong> Custom parameters are powered by server-side **Gemini 3.5 Flash** ensuring clean outputs with optimized security routines.
          </span>
        </div>
      </div>

      {/* Main Terminal and response area */}
      <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
        {/* Terminal Shell Panel */}
        <div className="bg-neutral-900 border border-neutral-800 text-neutral-250 rounded-2xl p-5 flex flex-col flex-1 h-[450px] overflow-y-auto">
          <div className="flex justify-between items-center text-neutral-400 font-mono text-[10px] border-b border-neutral-800 pb-2 mb-3">
            <span className="flex items-center gap-1.5 uppercase font-bold text-amber-400">
              <Terminal className="w-4.5 h-4.5" /> CareFlow Developer AI Shell
            </span>
            <span>SYSTEM CONSOLE: LIVE</span>
          </div>

          <div className="flex-1 space-y-4">
            {responseMarkdown ? (
              <div className="whitespace-pre-wrap font-mono text-tiny leading-relaxed text-neutral-200 selection:bg-teal-800 transition">
                {responseMarkdown}
              </div>
            ) : (
              <div className="text-neutral-500 italic text-tiny flex flex-col items-center justify-center h-full space-y-2">
                <Code className="w-10 h-10 text-neutral-700 animate-pulse" />
                <span className="max-w-xs text-center leading-normal">
                  No active generation loaded. Select a suggested blueprint on the left or type your own question to populate compilable code.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Query form input */}
        <div className="bg-[var(--clr-bg-card)] dark:bg-[#121520] border border-neutral-154 dark:border-[#1e2335] p-4 rounded-2xl shadow-xs flex gap-2.5 items-center transition duration-300">
          <input
            disabled={loading}
            type="text"
            className="flex-1 text-xs border border-neutral-350 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900 rounded-xl px-3.5 py-2.5 focus:outline-teal-500 font-sans dark:text-neutral-150"
            placeholder="Type your clinical engineering query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleQuery();
            }}
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => handleQuery()}
            className="px-4.5 py-2.5 bg-[#0F1E46] hover:bg-[#1A2E65] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4.5 h-4.5" /> Submit Query
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
