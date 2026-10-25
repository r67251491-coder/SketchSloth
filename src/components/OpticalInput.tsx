"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  RefreshCw,
  Upload,
  ArrowUpRight,
  Check,
  Scan,
  RotateCcw,
  Crop,
  Layers,
  Sparkles,
} from "lucide-react";
import { SAMPLE_WIREFRAME_BASE64 } from "@/lib/sampleWireframeBase64";
import { getSampleSketchByType, SketchType } from "@/lib/sampleWireframes";
import { normalizeImageFile } from "@/lib/imageNormalizer";

interface OpticalInputProps {
  onCapture: (base64Image: string, sketchType?: SketchType) => void;
  onReset?: () => void;
  onProcessRegion?: (imageOverride?: string, sketchType?: SketchType) => void;
  isProcessing?: boolean;
  isScanning?: boolean;
  hasGeneratedCode?: boolean;
  capturedImage?: string | null;
  activeImage?: string | null;
  activeSketchType?: SketchType | null;
}

export default function OpticalInput({
  onCapture,
  onReset,
  onProcessRegion,
  isProcessing = false,
  isScanning = false,
  hasGeneratedCode = false,
  capturedImage = null,
  activeImage = null,
}: OpticalInputProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(capturedImage);
  const [isDragging, setIsDragging] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const previewUrl = activeImage || previewImage || capturedImage || "";

  // Synchronize preview if activeImage or capturedImage changes from parent
  useEffect(() => {
    if (activeImage) {
      setPreviewImage(activeImage);
    } else if (capturedImage) {
      setPreviewImage(capturedImage);
    } else if (capturedImage === null && !activeImage && !hasGeneratedCode) {
      setPreviewImage(null);
    }
  }, [activeImage, capturedImage, hasGeneratedCode]);

  // Initialize webcam
  const startCamera = useCallback(async (deviceId?: string) => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: "environment" },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setPreviewImage(null); // Clear static preview when user deliberately starts camera

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === "videoinput");
      setDevices(videoDevices);
      if (!deviceId && videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err: unknown) {
      console.warn("Camera access failed or unavailable:", err);
      const message = err instanceof Error ? err.message : "Failed to access webcam";
      setCameraError(message);
    }
  }, [stream]);

  // Optical laser scanner audio feedback
  const playOpticalScanAudio = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Sharp shutter exposure click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.11);

      // Cyber laser sweep tone
      const laserOsc = ctx.createOscillator();
      const laserGain = ctx.createGain();
      laserOsc.type = "sine";
      laserOsc.frequency.setValueAtTime(260, ctx.currentTime + 0.05);
      laserOsc.frequency.linearRampToValueAtTime(1020, ctx.currentTime + 1.45);
      laserGain.gain.setValueAtTime(0.08, ctx.currentTime + 0.05);
      laserGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      laserOsc.connect(laserGain);
      laserGain.connect(ctx.destination);
      laserOsc.start(ctx.currentTime + 0.05);
      laserOsc.stop(ctx.currentTime + 1.5);
    } catch {
      // AudioContext unavailable or autoplay blocked
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        processImageFile(file);
      }
    }
  };

  const processImageFile = async (file: File) => {
    try {
      const normalized = await normalizeImageFile(file, 1024, 0.85);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      setPreviewImage(normalized);
      onCapture(normalized);
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
          }
          setPreviewImage(base64);
          onCapture(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Capture or Submit Current Frame/Preview
  const captureFrame = () => {
    if (isProcessing || isScanning) return;

    let base64 = previewImage || "";

    if (!base64 && videoRef.current && videoRef.current.videoWidth > 0) {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        base64 = canvas.toDataURL("image/jpeg", 0.95);
      }
    }

    if (!base64) {
      // Fallback napkin wireframe test canvas
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 800, 600);
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 4;
        ctx.strokeRect(50, 50, 700, 500);
        ctx.strokeRect(80, 80, 640, 70); // Header
        ctx.strokeRect(80, 180, 300, 330); // Card 1
        ctx.strokeRect(420, 180, 300, 330); // Card 2
        ctx.font = "bold 20px monospace";
        ctx.fillStyle = "#111111";
        ctx.fillText("WIREFRAME SKETCH SAMPLE", 100, 125);
        ctx.fillText("HERO COMPONENT", 100, 230);
        ctx.fillText("SIDEBAR STATS", 440, 230);
        base64 = canvas.toDataURL("image/jpeg", 0.9);
      }
    }

    // Play tactile sound & shutter flash
    playOpticalScanAudio();
    setIsFlashing(true);
    setPreviewImage(base64);
    setTimeout(() => {
      setIsFlashing(false);
    }, 100);

    onCapture(base64);
  };

  // Full reset flow
  const handleRetakeClear = () => {
    setPreviewImage(null);
    setActiveRegion(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onReset?.();
  };

  // Sample sketch loader with audio and shutter feedback
  const handleLoadSample = (type: SketchType) => {
    playOpticalScanAudio();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 100);
    const sample = getSampleSketchByType(type);
    setPreviewImage(sample);
    onCapture(sample, type);
  };

  // Process different region action
  const handleProcessDifferentRegion = () => {
    setActiveRegion((prev) => (prev === "HERO" ? "SECONDARY" : "HERO"));
    const img = previewImage || activeImage || capturedImage || undefined;
    if (img) {
      onCapture(img);
    }
    onProcessRegion?.(img);
  };

  return (
    <section className="flex flex-1 flex-col border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden min-h-0 relative select-none rounded-none">
      {/* 100ms White Shutter Flash Overlay */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-75 opacity-100" />
      )}

      {/* Section Heading Banner: 01 OPTICAL INPUT */}
      <div className="border-b-2 border-black bg-white px-5 py-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-2.5">
          <span className="font-mono text-xs font-black bg-black text-white px-1.5 py-0.5 rounded-none">
            01
          </span>
          <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-black">
            OPTICAL INPUT
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Sample Input 1: Single Screen */}
          <button
            type="button"
            onClick={() => handleLoadSample("single")}
            className="font-mono text-[10px] uppercase font-black border-2 border-black bg-white hover:bg-yellow-400 text-black px-2 py-1 cursor-pointer flex items-center space-x-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-colors"
            title="Sample 1: Single-Screen Item Upload (Lost and Found)"
          >
            <Sparkles className="w-3 h-3 text-black" />
            <span>[1] LOST &amp; FOUND</span>
          </button>

          {/* Sample Input 2: Multi-Screen Architecture Grid */}
          <button
            type="button"
            onClick={() => handleLoadSample("multi")}
            className="font-mono text-[10px] uppercase font-black border-2 border-black bg-white hover:bg-yellow-400 text-black px-2 py-1 cursor-pointer flex items-center space-x-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-colors"
            title="Sample 2: 10-Screen Architecture Grid (Hex Central)"
          >
            <Layers className="w-3 h-3 text-black" />
            <span>[2] MULTI-SCREEN</span>
          </button>

          {/* Sample Input 3: Field Ops Dashboard */}
          <button
            type="button"
            onClick={() => handleLoadSample("dashboard")}
            className="font-mono text-[10px] uppercase font-black border-2 border-black bg-white hover:bg-yellow-400 text-black px-2 py-1 cursor-pointer flex items-center space-x-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-colors"
            title="Sample 3: 2-Column Hero & Sidebar Stats Dashboard"
          >
            <Crop className="w-3 h-3 text-black" />
            <span>[3] DASHBOARD</span>
          </button>

          {previewImage && (
            <button
              type="button"
              onClick={() => startCamera(selectedDeviceId)}
              className="font-mono text-[10px] uppercase font-bold border border-black bg-yellow-400 hover:bg-yellow-300 text-black px-2 py-0.5 cursor-pointer flex items-center space-x-1"
              title="Switch back to live webcam"
            >
              <Camera className="w-3 h-3" />
              <span>START WEBCAM</span>
            </button>
          )}

          {devices.length > 1 && stream && (
            <select
              value={selectedDeviceId}
              onChange={(e) => {
                setSelectedDeviceId(e.target.value);
                startCamera(e.target.value);
              }}
              className="font-mono text-[10px] uppercase font-bold border border-black bg-white px-2 py-0.5 text-black outline-none cursor-pointer rounded-none"
            >
              {devices.map((device, idx) => (
                <option key={device.deviceId} value={device.deviceId}>
                  CAM {idx + 1}: {device.label || `Device ${idx + 1}`}
                </option>
              ))}
            </select>
          )}

          <span className="font-mono text-[11px] uppercase tracking-widest text-black bg-gray-100 px-2 py-0.5 border border-black font-bold flex items-center space-x-1.5 rounded-none">
            <span
              className={`w-2 h-2 border border-black ${
                previewImage
                  ? "bg-yellow-400"
                  : stream
                  ? "bg-black"
                  : "bg-transparent"
              }`}
            />
            <span>
              {previewImage
                ? "IMAGE PREVIEW LOADED"
                : stream
                ? "FEED LIVE"
                : "FEED STANDBY"}
            </span>
          </span>
        </div>
      </div>

      {/* Main Viewport Container with Drag & Drop Event Handlers */}
      <div className="flex flex-1 flex-col p-4 md:p-6 overflow-hidden bg-gray-50 min-h-0 justify-between">
        {isScanning || isProcessing ? (
          /* Step 2: Live Laser Scanner View */
          <div className="border-4 border-black bg-gray-100 relative overflow-hidden h-[550px] w-full flex items-center justify-center p-8">
            {/* Brutalist Badges: Top Left */}
            <div className="absolute top-4 left-4 bg-black text-white font-mono text-[10px] px-2 py-1 uppercase border-2 border-black z-20">
              PREVIEW_SOURCE: ACTIVE
            </div>
            {/* Below that */}
            <div className="absolute top-10 left-4 bg-yellow-400 text-black font-black text-[10px] px-2 py-1 uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-20">
              LASER SCANNING FEED
            </div>

            {/* The Laser Overlay */}
            <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400 shadow-[0_0_20px_5px_rgba(250,204,21,0.8)] z-10 animate-[scan_3s_ease-in-out_infinite_alternate]"></div>

            {/* Image Preview */}
            <img 
              src={activeImage || previewUrl}
              alt="Scanned Wireframe" 
              className="max-h-full max-w-full object-contain shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-black relative z-0" 
            />
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-1 flex-col items-center justify-center border-2 border-black overflow-hidden min-h-0 rounded-none transition-colors ${
              isDragging
                ? "bg-yellow-300/40 border-dashed"
                : previewImage
                ? "bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                : stream
                ? "bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                : "bg-gray-100 p-4"
            }`}
          >
            {/* Tactical HUD Overlays when Webcam or Preview is Active */}
            {(stream || previewImage) && (
              <>
                <div className="absolute top-2.5 left-3 font-mono text-[10px] text-white bg-black/90 px-1.5 py-0.5 border border-white/40 font-bold z-10 flex items-center space-x-1">
                  <span>{previewImage ? "PREVIEW_SOURCE: FILE/DROP" : "+ [CAM_FEED_01]"}</span>
                </div>
                <div className="absolute top-2.5 right-3 font-mono text-[10px] text-white bg-black/90 px-1.5 py-0.5 border border-white/40 font-bold z-10">
                  {previewImage ? "STATIC HIGH-RES +" : stream ? "1080p LIVE +" : "STANDBY +"}
                </div>
                <div className="absolute bottom-2.5 left-3 font-mono text-[10px] text-white bg-black/90 px-1.5 py-0.5 border border-white/40 font-bold z-10">
                  {activeRegion ? `REGION FOCUS: [${activeRegion}]` : "+ ALIGN WIREFRAME"}
                </div>
                <div className="absolute bottom-2.5 right-3 font-mono text-[10px] text-white bg-black/90 px-1.5 py-0.5 border border-white/40 font-bold z-10">
                  DRAG OVER ACTIVE +
                </div>

                {/* Crosshair Wireframe Guide Overlay */}
                <div className="absolute inset-8 pointer-events-none border border-dashed border-black/30 z-10 flex items-center justify-center">
                  <div className="w-8 h-8 border-t-2 border-l-2 border-black absolute top-0 left-0" />
                  <div className="w-8 h-8 border-t-2 border-r-2 border-black absolute top-0 right-0" />
                  <div className="w-8 h-8 border-b-2 border-l-2 border-black absolute bottom-0 left-0" />
                  <div className="w-8 h-8 border-b-2 border-r-2 border-black absolute bottom-0 right-0" />
                  <span className="font-mono text-[10px] text-black/60 tracking-widest uppercase font-black bg-white/80 px-2 py-0.5 border border-black">
                    {activeRegion ? `REGION_${activeRegion}_BOUNDS` : "WIRE_FRAME_BOUNDS"}
                  </span>
                </div>
              </>
            )}

            {/* Scenario A: Static Dropped/Loaded Image Preview */}
            {previewImage ? (
              <div className="relative w-full h-full flex items-center justify-center bg-white p-4">
                <img
                  src={previewImage}
                  alt="Dropped Wireframe Sketch"
                  className="max-w-full max-h-full object-contain border border-black shadow-md"
                />
              </div>
            ) : stream ? (
              /* Scenario B: Live HTML5 Webcam Stream */
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover block"
              />
            ) : (
              /* Scenario C: Webcam Inactive -> Massive Stark Box with Thick Dashed Black Border */
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-full p-6 sm:p-10 md:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors border-4 border-dashed border-black ${
                  isDragging ? "bg-yellow-300" : "bg-white hover:bg-yellow-50/70"
                }`}
              >
                <div className="w-16 h-16 border-2 border-black bg-yellow-400 flex items-center justify-center mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-none">
                  <Upload className="w-8 h-8 text-black stroke-[2.5]" />
                </div>

                <h3 className="font-mono text-xl sm:text-2xl md:text-3xl font-black text-black uppercase tracking-tight mb-2">
                  DROP SKETCH IMAGE HERE
                </h3>

                <p className="font-mono text-xs sm:text-sm text-gray-700 uppercase tracking-wider font-bold mb-6 max-w-md">
                  DRAG & DROP WIREFRAME FILE OR CLICK TO BROWSE PNG, JPG, WEBP
                </p>

                <div className="flex flex-wrap gap-2.5 justify-center max-w-xl">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadSample("single");
                    }}
                    className="bg-black hover:bg-neutral-800 text-white border-2 border-black px-4 py-2.5 font-mono text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer flex items-center space-x-1.5 rounded-none"
                    title="Load Sample 1: Lost and Found"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>[1] LOST &amp; FOUND</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadSample("multi");
                    }}
                    className="bg-black hover:bg-neutral-800 text-white border-2 border-black px-4 py-2.5 font-mono text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer flex items-center space-x-1.5 rounded-none"
                    title="Load Sample 2: Multi-Screen Architecture"
                  >
                    <Layers className="w-3.5 h-3.5 text-yellow-400" />
                    <span>[2] MULTI-SCREEN</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadSample("dashboard");
                    }}
                    className="bg-black hover:bg-neutral-800 text-white border-2 border-black px-4 py-2.5 font-mono text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer flex items-center space-x-1.5 rounded-none"
                    title="Load Sample 3: Field Ops Dashboard"
                  >
                    <Crop className="w-3.5 h-3.5 text-yellow-400" />
                    <span>[3] DASHBOARD</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startCamera(selectedDeviceId);
                    }}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-black px-4 py-2.5 font-mono text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer flex items-center space-x-1.5 rounded-none"
                  >
                    <Camera className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    <span>START WEBCAM</span>
                  </button>
                </div>
              </div>
            )}

            {/* Hidden Canvas for Frame Extraction */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Hidden file input for file drop / browse fallback */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        )}

        {/* Bottom Actions Area */}
        <div className="mt-4 shrink-0">
          {isScanning || isProcessing ? (
            <button
              type="button"
              disabled
              className="w-full bg-yellow-400 text-black border-2 border-black py-3.5 md:py-4 px-6 font-black uppercase tracking-wider text-base md:text-lg flex items-center justify-center space-x-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] opacity-90 cursor-not-allowed rounded-none"
            >
              <Scan className="w-5 h-5 text-black animate-spin" />
              <span>SCANNING &amp; ANALYZING WIREFRAME...</span>
            </button>
          ) : previewImage ? (
            /* Action Button Split: When imagePreview is active (50% width each) */
            <div className="flex flex-row items-stretch gap-3 w-full">
              {/* Button 1: RETAKE / CLEAR (50% width, Black background, white text) */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRetakeClear();
                }}
                className="w-1/2 flex-1 bg-black hover:bg-neutral-800 text-white border-2 border-black py-3.5 md:py-4 px-4 font-black uppercase tracking-wider text-xs sm:text-sm md:text-base flex items-center justify-center space-x-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer rounded-none"
              >
                <RotateCcw className="w-4 h-4 stroke-[3]" />
                <span>RETAKE / CLEAR</span>
              </button>

              {/* Button 2: PROCESS SKETCH (50% width, Yellow background, black text) */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleProcessDifferentRegion();
                }}
                disabled={isProcessing || isScanning}
                className="w-1/2 flex-1 bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-black py-3.5 md:py-4 px-4 font-black uppercase tracking-wider text-xs sm:text-sm md:text-base flex items-center justify-center space-x-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer rounded-none disabled:opacity-60"
              >
                {isScanning ? (
                  <>
                    <Scan className="w-4 h-4 text-black animate-spin" />
                    <span>SCANNING...</span>
                  </>
                ) : isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-black animate-spin" />
                    <span>PROCESSING...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    <span>PROCESS SKETCH</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Pre-Generation State: Massive Yellow Block "CAPTURE SKETCH" Button */
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                captureFrame();
              }}
              disabled={isProcessing || isScanning}
              className={`w-full bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-black py-3.5 md:py-4 px-6 font-black uppercase tracking-wider text-base md:text-lg flex items-center justify-center space-x-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer rounded-none ${
                isScanning
                  ? "animate-pulse bg-yellow-300"
                  : isProcessing
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }`}
            >
              {isScanning ? (
                <>
                  <Scan className="w-5 h-5 text-black animate-spin" />
                  <span>SCANNING OPTICAL FEED...</span>
                </>
              ) : isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 text-black animate-spin" />
                  <span>ANALYZING WIREFRAME...</span>
                </>
              ) : (
                <>
                  <span>CAPTURE SKETCH</span>
                  <ArrowUpRight className="w-5 h-5 text-black stroke-[3]" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
