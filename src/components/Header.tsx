"use client";

import React from "react";
import { Camera, Cpu, Code2, Check, RefreshCw } from "lucide-react";

interface HeaderProps {
  currentStep?: 1 | 2 | 3;
  engineStatus?: string;
  onRefreshStatus?: () => void;
  onStepClick?: (step: 1 | 2 | 3) => void;
}

export default function Header({
  currentStep = 1,
  engineStatus = "IDLE",
  onRefreshStatus,
  onStepClick,
}: HeaderProps) {
  const isEngineBusy =
    engineStatus &&
    engineStatus !== "IDLE" &&
    engineStatus !== "ready" &&
    engineStatus !== "checking" &&
    engineStatus !== "offline";

  const steps: {
    id: 1 | 2 | 3;
    code: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    desc: string;
  }[] = [
    {
      id: 1,
      code: "[01]",
      title: "OPTICAL INPUT",
      icon: Camera,
      desc: "WEBCAM / FILE DROP",
    },
    {
      id: 2,
      code: "[02]",
      title: "NEURAL PROCESSING",
      icon: Cpu,
      desc: isEngineBusy ? engineStatus : "LLAMA 3.2-VISION",
    },
    {
      id: 3,
      code: "[03]",
      title: "CODE EXPORT",
      icon: Code2,
      desc: "REACT + TAILWIND",
    },
  ];

  return (
    <header className="w-full select-none shrink-0 mb-4 rounded-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Step 01: OPTICAL INPUT */}
        <div
          onClick={() => onStepClick?.(1)}
          className={`p-3.5 flex items-center justify-between transition-colors cursor-pointer rounded-none border-2 ${
            currentStep === 1
              ? "bg-yellow-400 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              : currentStep > 1
              ? "bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              : "bg-white border-gray-300 text-gray-400"
          }`}
        >
          <div className="flex items-center space-x-3">
            <span
              className={`font-mono text-xs font-black tracking-widest px-1.5 py-0.5 border ${
                currentStep === 1
                  ? "border-black bg-black text-yellow-400"
                  : currentStep > 1
                  ? "border-yellow-400 bg-yellow-400 text-black font-black"
                  : "border-gray-300 bg-gray-100 text-gray-400"
              }`}
            >
              [01]
            </span>
            <div className="flex flex-col">
              <span className={`font-mono text-xs sm:text-sm font-black tracking-wider uppercase leading-tight ${
                currentStep === 1 ? "text-black" : currentStep > 1 ? "text-white" : "text-gray-400"
              }`}>
                OPTICAL INPUT
              </span>
              <span className={`font-mono text-[9px] uppercase tracking-widest font-bold ${
                currentStep === 1 ? "text-black/80" : currentStep > 1 ? "text-gray-300" : "text-gray-400"
              }`}>
                WEBCAM / FILE DROP
              </span>
            </div>
          </div>
          {currentStep === 1 ? (
            <span className="flex items-center space-x-1 px-2 py-0.5 bg-black text-yellow-400 border border-black font-mono text-[10px] font-black tracking-wider">
              <span>ACTIVE</span>
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-none animate-pulse" />
            </span>
          ) : currentStep > 1 ? (
            <span className="font-mono text-base font-black text-white">
              ✓
            </span>
          ) : null}
        </div>

        {/* Step 02: NEURAL PROCESSING */}
        <div
          onClick={() => onStepClick?.(2)}
          className={`p-3.5 flex items-center justify-between transition-colors cursor-pointer rounded-none border-2 ${
            currentStep === 2
              ? "bg-yellow-400 border-2 border-black font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              : currentStep > 2
              ? "bg-black border-2 border-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              : "bg-white border-gray-300 text-gray-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.04)]"
          }`}
        >
          <div className="flex items-center space-x-3">
            <span
              className={`font-mono text-xs font-black tracking-widest px-1.5 py-0.5 border ${
                currentStep === 2
                  ? "border-black bg-black text-yellow-400"
                  : currentStep > 2
                  ? "border-yellow-400 bg-yellow-400 text-black font-black"
                  : "border-gray-300 bg-gray-100 text-gray-400"
              }`}
            >
              [02]
            </span>
            <div className="flex flex-col">
              <span className={`font-mono text-xs sm:text-sm font-black tracking-wider uppercase leading-tight ${
                currentStep === 2 ? "text-black font-black" : "text-gray-400"
              }`}>
                NEURAL PROCESSING
              </span>
              <span className={`font-mono text-[9px] uppercase tracking-widest font-bold ${
                currentStep === 2 ? "text-black/80 font-black" : "text-gray-400"
              }`}>
                LLAMA 3.2-VISION
              </span>
            </div>
          </div>
          {currentStep === 2 ? (
            <span className="flex items-center space-x-1 px-2 py-0.5 bg-black text-yellow-400 border border-black font-mono text-[10px] font-black tracking-wider">
              <span>ACTIVE</span>
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-none animate-pulse" />
            </span>
          ) : currentStep > 2 ? (
            <span className="font-mono text-base font-black text-white">
              ✓
            </span>
          ) : null}
        </div>

        {/* Step 03: CODE EXPORT */}
        <div
          onClick={() => onStepClick?.(3)}
          className={`p-3.5 flex items-center justify-between transition-colors cursor-pointer rounded-none border-2 ${
            currentStep === 3
              ? "bg-yellow-400 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              : "bg-white border-gray-300 text-gray-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.04)]"
          }`}
        >
          <div className="flex items-center space-x-3">
            <span
              className={`font-mono text-xs font-black tracking-widest px-1.5 py-0.5 border ${
                currentStep === 3
                  ? "border-black bg-black text-yellow-400"
                  : "border-gray-300 bg-gray-100 text-gray-400"
              }`}
            >
              [03]
            </span>
            <div className="flex flex-col">
              <span className={`font-mono text-xs sm:text-sm font-black tracking-wider uppercase leading-tight ${
                currentStep === 3 ? "text-black" : "text-gray-400"
              }`}>
                CODE EXPORT
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest font-bold text-gray-400">
                REACT + TAILWIND
              </span>
            </div>
          </div>
          {currentStep === 3 && (
            <span className="flex items-center space-x-1 px-2 py-0.5 bg-black text-yellow-400 border border-black font-mono text-[10px] font-black tracking-wider">
              <span>ACTIVE</span>
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-none" />
            </span>
          )}
        </div>

        {/* Status Indicator (Far Right) */}
        <div className="p-3.5 flex items-center justify-between bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <div className="flex items-center space-x-2 font-mono text-xs font-black uppercase text-black">
            <span
              className={`w-2.5 h-2.5 border border-black rounded-full ${
                currentStep === 2
                  ? "bg-yellow-400 animate-pulse ring-2 ring-yellow-400/50"
                  : engineStatus === "ready" || engineStatus === "IDLE"
                  ? "bg-black"
                  : "bg-transparent"
              }`}
            />
            <span>
              {currentStep === 2
                ? "OLLAMA: [ANALYZING VISION...]"
                : `OLLAMA: [${engineStatus.toUpperCase()}]`}
            </span>
          </div>
          <button
            type="button"
            onClick={onRefreshStatus}
            title="Check local Ollama status"
            className="p-1 hover:bg-yellow-400 border border-black transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-black" />
          </button>
        </div>
      </div>
    </header>
  );
}
