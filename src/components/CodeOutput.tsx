"use client";

import React, { useState, useEffect, useRef } from "react";
import { Terminal, Copy, Check, Sparkles, ArrowUp, ArrowDown } from "lucide-react";
import * as Icons from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";
import { LiveProvider, LivePreview, LiveError } from "react-live";

interface CodeOutputProps {
  code: string;
  isStreaming?: boolean;
}

const AWAITING_SKETCH_CODE = `export default function App() {
  return (
    <div className="p-8 font-black uppercase border-4 border-black bg-white text-black text-center text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full">
      AWAITING SKETCH PROCESSING...
    </div>
  );
}`;

function cleanCode(raw: string): string {
  let cleaned = raw.trim();
  // Strip common vision model preamble phrases like "tsx code block:" or "1. [tsx code block]"
  cleaned = cleaned.replace(/^(?:\d+\.\s*)?(?:tsx|jsx|ts|js)?\s*code\s*block:?\s*/i, "");

  const match = cleaned.match(/```(?:tsx|jsx|typescript|javascript|html)?\s*\n?([\s\S]*?)(?:```|$)/i);
  if (match && match[1].trim()) {
    return match[1].trim();
  }
  cleaned = cleaned.replace(/^```(?:tsx|jsx|typescript|javascript|html)?\n?/i, "");
  cleaned = cleaned.replace(/\n?```\s*$/i, "");
  return cleaned;
}

