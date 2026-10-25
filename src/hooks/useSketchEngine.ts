"use client";

import { useState, useRef, useCallback } from 'react';
import { normalizeImageFile, normalizeBase64Image } from "@/lib/imageNormalizer";
import { synthesizeDynamicWireframe, isGroundingOutput } from "@/lib/wireframeSynthesizer";
import { SketchType } from "@/lib/sampleWireframes";

export function useSketchEngine() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [engineStatus, setEngineStatus] = useState<string>("IDLE");
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeSketchType, setActiveSketchType] = useState<SketchType | null>("single");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsWebcamActive(true);
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setIsWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsWebcamActive(false);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const base64 = canvas.toDataURL("image/jpeg", 0.85);
      setActiveImage(base64);
      setImagePreview(base64);
      stopWebcam();
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const compressedBase64 = await normalizeImageFile(file, 1024, 0.85);
        setActiveImage(compressedBase64);
        setImagePreview(compressedBase64);
        stopWebcam();
      } catch (err) {
        console.error("Image normalization failed:", err);
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const processSketch = async (currentImage?: string, sketchType?: SketchType) => {
    const targetImage = currentImage || activeImage || imagePreview;
    if (!targetImage) return;
    const currentType = sketchType || activeSketchType;

    setStep(2);
    setIsScanning(true);
    setGeneratedCode("");
    setEngineStatus("INITIALIZING AI VISION MODEL... (This may take 30-90s)");

    // Normalize image to max 1024px before passing to vision model
    const optimizedImage = await normalizeBase64Image(targetImage, 1024, 0.85);
    const cleanBase64 = optimizedImage.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    let targetModel = "llama3.2-vision";
    try {
      const tagsRes = await fetch("http://127.0.0.1:11434/api/tags");
      if (tagsRes.ok) {
        const data = await tagsRes.json();
        const available: string[] = (data.models || []).map(
          (m: { name?: string; model?: string }) => m.name || m.model || ""
        );
        if (available.length > 0 && !available.some((n: string) => n.includes(targetModel))) {
          const fallback =
            available.find((n: string) => n.includes("llama3.2-vision")) ||
            available.find((n: string) => n.includes("moondream")) ||
            available[0];
          if (fallback) targetModel = fallback;
        }
      }
    } catch {
      // Proceed with default model if tags check fails
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

    try {
      const res = await fetch("http://127.0.0.1:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Ollama returned HTTP ${res.status}: ${errText || res.statusText}`);
      }
      if (!res.body) {
        throw new Error("No stream available from Ollama daemon.");
      }

      setEngineStatus("STREAMING COMPONENT CODE...");

      await new Promise((r) => setTimeout(r, 1500));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";

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

              // The regex safely extracts everything after ```tsx, which now includes our pre-filled start
              const codeMatch = accumulatedText.match(/```(?:tsx|jsx)?\n([\s\S]*?)(?:```|$)/);
              let cleanCode = codeMatch ? codeMatch[1] : accumulatedText;

              // Keep the global failsafe just in case, but the pre-fill should render it obsolete
              if (/\[\s*\d+\.\d+,\s*\d+\.\d+,\s*\d+\.\d+,\s*\d+\.\d+\s*\]/.test(cleanCode)) {
                cleanCode = "// ENGINE EXCEPTION: Model hallucination caught. Please click PROCESS SKETCH again.";
              }

              setGeneratedCode(cleanCode);
            }
          } catch (e) {
            // Safe JSON parse error handling
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

            // Keep the global failsafe just in case, but the pre-fill should render it obsolete
            if (/\[\s*\d+\.\d+,\s*\d+\.\d+,\s*\d+\.\d+,\s*\d+\.\d+\s*\]/.test(cleanCode)) {
              cleanCode = "// ENGINE EXCEPTION: Model hallucination caught. Please click PROCESS SKETCH again.";
            }

            setGeneratedCode(cleanCode);
          }
        } catch {}
      }

      setIsScanning(false);
      setGeneratedCode((currentCode) => {
        if (
          !currentCode ||
          isGroundingOutput(currentCode) ||
          /\[\s*\d+\.\d+,\s*\d+\.\d+,\s*\d+\.\d+\s*\]/.test(currentCode) ||
          currentCode.includes("ENGINE EXCEPTION") ||
          currentCode.includes("{ ... }")
        ) {
          return synthesizeDynamicWireframe(accumulatedText, targetImage, currentType);
        }
        return currentCode;
      });
      setStep(3); // Move to Code Export phase only when stream is completely done
      setEngineStatus("IDLE");
    } catch (error: any) {
      console.warn("Fetch error or timeout, synthesizing wireframe:", error);
      setGeneratedCode(synthesizeDynamicWireframe(undefined, targetImage, currentType));
      setIsScanning(false);
      setStep(3);
      setEngineStatus("IDLE");
    }
  };

  const resetWorkspace = () => {
    setActiveImage(null);
    setImagePreview(null);
    setGeneratedCode("");
    setEngineStatus("IDLE");
    setStep(1);
    setIsScanning(false);
    startWebcam();
  };

  return {
    step,
    setStep,
    engineStatus,
    setEngineStatus,
    activeImage,
    setActiveImage,
    imagePreview,
    setImagePreview,
    isWebcamActive,
    isScanning,
    generatedCode,
    setGeneratedCode,
    videoRef,
    startWebcam,
    stopWebcam,
    captureFrame,
    handleDrop,
    handleDragOver,
    resetWorkspace,
    processSketch,
  };
}
