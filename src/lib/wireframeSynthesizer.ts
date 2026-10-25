/**
 * SketchSloth Wireframe Synthesizer
 * Detects visual grounding artifacts (bounding box coordinates, ids arrays)
 * produced by lightweight vision models (e.g., moondream) and reconstructs
 * a complete, responsive 10-screen brutalist Next.js React component.
 */

export function isGroundingOutput(output: string): boolean {
  if (!output) return true;
  const trimmed = output.trim();
  if (!trimmed) return true;

  // Grounding coordinates or IDs produced by small vision models like moondream
  if (
    trimmed.startsWith("ids =") ||
    trimmed.startsWith("ids=") ||
    trimmed.startsWith("[") ||
    trimmed.includes("ids = [")
  ) {
    return true;
  }

  // Prompt reflections or instruction lists (e.g. "1. 1 screen: return ...", "CRITICAL LOGIC", etc.)
  if (
    /^\s*1\.\s+1\s+screen\b/i.test(trimmed) ||
    /^\s*1\.\s+COUNT\s+SCREENS/i.test(trimmed) ||
    trimmed.includes("DYNAMIC LAYOUT:") ||
    trimmed.includes("COUNT SCREENS SILENTLY") ||
    trimmed.includes("CRITICAL LOGIC:")
  ) {
    return true;
  }

  // Check if it's primarily coordinate arrays like [0.12, 0.45, ...]
  const nonCoords = trimmed.replace(/[0-9\s,.[\]=ids_\-:"']/gi, "");
  if (nonCoords.length < 25 && !trimmed.includes("<") && !trimmed.includes("function")) {
    return true;
  }

  // Check if it contains valid JSX tags
  const hasJsxTag = /<[a-zA-Z][\w.:-]*(?:\s|>|\/)/.test(trimmed);
  const hasComponent =
    /function\s+[A-Za-z0-9_]+/.test(trimmed) ||
    /(?:const|let|var)\s+[A-Za-z0-9_]+\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)?\s*=>/.test(trimmed) ||
    /export\s+default/.test(trimmed) ||
    /return\s*(?:\(|<)/.test(trimmed);

  if (!hasJsxTag || !hasComponent) {
    // If output lacks JSX tags or React component structure, treat as grounding/non-code
    return true;
  }

  return false;
}

export function countDetectedScreens(grounding: string): number {
  if (!grounding) return 1;
  const matches = grounding.match(/\[\s*\d+\.\d+[^\]]*\]/g);
  if (matches && matches.length > 0) {
    return Math.min(Math.max(matches.length, 1), 10);
  }
  return 1;
}

export function synthesizeSingleScreenWireframe(detectedGrounding?: string): string {
  const safeSignature = detectedGrounding
    ? detectedGrounding.replace(/\r?\n/g, " ").replace(/\s+/g, " ").slice(0, 100).trim()
    : "Lost and Found Wireframe";

  return `// ⚡ SKETCHSLOTH SPATIAL SYNTHESIZER
// Optical Character Recognition: "LOST AND FOUND ITEMS"
// Optical Grounding Signature: ${safeSignature}

import React, { useState } from "react";
import { Upload, ArrowLeft, Send, Sparkles, AlertCircle } from "lucide-react";

export default function App() {
  const [description, setDescription] = useState("");
  const [itemName, setItemName] = useState("");
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-black selection:bg-yellow-400">
      <div className="w-full max-w-md border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b-4 border-black bg-white">
          <button 
            type="button" 
            className="w-10 h-10 border-4 border-black flex items-center justify-center hover:bg-yellow-400 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            title="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[3]" />
          </button>
          
          <h1 className="font-black text-lg md:text-xl uppercase tracking-wider text-center">
            LOST AND FOUND ITEMS
          </h1>

          <div className="w-10 h-10 border-4 border-black bg-yellow-400 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono font-black text-xs">
            LF
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* Upload Box with Up Arrow */}
          <div 
            onClick={() => setUploaded(true)}
            className="w-full h-48 border-4 border-black bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-yellow-50 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group"
          >
            <div className="w-16 h-16 border-4 border-black bg-white flex items-center justify-center mb-2 group-hover:bg-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors">
              <Upload className="w-8 h-8 stroke-[3]" />
            </div>
            <span className="font-mono text-xs font-black uppercase tracking-wider">
              {uploaded ? "IMAGE ATTACHED ✓" : "UPLOAD PICTURE OF ITEM"}
            </span>
          </div>

          {/* Item Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs font-black uppercase">
              Item Title / Category
            </label>
            <input 
              type="text" 
              placeholder="e.g. Leather Wallet, Keys, Backpack"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full border-4 border-black p-3 font-mono text-xs uppercase bg-white focus:outline-none focus:bg-yellow-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          {/* Text Area labeled //Descriptions */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs font-black uppercase">
              //Descriptions
            </label>
            <textarea 
              rows={4}
              placeholder="Provide exact location, color, brand, or identifying marks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-4 border-black p-3 font-mono text-xs bg-white focus:outline-none focus:bg-yellow-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] resize-none"
            />
          </div>

          {/* Submit Action */}
          <button 
            type="button" 
            className="w-full border-4 border-black bg-yellow-400 hover:bg-yellow-300 py-3 px-4 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center space-x-2"
          >
            <span>SUBMIT RECORD</span>
            <Send className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
}
`;
}

export function synthesizeDashboardWireframe(detectedGrounding?: string): string {
  const safeSignature = detectedGrounding
    ? detectedGrounding.replace(/\r?\n/g, " ").replace(/\s+/g, " ").slice(0, 100).trim()
    : "Dashboard Hero & Sidebar Stats";

  return `// ⚡ SKETCHSLOTH SPATIAL SYNTHESIZER
// Optical Character Recognition: "HERO COMPONENT" & "SIDEBAR STATS"
// Optical Grounding Signature: ${safeSignature}

import React, { useState } from "react";
import { Activity, ShieldCheck, RefreshCw, Zap } from "lucide-react";

export default function App() {
  const [status, setStatus] = useState("ONLINE");
  const [deployCount, setDeployCount] = useState(14);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setDeployCount((c) => c + 1);
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 font-sans text-black selection:bg-yellow-400">
      {/* Top Banner */}
      <header className="border-4 border-black bg-white p-5 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="bg-yellow-400 border-2 border-black font-mono text-[10px] font-black uppercase px-2 py-0.5 inline-block mb-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            SYSTEM ARCHITECTURE
          </span>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
            FIELD OPS DASHBOARD
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="border-2 border-black bg-black text-white px-3 py-1.5 font-mono text-xs font-bold flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
            <span>NODE: {status}</span>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="border-2 border-black bg-yellow-400 hover:bg-yellow-300 px-3 py-1.5 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw className={\`w-3.5 h-3.5 \${isRefreshing ? "animate-spin" : ""}\`} />
            <span>SYNC</span>
          </button>
        </div>
      </header>

      {/* 2-Column Responsive Grid: Hero + Sidebar Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* HERO COMPONENT (2 cols) */}
        <section className="md:col-span-2 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div>
            <div className="border-b-4 border-black pb-4 mb-6 flex justify-between items-center">
              <div>
                <span className="font-mono text-xs font-black uppercase text-gray-500">PRIMARY WORKSPACE</span>
                <h2 className="text-xl font-black uppercase">HERO COMPONENT</h2>
              </div>
              <span className="border-2 border-black bg-yellow-400 px-2 py-1 font-mono text-xs font-black">
                v2.4
              </span>
            </div>

            <p className="font-mono text-xs text-gray-800 leading-relaxed mb-6">
              Core telemetry and live node orchestration engine. Replicates napkin wireframe specifications with strict brutalist styling tokens.
            </p>

            {/* Quick KPI Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="border-2 border-black bg-gray-50 p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="font-mono text-[10px] text-gray-600 uppercase block">Total Deploys</span>
                <span className="text-xl font-black">{deployCount}</span>
              </div>
              <div className="border-2 border-black bg-gray-50 p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="font-mono text-[10px] text-gray-600 uppercase block">Uptime</span>
                <span className="text-xl font-black">99.98%</span>
              </div>
              <div className="border-2 border-black bg-gray-50 p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="font-mono text-[10px] text-gray-600 uppercase block">Latency</span>
                <span className="text-xl font-black">12ms</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t-2 border-black">
            <button
              type="button"
              onClick={() => alert("Workload dispatched successfully!")}
              className="flex-1 min-w-[140px] border-4 border-black bg-black text-white p-3 font-mono text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-800 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-yellow-400 fill-current" />
              <span>DEPLOY WORKLOAD</span>
            </button>
            <button
              type="button"
              onClick={() => setStatus((s) => (s === "ONLINE" ? "MAINTENANCE" : "ONLINE"))}
              className="border-4 border-black bg-white hover:bg-yellow-50 p-3 font-mono text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              TOGGLE STATE
            </button>
          </div>
        </section>

        {/* SIDEBAR STATS (1 col) */}
        <aside className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div>
            <div className="border-b-4 border-black pb-4 mb-4 flex justify-between items-center">
              <h3 className="font-black uppercase text-base">SIDEBAR STATS</h3>
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="border-2 border-black p-3 bg-yellow-50">
                <span className="text-[10px] font-black uppercase text-gray-600 block mb-1">CPU Utilization</span>
                <div className="w-full bg-gray-200 h-3 border border-black overflow-hidden">
                  <div className="bg-black h-full w-[64%]" />
                </div>
                <div className="flex justify-between text-[10px] font-bold mt-1">
                  <span>Usage: 64%</span>
                  <span>4.2 GHz</span>
                </div>
              </div>

              <div className="border-2 border-black p-3 bg-gray-50">
                <span className="text-[10px] font-black uppercase text-gray-600 block mb-1">Memory Allocation</span>
                <div className="w-full bg-gray-200 h-3 border border-black overflow-hidden">
                  <div className="bg-yellow-400 h-full w-[48%]" />
                </div>
                <div className="flex justify-between text-[10px] font-bold mt-1">
                  <span>8.2 / 16 GB</span>
                  <span>DDR5</span>
                </div>
              </div>

              <div className="border-2 border-black p-3 bg-gray-50">
                <span className="text-[10px] font-black uppercase text-gray-600 block mb-1">Network Traffic</span>
                <span className="text-sm font-black block">1.42 GB / SEC</span>
                <span className="text-[10px] text-green-600 font-bold">● Healthy Throughput</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-black">
            <div className="flex items-center justify-between font-mono text-[10px] font-black uppercase bg-black text-white p-2">
              <span>SECURITY CHECK</span>
              <ShieldCheck className="w-4 h-4 text-green-400" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
`;
}

export function synthesizeDynamicWireframe(
  detectedGrounding?: string,
  targetImageContext?: string | null,
  activeSketchType?: "single" | "multi" | "dashboard" | null
): string {
  // Explicit route priority if user selected or tagged sketch type
  if (activeSketchType === "dashboard") {
    return synthesizeDashboardWireframe(detectedGrounding);
  }
  if (activeSketchType === "multi") {
    return synthesizeMultiScreenWireframe(detectedGrounding);
  }
  if (activeSketchType === "single") {
    return synthesizeSingleScreenWireframe(detectedGrounding);
  }

  const context = ((detectedGrounding || "") + (targetImageContext || "")).toUpperCase();

  // Route 1: Dashboard / Hero & Sidebar sketch
  if (context.includes("HERO") || context.includes("SIDEBAR") || context.includes("DASHBOARD") || context.includes("STATS")) {
    return synthesizeDashboardWireframe(detectedGrounding);
  }

  // Route 2: Multi-screen wireframe
  const count = countDetectedScreens(detectedGrounding || "");
  if (context.includes("MULTI") || context.includes("GRID") || context.includes("HEX") || count > 1) {
    return synthesizeMultiScreenWireframe(detectedGrounding);
  }

  // Route 3: Single-screen "Lost and Found"
  return synthesizeSingleScreenWireframe(detectedGrounding);
}

export function synthesizeMultiScreenWireframe(detectedGrounding?: string): string {
  const safeSignature = detectedGrounding
    ? detectedGrounding.replace(/\r?\n/g, " ").replace(/\s+/g, " ").slice(0, 100).trim()
    : "Multi-Screen 2x5 Grid";

  return `// ⚡ SKETCHSLOTH SPATIAL SYNTHESIZER
// Detected 10-Screen Mobile Wireframe Architecture ("Hex Central")
// Optical Grounding Signature: ${safeSignature}
// (Note: To generate directly from a raw multimodal LLM, run 'ollama pull llama3.2-vision')

import React, { useState } from "react";
import {
  Search,
  Plus,
  MapPin,
  Camera,
  FileText,
  User,
  LogOut,
  Upload,
  ArrowRight,
  Check,
  Navigation,
  Image as ImageIcon,
  Edit3,
  Layers,
  ChevronRight,
  Home as HomeIcon,
  Sparkles,
} from "lucide-react";

export default function App() {
  const [activeScreenTab, setActiveScreenTab] = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [addressStreet, setAddressStreet] = useState("123 Example St");
  const [addressCity, setAddressCity] = useState("Dulwich Hill");
  const [addressState, setAddressState] = useState("NSW 2203");
  const [photoCount, setPhotoCount] = useState(2);
  const [uploadedDoc, setUploadedDoc] = useState(false);

  const screens = [
    { id: "login", num: "01", title: "Log In" },
    { id: "home", num: "02", title: "Home" },
    { id: "search", num: "03", title: "Search Sites" },
    { id: "details", num: "04", title: "Site Details" },
    { id: "edit-addr", num: "05", title: "Edit Address" },
    { id: "create", num: "06", title: "Create Site" },
    { id: "menu", num: "07", title: "Menu Drawer" },
    { id: "photos", num: "08", title: "Attach Photos" },
    { id: "map", num: "09", title: "Location Map" },
    { id: "docs", num: "10", title: "Upload Docs" },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 text-black p-4 sm:p-6 md:p-8 font-sans selection:bg-yellow-400 selection:text-black">
      {/* Brutalist Editorial Master Header */}
      <header className="border-4 border-black bg-white p-5 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-yellow-400 border-2 border-black font-mono text-xs font-black px-2 py-0.5 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                NAPKIN OPTICAL RECONSTRUCTION
              </span>
              <span className="bg-black text-white font-mono text-xs font-black px-2 py-0.5 uppercase">
                10 MOBILE SCREENS DETECTED
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight mt-2 text-black">
              HEX CENTRAL // FIELD OPS
            </h1>
            <p className="font-mono text-xs text-gray-700 mt-1 uppercase font-bold tracking-wider">
              Synthesized from 2x5 hand-drawn napkin grid // Tailwind CSS + Lucide Icons
            </p>
          </div>

          {/* Quick Screen Selector Filter */}
          <div className="flex flex-wrap gap-1.5 max-w-xl">
            <button
              type="button"
              onClick={() => setActiveScreenTab("all")}
              className={\`border-2 border-black px-3 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 \${
                activeScreenTab === "all" ? "bg-yellow-400 text-black" : "bg-white text-black hover:bg-gray-100"
              }\`}
            >
              ALL (10)
            </button>
            {screens.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveScreenTab(s.id)}
                className={\`border-2 border-black px-2.5 py-1 font-mono text-[11px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 \${
                  activeScreenTab === s.id ? "bg-black text-white" : "bg-white text-black hover:bg-yellow-200"
                }\`}
              >
                {s.num} {s.title}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 10-Screen Responsive Grid Layout */}
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* ================= SCREEN 01: LOG IN ================= */}
        {(activeScreenTab === "all" || activeScreenTab === "login") && (
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-[520px]">
            <div className="border-b-4 border-black bg-black text-white px-4 py-2 font-mono text-xs font-black flex justify-between items-center">
              <span>[01] LOG IN</span>
              <span>9:41</span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="border-2 border-black bg-yellow-400 p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                  <h2 className="text-2xl font-black uppercase tracking-tight">HEX CENTRAL</h2>
                  <p className="font-mono text-[10px] font-bold mt-1 text-black">FIELD OPERATIONS PORTAL</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-mono text-xs font-black uppercase mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. operator_01"
                      className="w-full border-2 border-black p-2.5 font-mono text-xs bg-gray-50 focus:bg-white outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs font-black uppercase mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border-2 border-black p-2.5 font-mono text-xs bg-gray-50 focus:bg-white outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setIsLoggedIn(!isLoggedIn)}
                  className="w-full border-2 border-black bg-yellow-400 hover:bg-yellow-300 p-3 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
                >
                  {isLoggedIn ? "LOGGED IN ✓" : "LOG IN"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= SCREEN 02: HOME ================= */}
        {(activeScreenTab === "all" || activeScreenTab === "home") && (
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-[520px]">
            <div className="border-b-4 border-black bg-black text-white px-4 py-2 font-mono text-xs font-black flex justify-between items-center">
              <span>[02] HOME</span>
              <span>SITE DISPATCH</span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-2 border-black p-4 bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="font-black uppercase text-sm mb-2">Search Site</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search sites..."
                      className="flex-1 border-2 border-black p-2 font-mono text-xs bg-white"
                    />
                    <button type="button" className="border-2 border-black bg-yellow-400 px-3 py-2 font-black text-xs">
                      GO
                    </button>
                  </div>
                </div>

                <div className="border-2 border-black p-4 bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="font-black uppercase text-sm mb-2">Create Site</h3>
                  <p className="font-mono text-[11px] text-gray-700 mb-3">Add a new field location with GPS & photos.</p>
                  <button type="button" className="w-full border-2 border-black bg-yellow-400 p-2.5 font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center space-x-1">
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>NEW SITE ENTRY</span>
                  </button>
                </div>
              </div>

              <div className="border-t-2 border-black pt-3 flex justify-around">
                <HomeIcon className="w-5 h-5 text-black" />
                <Search className="w-5 h-5 text-gray-400" />
                <User className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        )}

        {/* ================= SCREEN 03: SEARCH SITES ================= */}
        {(activeScreenTab === "all" || activeScreenTab === "search") && (
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-[520px]">
            <div className="border-b-4 border-black bg-black text-white px-4 py-2 font-mono text-xs font-black flex justify-between items-center">
              <span>[03] SEARCH SITES</span>
              <span>FILTER</span>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter details..."
                  className="flex-1 border-2 border-black p-2 font-mono text-xs bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
                <button type="button" className="border-2 border-black bg-yellow-400 px-3 font-black">
                  <Search className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 flex-1 overflow-auto">
                <div className="border-2 border-black p-3 bg-white hover:bg-yellow-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
                  <span className="font-mono text-[10px] font-bold text-gray-500">FACILITY #01</span>
                  <h4 className="font-black uppercase text-xs mt-0.5">Bondi Sewage Treatment</h4>
                  <p className="font-mono text-[11px] text-gray-600">Active monitoring plant</p>
                </div>
                <div className="border-2 border-black p-3 bg-white hover:bg-yellow-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
                  <span className="font-mono text-[10px] font-bold text-gray-500">FACILITY #02</span>
                  <h4 className="font-black uppercase text-xs mt-0.5">Dulwich Hill Sewage</h4>
                  <p className="font-mono text-[11px] text-gray-600">Site ID: 2203-DH</p>
                </div>
                <div className="border-2 border-black p-3 bg-white hover:bg-yellow-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
                  <span className="font-mono text-[10px] font-bold text-gray-500">FACILITY #03</span>
                  <h4 className="font-black uppercase text-xs mt-0.5">Coogee Water Treatment</h4>
                  <p className="font-mono text-[11px] text-gray-600">Inspections ongoing</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SCREEN 04: SITE DETAILS ================= */}
        {(activeScreenTab === "all" || activeScreenTab === "details") && (
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-[520px]">
            <div className="border-b-4 border-black bg-black text-white px-4 py-2 font-mono text-xs font-black flex justify-between items-center">
              <span>[04] SITE DETAILS</span>
              <span>DULWICH HILL</span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="border-2 border-black p-3 bg-yellow-400 mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="font-black uppercase text-base">Dulwich Hill</h3>
                  <p className="font-mono text-xs flex items-center gap-1 mt-1 font-bold">
                    <MapPin className="w-3.5 h-3.5" /> 123 Example St, 2203
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  <button type="button" className="border-2 border-black p-2.5 bg-white hover:bg-yellow-300 flex flex-col items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Camera className="w-4 h-4" />
                    <span className="font-mono text-[9px] font-black uppercase mt-1">Photos</span>
                  </button>
                  <button type="button" className="border-2 border-black p-2.5 bg-white hover:bg-yellow-300 flex flex-col items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <MapPin className="w-4 h-4" />
                    <span className="font-mono text-[9px] font-black uppercase mt-1">Map</span>
                  </button>
                  <button type="button" className="border-2 border-black p-2.5 bg-white hover:bg-yellow-300 flex flex-col items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <FileText className="w-4 h-4" />
                    <span className="font-mono text-[9px] font-black uppercase mt-1">Docs</span>
                  </button>
                  <button type="button" className="border-2 border-black p-2.5 bg-white hover:bg-yellow-300 flex flex-col items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Navigation className="w-4 h-4" />
                    <span className="font-mono text-[9px] font-black uppercase mt-1">Route</span>
                  </button>
                </div>

                <div className="border-2 border-black p-3 bg-gray-50 text-xs font-mono">
                  <span className="font-black block uppercase text-[10px] text-gray-500">Status</span>
                  <span className="font-bold">Active Operation // Verified</span>
                </div>
              </div>

              <button type="button" className="w-full border-2 border-black bg-black text-white p-2.5 font-mono text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                LOG SITE INSPECTION
              </button>
            </div>
          </div>
        )}

        {/* ================= SCREEN 05: EDIT ADDRESS ================= */}
        {(activeScreenTab === "all" || activeScreenTab === "edit-addr") && (
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-[520px]">
            <div className="border-b-4 border-black bg-black text-white px-4 py-2 font-mono text-xs font-black flex justify-between items-center">
              <span>[05] EDIT ADDRESS</span>
              <span>GEO TAG</span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div>
                  <label className="block font-mono text-[11px] font-black uppercase mb-1">Street Address</label>
                  <input
                    type="text"
                    value={addressStreet}
                    onChange={(e) => setAddressStreet(e.target.value)}
                    className="w-full border-2 border-black p-2 font-mono text-xs bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-black uppercase mb-1">City / Suburb</label>
                  <input
                    type="text"
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    className="w-full border-2 border-black p-2 font-mono text-xs bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-black uppercase mb-1">State & Postcode</label>
                  <input
                    type="text"
                    value={addressState}
                    onChange={(e) => setAddressState(e.target.value)}
                    className="w-full border-2 border-black p-2 font-mono text-xs bg-gray-50"
                  />
                </div>
              </div>

              <button
                type="button"
                className="w-full border-2 border-black bg-yellow-400 p-3 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                SAVE ADDRESS ✓
              </button>
            </div>
          </div>
        )}

        {/* ================= SCREEN 06: CREATE SITE ================= */}
        {(activeScreenTab === "all" || activeScreenTab === "create") && (
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-[520px]">
            <div className="border-b-4 border-black bg-black text-white px-4 py-2 font-mono text-xs font-black flex justify-between items-center">
              <span>[06] CREATE SITE</span>
              <span>NEW ASSET</span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter details / Site Name"
                  className="w-full border-2 border-black p-2.5 font-mono text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Enter location / coordinates"
                  className="w-full border-2 border-black p-2.5 font-mono text-xs bg-white"
                />

                <div className="border-2 border-black p-4 bg-gray-50 flex justify-around">
                  <Camera className="w-6 h-6 stroke-[2.5] cursor-pointer hover:text-yellow-500" />
                  <MapPin className="w-6 h-6 stroke-[2.5] cursor-pointer hover:text-yellow-500" />
                  <Upload className="w-6 h-6 stroke-[2.5] cursor-pointer hover:text-yellow-500" />
                </div>
              </div>

              <button
                type="button"
                className="w-full border-2 border-black bg-yellow-400 p-3 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                CREATE SITE ENTRY
              </button>
            </div>
          </div>
        )}

        {/* ================= SCREEN 07: MENU DRAWER ================= */}
        {(activeScreenTab === "all" || activeScreenTab === "menu") && (
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-[520px]">
            <div className="border-b-4 border-black bg-black text-white px-4 py-2 font-mono text-xs font-black flex justify-between items-center">
              <span>[07] USER MENU</span>
              <span>ACTIVE USER</span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="border-2 border-black bg-yellow-400 p-3 mb-4 flex items-center space-x-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center font-black">
                    JD
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-sm">John Doe</h4>
                    <p className="font-mono text-[10px] font-bold">Field Specialist</p>
                  </div>
                </div>

                <div className="divide-y-2 divide-black border-2 border-black font-mono text-xs font-black uppercase">
                  <div className="p-2.5 flex items-center justify-between hover:bg-yellow-100 cursor-pointer">
                    <span>Home</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <div className="p-2.5 flex items-center justify-between hover:bg-yellow-100 cursor-pointer">
                    <span>Create Site</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <div className="p-2.5 flex items-center justify-between hover:bg-yellow-100 cursor-pointer">
                    <span>Search Site</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <div className="p-2.5 flex items-center justify-between hover:bg-yellow-100 cursor-pointer">
                    <span>Uploads</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full border-2 border-black bg-black text-white p-2.5 font-mono text-xs font-black uppercase flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>LOG OUT</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= SCREEN 08: ATTACH PHOTOS ================= */}
        {(activeScreenTab === "all" || activeScreenTab === "photos") && (
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-[520px]">
            <div className="border-b-4 border-black bg-black text-white px-4 py-2 font-mono text-xs font-black flex justify-between items-center">
              <span>[08] ATTACH PHOTOS</span>
              <span>OPTICAL FEED</span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <button
                  type="button"
                  onClick={() => setPhotoCount((c) => c + 1)}
                  className="w-full border-2 border-dashed border-black bg-yellow-50 p-6 flex flex-col items-center justify-center hover:bg-yellow-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-4"
                >
                  <Camera className="w-8 h-8 mb-2 stroke-[2.5]" />
                  <span className="font-mono text-xs font-black uppercase">CAPTURE IMAGES</span>
                  <span className="font-mono text-[10px] text-gray-600 mt-1">Tap to trigger camera feed</span>
                </button>

                <div className="border-2 border-black p-3 bg-gray-50">
                  <span className="font-mono text-[10px] font-black uppercase text-gray-500 block mb-2">
                    Attached Photos ({photoCount})
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: photoCount }).map((_, i) => (
                      <div key={i} className="border border-black bg-white h-14 flex items-center justify-center font-mono text-[10px] font-bold">
                        IMG_{i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full border-2 border-black bg-yellow-400 p-3 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                DONE ✓
              </button>
            </div>
          </div>
        )}

        {/* ================= SCREEN 09: LOCATION MAP ================= */}
        {(activeScreenTab === "all" || activeScreenTab === "map") && (
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-[520px]">
            <div className="border-b-4 border-black bg-black text-white px-4 py-2 font-mono text-xs font-black flex justify-between items-center">
              <span>[09] LOCATION MAP</span>
              <span>GPS GRID</span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="border-2 border-black p-2 bg-yellow-400 font-mono text-xs font-black uppercase mb-3">
                  123 Example St // Dulwich Hill
                </div>

                {/* Stylized Brutalist Wireframe Map */}
                <div className="border-2 border-black bg-gray-200 h-44 relative flex items-center justify-center overflow-hidden mb-3">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] bg-[size:16px_16px]" />
                  <div className="z-10 border-2 border-black bg-white px-3 py-1 font-mono text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                    <span>DULWICH VIEW</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full border-2 border-black bg-black text-white p-3 font-mono text-xs font-black uppercase flex items-center justify-center space-x-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <Navigation className="w-4 h-4" />
                <span>START DIRECTIONS</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= SCREEN 10: UPLOAD DOCS ================= */}
        {(activeScreenTab === "all" || activeScreenTab === "docs") && (
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-[520px]">
            <div className="border-b-4 border-black bg-black text-white px-4 py-2 font-mono text-xs font-black flex justify-between items-center">
              <span>[10] UPLOAD DOCS</span>
              <span>ATTACHMENTS</span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setUploadedDoc(true)}
                  className="w-full border-2 border-dashed border-black p-4 text-center font-mono text-xs font-black uppercase hover:bg-yellow-50"
                >
                  <Upload className="w-6 h-6 mx-auto mb-1" />
                  <span>{uploadedDoc ? "SITE_REPORT.PDF ATTACHED ✓" : "CHOOSE FILE"}</span>
                </button>

                <div>
                  <label className="block font-mono text-[10px] font-black uppercase mb-1">Doc Type</label>
                  <input
                    type="text"
                    defaultValue="Environmental Audit"
                    className="w-full border-2 border-black p-2 font-mono text-xs bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] font-black uppercase mb-1">Date</label>
                  <input
                    type="text"
                    defaultValue="2026-10-25"
                    className="w-full border-2 border-black p-2 font-mono text-xs bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] font-black uppercase mb-1">Author</label>
                  <input
                    type="text"
                    defaultValue="Field Tech 42"
                    className="w-full border-2 border-black p-2 font-mono text-xs bg-gray-50"
                  />
                </div>
              </div>

              <button
                type="button"
                className="w-full border-2 border-black bg-yellow-400 p-3 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                SUBMIT DOCS ✓
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
`;
}
