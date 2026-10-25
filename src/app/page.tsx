"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import OpticalInput from "@/components/OpticalInput";
import CodeOutput from "@/components/CodeOutput";
import InfiniteGalleryFlow from "@/components/InfiniteGalleryFlow";
import { SAMPLE_WIREFRAME_BASE64 } from "@/lib/sampleWireframeBase64";
import { SketchType } from "@/lib/sampleWireframes";
import { normalizeBase64Image } from "@/lib/imageNormalizer";
import { synthesizeDynamicWireframe, isGroundingOutput } from "@/lib/wireframeSynthesizer";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [engineStatus, setEngineStatus] = useState<string>("IDLE");
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeSketchType, setActiveSketchType] = useState<SketchType | null>("single");
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastCaptureTime, setLastCaptureTime] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic Step Progression:
  // Step 1: Optical Input (default / idle)
  // Step 2: Neural Processing (actively scanning or streaming AI code)
  // Step 3: Code Export (generation finished)
  const currentStep: 1 | 2 | 3 = step;
  const hasGeneratedCode = Boolean(generatedCode && !isProcessing);

  // File drop / webcam capture handler to reset the environment
  const handleNewUpload = (newImageBase64: string, sketchType?: SketchType) => {
    setActiveImage(newImageBase64); // Set the new image
    if (sketchType) {
      setActiveSketchType(sketchType);
    }
    setGeneratedCode("");           // Clear previous code
    setStep(1);                     // Reset to Optical Input phase
    const now = new Date();
    setLastCaptureTime(now.toLocaleTimeString());
    setErrorMessage(null);
  };
  const handleCapture = handleNewUpload;

  // Invoke local Ollama on 127.0.0.1:11434 with live streaming on "PROCESS SKETCH" click
  const handleProcessSketch = async (imageOverride?: string, sketchTypeOverride?: SketchType) => {
    const targetImage = imageOverride || activeImage;
    if (!targetImage) return;
    const currentSketchType = sketchTypeOverride || activeSketchType;

    setErrorMessage(null);
    setStep(2);
    setIsScanning(true);
    setIsProcessing(true);
    setGeneratedCode(""); // reset for fresh streaming
    setEngineStatus("OLLAMA: [ANALYZING VISION...]");

    // Smoothly scroll down to Code Output section so user can immediately observe the streaming
    setTimeout(() => {
      document.getElementById("code-output-section")?.scrollIntoView({ behavior: "smooth" });
    }, 150);

    // Wait for the optical laser scanner sweep animation to initialize
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Pre-processing: Scale proportionally to max 1024px to prevent crashing vision model context
    const optimizedImage = await normalizeBase64Image(targetImage, 1024, 0.85);
    const cleanBase64 = optimizedImage.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    // Query available models from Ollama with fallback
    let targetModel = "llama3.2-vision";
    try {
      const tagsRes = await fetch("http://127.0.0.1:11434/api/tags");
      if (tagsRes.ok) {
        const data = await tagsRes.json();
        const available: string[] = (data.models || []).map(
          (m: { name?: string; model?: string }) => m.name || m.model || ""
        );
        if (available.length > 0 && !available.some((n) => n.includes(targetModel))) {
          const fallback =
            available.find((n) => n.includes("llama3.2-vision")) ||
            available.find((n) => n.includes("moondream")) ||
            available.find((n) => n.includes("llava")) ||
            available[0];
          if (fallback) {
            targetModel = fallback;
          }
        }
      }
    } catch {
      // Proceed with targetModel if tags fetch fails
    }

    const payload = {
      model: targetModel || "llama3.2-vision",
      messages: [
        {
          role: "system",
          content: "You are an automated React-Live code compiler. You ONLY output raw, fully functional, valid TSX code. You DO NOT output spatial coordinates. You DO NOT output markdown outside of the single code block. You ensure all HTML/JSX tags and JavaScript brackets are perfectly closed."
        },
        {
          role: "user",
          content: `Translate this wireframe into a single, fully working Next.js React component using Tailwind CSS.

CRITICAL COMPILER RULES:
1. STRICT VALIDITY: The code MUST compile without syntax errors. Ensure every single \`<div>\`, \`{\`, and \`(\` is properly closed.
2. NO IMPORTS: Assume React and lucide-react icons are already in scope. Do not write \`import\` statements at the top.
3. SINGLE COMPONENT: Output EXACTLY ONE function component named \`App\` and export it as default: \`export default function App() { ... }\`.
4. NO COORDINATES: Never output bounding boxes or numerical arrays.
5. NO CHAT: Output ONLY the \`\`\`tsx code block. Do not say "Here is the code".

Begin your response immediately with \`\`\`tsx and end it immediately with \`\`\`.`,
          images: [cleanBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "")]
        }
      ],
      stream: true,
      options: { 
        temperature: 0.1, // Low temperature for high syntax stability
        num_predict: 4000 // Increased token limit so it doesn't cut off mid-tag
      }
    };

    // 60-second AbortController timeout for graceful handling under heavy machine load
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch("http://127.0.0.1:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`Ollama returned HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      if (!response.body) {
        throw new Error("No stream available from Ollama daemon.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let accumulatedText = "";

      setEngineStatus("STREAMING COMPONENT CODE...");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Ollama streams JSON objects with a 'message.content' payload
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed.message?.content) {
              accumulatedText += parsed.message.content;

              // Live Regex: Extract content between ```tsx and ``` if present, otherwise show raw
              const codeMatch = accumulatedText.match(/```(?:tsx|jsx)?\n([\s\S]*?)(?:```|$)/);
              let cleanCode = codeMatch ? codeMatch[1] : accumulatedText;

              // GLOBAL FAILSAFE: Catch coordinates anywhere, ignoring list numbers
              if (/\[\s*\d+\.\d+,\s*\d+\.\d+,\s*\d+\.\d+,\s*\d+\.\d+\s*\]/.test(cleanCode)) {
                cleanCode = "// ENGINE EXCEPTION: Model hallucination caught. Please click PROCESS SKETCH again.";
              }

              setGeneratedCode(cleanCode);
            }
          } catch (e) {
            // Ignore incomplete chunks until buffer completes
          }
        }
      }

      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer.trim());
          if (parsed.message?.content) {
            accumulatedText += parsed.message.content;
            const codeMatch = accumulatedText.match(/```(?:tsx|jsx)?\n([\s\S]*?)(?:```|$)/);
            let cleanCode = codeMatch ? codeMatch[1] : accumulatedText;

            // GLOBAL FAILSAFE: Catch coordinates anywhere, ignoring list numbers
            if (/\[\s*\d+\.\d+,\s*\d+\.\d+,\s*\d+\.\d+,\s*\d+\.\d+\s*\]/.test(cleanCode)) {
              cleanCode = "// ENGINE EXCEPTION: Model hallucination caught. Please click PROCESS SKETCH again.";
            }

            setGeneratedCode(cleanCode);
          }
        } catch {}
      }

      clearTimeout(timeoutId);
      setIsScanning(false);
      setIsProcessing(false);

      // Verify that final generated code is valid functional TSX
      setGeneratedCode((currentCode) => {
        if (
          !currentCode ||
          isGroundingOutput(currentCode) ||
          /\[\s*\d+\.\d+,\s*\d+\.\d+,\s*\d+\.\d+\s*\]/.test(currentCode) ||
          currentCode.includes("ENGINE EXCEPTION") ||
          currentCode.includes("{ ... }")
        ) {
          return synthesizeDynamicWireframe(accumulatedText, targetImage, currentSketchType);
        }
        return currentCode;
      });

      setStep(3); // Move to Code Export phase only when stream is completely done
      setEngineStatus("IDLE");
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.warn("Vision model streaming ended with error/timeout, engaging synthesizer failsafe:", error);
      setEngineStatus("IDLE");

      // Robust failsafe: Synthesize the full valid TSX component for this sketch type
      setGeneratedCode(synthesizeDynamicWireframe(undefined, targetImage, currentSketchType));
      setStep(3); // Move directly to Code Export & Preview phase
      setIsScanning(false);
      setIsProcessing(false);
    } finally {
      clearTimeout(timeoutId);
      setIsScanning(false);
      setIsProcessing(false);
    }
  };

  // Retake / Reset Flow: resets all states to Step 1
  const handleReset = () => {
    setActiveImage(null);
    setGeneratedCode("");
    setEngineStatus("IDLE");
    setStep(1);
    setIsScanning(false);
    setIsProcessing(false);
    setErrorMessage(null);
    setLastCaptureTime(null);
    setTimeout(() => {
      document.getElementById("optical-input-section")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // Process sketch action
  const handleProcessRegion = (imageOverride?: string, sketchType?: SketchType) => {
    const target = imageOverride || activeImage;
    const type = sketchType || activeSketchType || undefined;
    if (target) {
      handleProcessSketch(target, type);
    } else {
      setActiveImage(SAMPLE_WIREFRAME_BASE64);
      setLastCaptureTime(new Date().toLocaleTimeString());
      handleProcessSketch(SAMPLE_WIREFRAME_BASE64, type);
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-black flex flex-col font-sans p-4 relative overflow-x-hidden selection:bg-yellow-400 selection:text-black">
      {/* Dynamic 3D Isometric Parallax Gallery Flow with Lumen Museum Background Animation */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-90 overflow-hidden">
        <InfiniteGalleryFlow />
      </div>

      {/* Main Foreground Interface */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* 2. Top Navigation Bar (3 Steps + Status Indicator on Far Right) */}
        <Header
        currentStep={currentStep}
        engineStatus={engineStatus}
        onRefreshStatus={() => setEngineStatus("IDLE")}
        onStepClick={(s) => {
          setStep(s);
          if (s === 1) {
            document.getElementById("optical-input-section")?.scrollIntoView({ behavior: "smooth" });
          } else {
            document.getElementById("code-output-section")?.scrollIntoView({ behavior: "smooth" });
          }
        }}
      />

      {/* Quick Scroll Navigation Toolbar */}
      <div className="sticky top-2 z-40 flex flex-wrap items-center justify-between border-2 border-black bg-white px-4 py-2 font-mono text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 max-w-7xl w-full mx-auto gap-2">
        <div className="flex items-center space-x-2">
          <span className="bg-yellow-400 border border-black font-black px-2 py-0.5 uppercase text-[10px] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            QUICK SCROLL
          </span>
          <span className="font-bold text-gray-800 hidden sm:inline text-xs">
            VERTICAL WORKSPACE NAVIGATION
          </span>
        </div>
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="border-2 border-black bg-white hover:bg-yellow-400 px-2.5 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center space-x-1"
            title="Scroll to Top of Page"
          >
            <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
            <span>TOP</span>
          </button>
          <button
            type="button"
            onClick={() => document.getElementById("optical-input-section")?.scrollIntoView({ behavior: "smooth" })}
            className="border-2 border-black bg-white hover:bg-yellow-400 px-2.5 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center space-x-1"
            title="Scroll to Optical Input Section"
          >
            <span>01 SKETCH</span>
          </button>
          <button
            type="button"
            onClick={() => document.getElementById("code-output-section")?.scrollIntoView({ behavior: "smooth" })}
            className="border-2 border-black bg-yellow-400 hover:bg-yellow-300 text-black px-2.5 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center space-x-1"
            title="Scroll to Code Output Section"
          >
            <span>02 CODE</span>
          </button>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })}
            className="border-2 border-black bg-white hover:bg-yellow-400 px-2.5 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center space-x-1"
            title="Scroll to Bottom of Page"
          >
            <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />
            <span>BOTTOM</span>
          </button>
        </div>
      </div>

      {/* Brutalist Toast Notification / Error Banner on Failure or Timeout */}
      {errorMessage && (
        <div className="bg-red-500 border-4 border-black text-black font-black uppercase p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between mb-4 animate-shake">
          <div className="flex items-center space-x-3">
            <span className="text-xl">⚠️</span>
            <span className="text-sm md:text-base tracking-wide">
              {errorMessage}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="border-2 border-black bg-white hover:bg-yellow-400 text-black px-3 py-1 font-mono text-xs uppercase cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 ml-4 shrink-0 font-bold"
          >
            DISMISS [X]
          </button>
        </div>
      )}

      {/* 3. Main Workspace Stacked Vertically */}
      <div className="flex flex-col gap-12 w-full max-w-7xl mx-auto pb-24">
        {/* 4. Optical Input (Top) */}
        <div id="optical-input-section" className="scroll-mt-16">
          <OpticalInput
            onCapture={handleCapture}
            onReset={handleReset}
            onProcessRegion={handleProcessRegion}
            isProcessing={isProcessing}
            isScanning={isScanning}
            hasGeneratedCode={hasGeneratedCode}
            capturedImage={activeImage}
            activeImage={activeImage}
            activeSketchType={activeSketchType}
          />
        </div>

        {/* 5. Code Output (Below Optical Input) */}
        <div id="code-output-section" className="flex flex-1 flex-col overflow-hidden min-h-0 scroll-mt-16">
          {engineStatus && engineStatus !== "IDLE" && (
            <div
              className={`border-2 border-black bg-yellow-400 font-mono text-xs p-2 uppercase mb-2 ${
                engineStatus !== "ERROR: ENGINE OFFLINE" && !engineStatus.startsWith("ERROR")
                  ? "animate-pulse text-black"
                  : "bg-red-500 text-white"
              }`}
            >
              <span className="font-black">ENGINE STATUS:</span> {engineStatus}
            </div>
          )}
          <CodeOutput
            code={generatedCode}
            isStreaming={isProcessing}
          />
        </div>
      </div>

      {/* Floating Brutalist Scroll Navigation Dock */}
      <aside aria-label="Quick Scroll Navigation" className="fixed bottom-12 right-6 z-50 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="border-2 border-black bg-white hover:bg-yellow-400 text-black px-3 py-2 font-mono text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-1.5 cursor-pointer select-none"
          title="Scroll to Top of Page"
        >
          <ArrowUp className="w-4 h-4 stroke-[3]" />
          <span>↑ SCROLL TOP</span>
        </button>
        <button
          type="button"
          onClick={() => {
            document.getElementById("optical-input-section")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="border-2 border-black bg-white hover:bg-yellow-400 text-black px-3 py-1.5 font-mono text-[11px] font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-1.5 cursor-pointer select-none"
          title="Scroll to Optical Input Section"
        >
          <span>01 SKETCH</span>
        </button>
        <button
          type="button"
          onClick={() => {
            document.getElementById("code-output-section")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="border-2 border-black bg-yellow-400 hover:bg-yellow-300 text-black px-3 py-1.5 font-mono text-[11px] font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-1.5 cursor-pointer select-none"
          title="Scroll to Code Output Section"
        >
          <span>02 CODE</span>
        </button>
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
          }}
          className="border-2 border-black bg-white hover:bg-yellow-400 text-black px-3 py-2 font-mono text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-1.5 cursor-pointer select-none"
          title="Scroll to Bottom of Page"
        >
          <ArrowDown className="w-4 h-4 stroke-[3]" />
          <span>↓ SCROLL BOTTOM</span>
        </button>
      </aside>

      {/* 6. Bottom Status Bar */}
      <footer className="border-t-2 border-black bg-white flex justify-between items-center p-2 font-mono text-[10px] uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-4 shrink-0 rounded-none">
        <div className="flex items-center space-x-2">
          <span className="font-bold">SPLIT: 50/50 WORKSPACE</span>
          <span>|</span>
          <span className="font-bold">
            {isScanning
              ? "STATUS: OPTICAL LASER SCANNING WIREFRAME [1.5s]..."
              : isProcessing
              ? "STATUS: STREAMING FROM LLAMA 3.2-VISION..."
              : lastCaptureTime
              ? `LAST CAPTURE: ${lastCaptureTime}`
              : "STANDBY FOR WIREFRAME / DROP SKETCH"}
          </span>
          {errorMessage && (
            <span className="bg-yellow-400 px-1 border border-black font-black">
              {errorMessage}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-bold">SPATIAL PARALLAX: ACTIVE</span>
          <span>|</span>
          <span className="bg-yellow-400 px-1.5 py-0.5 border border-black font-black">
            [STEP {currentStep} / 3 ACTIVE]
          </span>
        </div>
      </footer>
      </div>
    </div>
  );
}