// Advanced Bulletproof Syntax Normalization for LiveProvider (noInline: true)
const sanitizeForLiveProvider = (code: string): string => {
  let clean = cleanCode(code).trim();
  if (!clean) return "";

  // Replace placeholder ellipsis inside function body { ... } to prevent SyntaxError
  clean = clean.replace(/{\s*(?:\.\.\.|…)\s*}/g, `{
  return (
    <div className="max-w-2xl mx-auto p-8 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center font-mono">
      <div className="bg-yellow-400 border-2 border-black p-2 font-black uppercase text-sm mb-4 inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        WIREFRAME COMPILED
      </div>
      <p className="text-xs uppercase font-bold text-gray-700">App Component Mounted Successfully</p>
    </div>
  );
}`);

  // Find component name before stripping exports
  const defaultExportMatch =
    clean.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/) ||
    clean.match(/export\s+default\s+class\s+([A-Za-z0-9_]+)/) ||
    clean.match(/export\s+default\s+([A-Za-z0-9_]+)/);
  const mainComponentName = defaultExportMatch ? defaultExportMatch[1] : null;

  // Clean imports & exports
  clean = clean
    .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, "") // Multi-line or single-line import ... from ...
    .replace(/import\s+['"][^'"]+['"];?/g, "") // Side-effect import
    .replace(/^\s*import\b.*?$/gm, "") // Leftover imports
    .replace(/export\s+default\s+function\s+/g, "function ")
    .replace(/export\s+default\s+class\s+/g, "class ")
    .replace(/export\s+default\s+[A-Za-z0-9_]+;?/g, "")
    .replace(/export\s+(const|let|var|function|class)\s+/g, "$1 ")
    // Neutralize any hallucinated or argument-less querySelectorAll/querySelector calls
    .replace(/document\.querySelectorAll\s*\(\s*\)/g, "[]")
    .replace(/document\.querySelector\s*\(\s*\)/g, "null")
    .trim();

  // Extract candidate component names
  let compToRender = mainComponentName;
  if (!compToRender) {
    const fnMatches = [...clean.matchAll(/function\s+([A-Za-z0-9_]+)/g)].map((m) => m[1]);
    const constMatches = [
      ...clean.matchAll(/(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)?\s*=>/g),
    ].map((m) => m[1]);
    const allCandidates = [...fnMatches, ...constMatches];

    // Prefer uppercase component names (e.g., HexCentralSuite, App, Wireframe)
    const uppercaseCandidates = allCandidates.filter((name) => /^[A-Z]/.test(name));
    if (uppercaseCandidates.length > 0) {
      compToRender = uppercaseCandidates[uppercaseCandidates.length - 1];
    } else if (allCandidates.length > 0) {
      compToRender = allCandidates[allCandidates.length - 1];
    }
  }

  // Balance unclosed braces or parentheses if cut off
  const openBraces = (clean.match(/{/g) || []).length;
  const closeBraces = (clean.match(/}/g) || []).length;
  const openParens = (clean.match(/\(/g) || []).length;
  const closeParens = (clean.match(/\)/g) || []).length;

  if (openParens > closeParens) {
    clean += ")".repeat(openParens - closeParens);
  }
  if (openBraces > closeBraces) {
    clean += "\n" + "}".repeat(openBraces - closeBraces);
  }

  // Ensure render(...) is ALWAYS appended
  if (compToRender) {
    const hasReturn = /return\s*(?:\(|<|[a-zA-Z0-9_])/m.test(clean);
    if (!hasReturn) {
      clean = clean.replace(
        new RegExp(`(function\\s+${compToRender}[^{]*{[\\s\\S]*?)(})\\s*$`),
        `$1  return <div className="p-6 border-4 border-black bg-white font-mono uppercase font-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">WIREFRAME READY: <span className="text-yellow-500">${compToRender}</span></div>;\n$2`
      );
    }
    if (!clean.includes("render(")) {
      clean += `\n\nrender(<${compToRender} />);`;
    }
  } else if (/<[a-zA-Z]/.test(clean)) {
    // Raw JSX fragment / element without enclosing function
    if (!clean.includes("render(")) {
      clean = `\n\nrender(${clean});`;
    }
  } else {
    // If output is plain text, wrap in a brutalist preview container
    clean = `function FallbackWireframe() {
  return (
    <div className="w-full min-h-[400px] bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="bg-yellow-400 border-2 border-black p-2 font-mono text-xs font-black uppercase mb-4 inline-block">
        SPECIFICATION PREVIEW
      </div>
      <div className="font-mono text-xs whitespace-pre-wrap text-black leading-relaxed">
        ${JSON.stringify(clean)}
      </div>
    </div>
  );
}

render(<FallbackWireframe />);`;
  }

  // Invariant guarantee: react-live noInline mode requires /render\s*\(/
  if (!/render\s*\(/.test(clean)) {
    clean += `\n\nrender(<WireframeComponent />);`;
  }

  return clean;
};

// Brutalist Error Boundary to prevent any Next.js white screen crashes
class SafeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("LivePreview component mount notice:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full border-4 border-black bg-red-50 p-6 text-red-700 font-mono text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-red-600 text-white font-mono text-xs font-black uppercase px-2 py-1 mb-3 inline-block">
            PREVIEW RENDER NOTICE
          </div>
          <p className="font-bold mb-2">The AI component could not be mounted directly:</p>
          <pre className="whitespace-pre-wrap">{this.state.error?.message || "Unknown render error"}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Fallback component for any hallucinated icon name to prevent preview crashes
const FallbackIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Complete Icon Scope: Ensure EVERY icon from lucide-react is injected
const baseScope: Record<string, unknown> = {
  React,
  useState: React.useState,
  useEffect: React.useEffect,
  useRef: React.useRef,
  useMemo: React.useMemo,
  useCallback: React.useCallback,
  useContext: React.useContext,
  useReducer: React.useReducer,
  ...Icons,
};

// Global DOM Defense: Safeguard document.querySelectorAll from 0-argument or invalid selector crashes
if (typeof window !== "undefined" && typeof document !== "undefined") {
  const origQuerySelectorAll = document.querySelectorAll;
  if (origQuerySelectorAll) {
    document.querySelectorAll = function (selector: string) {
      if (!arguments.length || typeof selector !== "string" || !selector.trim()) {
        return [] as unknown as NodeListOf<Element>;
      }
      try {
        return origQuerySelectorAll.call(this, selector);
      } catch {
        return [] as unknown as NodeListOf<Element>;
      }
    };
  }

  const origQuerySelector = document.querySelector;
  if (origQuerySelector) {
    document.querySelector = function (selector: string) {
      if (!arguments.length || typeof selector !== "string" || !selector.trim()) {
        return null;
      }
      try {
        return origQuerySelector.call(this, selector);
      } catch {
        return null;
      }
    };
  }
}

const sandboxScope = new Proxy(baseScope, {
  get(target, prop: string) {
    if (prop in target) {
      return target[prop];
    }
    if (typeof prop === "string" && /^[A-Z]/.test(prop)) {
      return FallbackIcon;
    }
    if (typeof window !== "undefined" && prop in window) {
      const val = (window as any)[prop];
      return typeof val === "function" ? val.bind(window) : val;
    }
    return undefined;
  },
  has(target, prop: string) {
    if (prop in target) return true;
    if (typeof prop === "string" && /^[A-Z]/.test(prop)) return true;
    if (typeof window !== "undefined" && prop in window) return true;
    return false;
  },
});

export default function CodeOutput({
  code = "",
  isStreaming = false,
}: CodeOutputProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [previewReloadKey, setPreviewReloadKey] = useState(0);

  const codeContainerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const rawCode = (code || "").trim();
  const isSystemError =
    rawCode.startsWith("// SYSTEM ERROR") ||
    rawCode.startsWith("// ENGINE EXCEPTION") ||
    rawCode.startsWith("// ERROR") ||
    rawCode.includes("// Generation Error") ||
    rawCode.includes("// Stream encountered an error") ||
    rawCode.includes("// ⚠️ LOCAL OLLAMA NOT DETECTED");
  const displayCode = rawCode ? cleanCode(rawCode) : AWAITING_SKETCH_CODE;
  const safePreviewCode = rawCode ? sanitizeForLiveProvider(displayCode) : "";
  const lineCount = displayCode.split("\n").length;

  // Auto-scroll code to bottom while streaming
  useEffect(() => {
    if (isStreaming && codeContainerRef.current) {
      codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
    }
  }, [displayCode, isStreaming]);

  // Copy to clipboard with 2-second visual feedback ("COPIED ✓")
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code to clipboard:", err);
    }
  };

  return (
    <section className="flex flex-1 flex-col border-2 border-black bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden min-h-0 select-none rounded-none">
      {/* Section Heading Banner: 02 CODE OUTPUT */}
      <div className="border-b-2 border-black bg-white px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <span className="font-mono text-xs font-black bg-black text-white px-1.5 py-0.5 rounded-none">
            02
          </span>
          <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-black">
            CODE OUTPUT
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {isStreaming && (
            <span className="font-mono text-[10px] uppercase font-bold text-black bg-yellow-400 px-2 py-0.5 border border-black animate-pulse flex items-center space-x-1 rounded-none">
              <Sparkles className="w-3 h-3 text-black" />
              <span>STREAMING VIA OLLAMA...</span>
            </span>
          )}

          {/* View Toggle Tabs: < /> RAW CODE & 👁 PREVIEW */}
          <div className="flex items-center border border-black bg-white rounded-none">
            <button
              type="button"
              onClick={() => setActiveTab("code")}
              className={`font-mono text-[10px] uppercase font-bold px-2.5 py-1 flex items-center space-x-1.5 transition-colors rounded-none cursor-pointer ${
                activeTab === "code"
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              <span>&lt; /&gt; RAW CODE</span>
            </button>
            <button
              type="button"
              onClick={() => {
                // Safe Preview: only allow preview after stream finishes
                if (!isStreaming) {
                  setActiveTab("preview");
                }
              }}
              disabled={isStreaming}
              title={isStreaming ? "Preview available after stream finishes" : "Toggle Live Preview"}
              className={`font-mono text-[10px] uppercase font-bold px-2.5 py-1 flex items-center space-x-1.5 border-l border-black transition-colors rounded-none ${
                isStreaming
                  ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-500"
                  : activeTab === "preview"
                  ? "bg-yellow-400 text-black font-black cursor-pointer"
                  : "bg-white text-black hover:bg-gray-100 cursor-pointer"
              }`}
            >
              <span>👁 PREVIEW</span>
            </button>
          </div>

          <span className="font-mono text-[11px] uppercase tracking-widest text-black bg-yellow-400 px-2 py-0.5 border border-black font-bold hidden sm:inline-block rounded-none">
            REACT + TAILWIND
          </span>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex flex-1 flex-col p-4 md:p-6 overflow-hidden bg-gray-100 min-h-0">
        <div className="relative flex flex-1 flex-col border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden min-h-[550px] h-[650px] rounded-none">
          {/* Editor Window Header Bar */}
          <div className="border-b-2 border-black bg-gray-50 px-4 py-2.5 flex items-center justify-between shrink-0 font-mono text-xs text-black">
            {/* Window control marks & file tab */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className="h-3 w-3 border border-black bg-black rounded-none" />
                <span className="h-3 w-3 border border-black bg-gray-300 rounded-none" />
                <span className="h-3 w-3 border border-black bg-yellow-400 rounded-none" />
              </div>
              <div className="flex items-center space-x-1.5 font-bold uppercase pl-2 border-l border-black">
                <Terminal className="w-3.5 h-3.5 text-black" />
                <span>GeneratedComponent.tsx</span>
              </div>
            </div>

            {/* Scroll Controls & Black-Outlined "COPY TO CLIPBOARD" Button */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <button
                  type="button"
                  onClick={() => codeContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                  title="Scroll Code to Top"
                  className="px-2 py-1 font-mono text-[10px] font-black uppercase hover:bg-yellow-400 border-r border-black flex items-center space-x-1 cursor-pointer transition-colors active:bg-yellow-300"
                >
                  <ArrowUp className="w-3 h-3 stroke-[3]" />
                  <span>TOP</span>
                </button>
                <button
                  type="button"
                  onClick={() => codeContainerRef.current?.scrollTo({ top: codeContainerRef.current.scrollHeight, behavior: "smooth" })}
                  title="Scroll Code to Bottom"
                  className="px-2 py-1 font-mono text-[10px] font-black uppercase hover:bg-yellow-400 flex items-center space-x-1 cursor-pointer transition-colors active:bg-yellow-300"
                >
                  <ArrowDown className="w-3 h-3 stroke-[3]" />
                  <span>BOTTOM</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center space-x-1.5 border-2 border-black bg-white hover:bg-yellow-400 px-3 py-1 font-mono text-[11px] font-black uppercase tracking-wider text-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer rounded-none"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                    <span>COPIED ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-black" />
                    <span>COPY TO CLIPBOARD</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "code" ? (
            isStreaming && (!code || !code.trim() || code === AWAITING_SKETCH_CODE) ? (
              /* Step 2 Right Pane: Engine Loading State */
              <div className="flex-1 overflow-auto bg-white p-6 flex flex-col justify-start select-text">
                <div className="text-gray-500 font-mono text-sm leading-loose">
                  <span className="animate-pulse">_ INITIALIZING LLAMA 3.2-VISION...</span><br/>
                  <span className="animate-pulse animation-delay-200">_ EXTRACTING SPATIAL GEOMETRY...</span><br/>
                  <span className="animate-pulse animation-delay-400">_ AWAITING TSX STREAM... █</span>
                </div>
              </div>
            ) : (
              /* Syntax Highlighted Code Stream or Error Display */
              <div 
                ref={codeContainerRef}
                className="flex-1 overflow-auto bg-white flex text-left font-mono text-xs leading-relaxed select-text scroll-smooth"
              >
                <Highlight
                  theme={themes.github}
                  code={displayCode}
                  language="tsx"
                >
                  {({ style, tokens, getLineProps, getTokenProps }) => (
                    <>
                      {/* Line Numbers Gutter */}
                      <div className="py-4 px-3 bg-gray-100 border-r-2 border-black text-gray-500 font-mono text-right select-none shrink-0 min-w-[44px]">
                        {tokens.map((_, i) => (
                          <div key={i} className="leading-6">
                            {i + 1}
                          </div>
                        ))}
                      </div>

                      {/* Syntax Highlighted Code Stream (or Red Error Output) inside <pre><code> */}
                      <pre
                        className={`flex-1 p-4 overflow-x-auto font-mono leading-6 whitespace-pre ${
                          isSystemError ? "text-red-600 font-bold bg-red-50" : "text-black bg-white"
                        }`}
                        style={{
                          ...style,
                          backgroundColor: isSystemError ? "#fef2f2" : "#ffffff",
                          color: isSystemError ? "#dc2626" : undefined,
                        }}
                      >
                        <code>
                          {tokens.map((line, i) => (
                            <div key={i} {...getLineProps({ line })}>
                              {line.map((token, key) => (
                                <span
                                  key={key}
                                  {...getTokenProps({ token })}
                                  style={
                                    isSystemError
                                      ? { color: "#dc2626", fontWeight: "bold" }
                                      : undefined
                                  }
                                />
                              ))}
                            </div>
                          ))}
                        </code>
                      </pre>
                    </>
                  )}
                </Highlight>
              </div>
            )
          ) : (
            /* Dynamic Safe Live Preview with react-live */
            <div className="flex-1 overflow-hidden bg-gray-100 flex flex-col min-h-0 select-text">
              {/* Preview Control Toolbar */}
              <div className="border-b-2 border-black bg-white px-4 py-2 flex items-center justify-between shrink-0 font-mono text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold uppercase bg-yellow-400 px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[10px]">
                    REACT-LIVE PREVIEW
                  </span>
                  <span className="text-black font-bold text-[10px] bg-gray-100 px-2 py-0.5 border border-black">
                    SANDBOXED
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Viewport Width Toggles */}
                  <div className="flex items-center border border-black bg-white">
                    <button
                      type="button"
                      onClick={() => setViewport("desktop")}
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                        viewport === "desktop"
                          ? "bg-black text-white"
                          : "text-black hover:bg-gray-100"
                      }`}
                    >
                      DESKTOP (100%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewport("mobile")}
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase border-l border-black transition-colors cursor-pointer ${
                        viewport === "mobile"
                          ? "bg-black text-white"
                          : "text-black hover:bg-gray-100"
                      }`}
                    >
                      MOBILE (390PX)
                    </button>
                  </div>

                  {/* Preview Scroll Controls */}
                  <div className="flex items-center border border-black bg-white">
                    <button
                      type="button"
                      onClick={() => previewContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                      title="Scroll Preview to Top"
                      className="px-2 py-0.5 text-[10px] font-bold uppercase hover:bg-yellow-400 border-r border-black flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                      <span>TOP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => previewContainerRef.current?.scrollTo({ top: previewContainerRef.current.scrollHeight, behavior: "smooth" })}
                      title="Scroll Preview to Bottom"
                      className="px-2 py-0.5 text-[10px] font-bold uppercase hover:bg-yellow-400 flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                      <span>BOTTOM</span>
                    </button>
                  </div>

                  {/* Reload Preview Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewReloadKey((k) => k + 1)}
                    className="border border-black bg-white hover:bg-yellow-300 px-2 py-0.5 text-[10px] font-bold uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-colors cursor-pointer"
                  >
                    RELOAD
                  </button>
                </div>
              </div>

              {/* Sandboxed LiveProvider Container with Error Boundary & LiveError */}
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-neutral-200">
                {isSystemError ? (
                  <div className="w-full max-w-xl border-4 border-black bg-red-50 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black">
                    <div className="bg-red-500 text-white font-mono text-xs font-black uppercase px-2 py-1 mb-3 inline-block">
                      SYSTEM ERROR
                    </div>
                    <pre className="font-mono text-xs whitespace-pre-wrap text-red-700 leading-relaxed">
                      {rawCode}
                    </pre>
                  </div>
                ) : (
                  <div 
                    ref={previewContainerRef}
                    className="w-full min-h-[600px] border-4 border-black bg-gray-50 overflow-x-hidden overflow-y-auto relative p-6 scroll-smooth"
                  >
                    <SafeErrorBoundary key={previewReloadKey}>
                      <LiveProvider
                        code={
                          safePreviewCode ||
                          sanitizeForLiveProvider(
                            "export default function App() { return <div className='p-8 font-black uppercase border-4 border-black w-full text-center'>AWAITING SKETCH PROCESSING...</div> }"
                          )
                        }
                        scope={sandboxScope}
                        noInline={true}
                        enableTypeScript={true}
                      >
                        <div className="min-w-full min-h-full">
                          <LivePreview />
                        </div>
                        <LiveError className="bg-red-500 border-4 border-black font-mono text-white p-4 mt-4 whitespace-pre-wrap" />
                      </LiveProvider>
                    </SafeErrorBoundary>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Stats Bar Inside Editor */}
          <div className="border-t-2 border-black bg-gray-50 px-4 py-1.5 flex items-center justify-between font-mono text-[10px] text-gray-700 shrink-0 select-none">
            <div className="flex items-center space-x-3 font-bold">
              <span>LINES: {lineCount}</span>
              <span>CHARACTERS: {displayCode.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-black uppercase">
                THEME: GITHUB LIGHT / PRISM
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
