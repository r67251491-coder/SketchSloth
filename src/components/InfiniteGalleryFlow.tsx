"use client";

import React, { useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface CardSpec {
  id: string;
  width: number;
  height: number;
  label?: string;
  sub?: string;
  hasWireframeAccent?: boolean;
  imageSrc?: string;
}

// Staggered rows of stark-white window panels flowing diagonally (bottom-left to top-right)
const ROWS_DATA: { height: number; speed: number; cards: CardSpec[] }[] = [
  {
    height: 290,
    speed: 52, // duration in seconds
    cards: [
      { id: "r1-1", width: 380, height: 270, label: "EXHIBIT.01", sub: "PERSPECTIVE A", hasWireframeAccent: true },
      { id: "r1-2", width: 280, height: 250, label: "NAPKIN // WIRE" },
      { id: "r1-3", width: 440, height: 280, label: "LUMEN // ARCHIVE", sub: "MUSEUM WEBSITE", imageSrc: "/lumen-museum-website-design.webp" },
      { id: "r1-4", width: 310, height: 260, label: "SYS.V-102" },
      { id: "r1-5", width: 360, height: 270, label: "ORTHO.GRID", hasWireframeAccent: true },
    ],
  },
  {
    height: 330,
    speed: 44,
    cards: [
      { id: "r2-1", width: 320, height: 310, label: "GEOMETRY B" },
      { id: "r2-2", width: 460, height: 320, label: "OPTIC.SENSOR", hasWireframeAccent: true },
      { id: "r2-3", width: 260, height: 290, label: "PLATE #07" },
      { id: "r2-4", width: 400, height: 310, label: "ARCHIVAL.84", sub: "PARALLAX FLOW" },
      { id: "r2-5", width: 340, height: 300, label: "VOID 05", hasWireframeAccent: true },
    ],
  },
  {
    height: 300,
    speed: 60,
    cards: [
      { id: "r3-1", width: 420, height: 280, label: "MUSEUM HALL", sub: "LUMEN DESIGN", imageSrc: "/lumen-museum-website-design.webp" },
      { id: "r3-2", width: 300, height: 270, label: "FACET.3D" },
      { id: "r3-3", width: 350, height: 280, label: "SKETCH.SLOTH" },
      { id: "r3-4", width: 480, height: 290, label: "SYNTHESIS // LIVE", hasWireframeAccent: true },
      { id: "r3-5", width: 290, height: 260, label: "PANEL 14" },
    ],
  },
  {
    height: 320,
    speed: 48,
    cards: [
      { id: "r4-1", width: 340, height: 300, label: "DATUM.POINT" },
      { id: "r4-2", width: 430, height: 310, label: "SPATIAL C", sub: "ELEVATION", hasWireframeAccent: true },
      { id: "r4-3", width: 280, height: 280, label: "VECTOR // MONO" },
      { id: "r4-4", width: 400, height: 300, label: "CANVAS 22", hasWireframeAccent: true },
      { id: "r4-5", width: 360, height: 290, label: "ISO.FLOW" },
    ],
  },
  {
    height: 290,
    speed: 56,
    cards: [
      { id: "r5-1", width: 390, height: 270, label: "GALLERY // CORE", hasWireframeAccent: true },
      { id: "r5-2", width: 310, height: 260, label: "KRONOS 08" },
      { id: "r5-3", width: 450, height: 280, label: "PLATE #19", sub: "AXIS ROTATE" },
      { id: "r5-4", width: 270, height: 250, label: "SURFACE ARCH" },
      { id: "r5-5", width: 380, height: 270, label: "SLOTH.N2C", hasWireframeAccent: true },
    ],
  },
  {
    height: 340,
    speed: 46,
    cards: [
      { id: "r6-1", width: 330, height: 320, label: "KAIROS.31" },
      { id: "r6-2", width: 470, height: 330, label: "CORDATE // 04", hasWireframeAccent: true },
      { id: "r6-3", width: 340, height: 310, label: "LUMEN.MUSEUM", sub: "ORIGINAL DESIGN", imageSrc: "/lumen-museum-website-design.webp" },
      { id: "r6-4", width: 410, height: 320, label: "EXHIBIT.FINAL", hasWireframeAccent: true },
      { id: "r6-5", width: 350, height: 310, label: "ECHO 11" },
    ],
  },
];

interface InfiniteGalleryFlowProps {
  speedMultiplier?: number;
  isPaused?: boolean;
}

export default function InfiniteGalleryFlow({
  speedMultiplier = 1,
  isPaused = false,
}: InfiniteGalleryFlowProps) {
  // Mouse position for subtle 3D interactive parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 100, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Subtle interactive parallax tilt
  const tiltX = useTransform(smoothY, [-0.5, 0.5], [6, -6]);
  const tiltY = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
  const panX = useTransform(smoothX, [-0.5, 0.5], [-25, 25]);
  const panY = useTransform(smoothY, [-0.5, 0.5], [-25, 25]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;
    const normX = e.clientX / innerWidth - 0.5;
    const normY = e.clientY / innerHeight - 0.5;
    mouseX.set(normX);
    mouseY.set(normY);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="absolute inset-0 z-0 w-full h-full overflow-hidden select-none pointer-events-none"
      style={{ perspective: "1400px" }}
    >
      {/* Architectural museum dot-matrix grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #4b5563 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Ambient diagonal lighting for depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/[0.06] via-transparent to-white/40 pointer-events-none" />

      {/* Transformed Isometric 3D Grid Plane (rotate: -15deg, skewX: -5deg) */}
      <motion.div
        style={{
          rotateX: tiltX,
          rotateY: tiltY,
          x: panX,
          y: panY,
        }}
        className="relative w-[220vw] h-[220vh] -left-[60vw] -top-[60vh] flex justify-center items-center"
      >
        <div
          className="flex flex-col space-y-8 md:space-y-10 will-change-transform"
          style={{
            transform: "rotate(-15deg) skewX(-5deg) scale(1.15)",
            transformOrigin: "center center",
          }}
        >
          {ROWS_DATA.map((row, rowIdx) => (
            <GalleryRow
              key={`row-${rowIdx}`}
              rowIdx={rowIdx}
              height={row.height}
              speed={row.speed / speedMultiplier}
              cards={row.cards}
              isPaused={isPaused}
            />
          ))}
        </div>
      </motion.div>

      {/* Subtle perimeter vignette for museum depth */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_140px_rgba(0,0,0,0.12)]" />
    </div>
  );
}

interface RowProps {
  rowIdx: number;
  height: number;
  speed: number;
  cards: CardSpec[];
  isPaused: boolean;
}

function GalleryRow({ rowIdx, height, speed, cards, isPaused }: RowProps) {
  // Duplicate cards for seamless infinite looping
  const seamlessCards = useMemo(() => [...cards, ...cards], [cards]);

  // Alternate row horizontal offsets for natural staggered brick-laying layout
  const initialOffset = (rowIdx % 4) * -220;

  return (
    <div
      className="relative flex items-center select-none shrink-0"
      style={{ height: `${height}px` }}
    >
      <div style={{ transform: `translate3d(${initialOffset}px, 0, 0)` }}>
        <div
          className={`flex items-center space-x-8 md:space-x-10 will-change-transform ${
            isPaused ? "" : "animate-gallery-flow-x"
          }`}
          style={{
            animationDuration: `${speed}s`,
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {seamlessCards.map((card, idx) => (
            <StarkWindowPanel
              key={`${card.id}-${idx}`}
              spec={card}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface StarkWindowPanelProps {
  spec: CardSpec;
}

function StarkWindowPanel({ spec }: StarkWindowPanelProps) {
  return (
    <div
      style={{
        width: `${spec.width}px`,
        height: `${spec.height}px`,
      }}
      className="relative bg-white rounded-none border border-black/15 p-5 flex flex-col justify-between transition-all duration-300 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.18),0_10px_20px_-5px_rgba(0,0,0,0.08)] shrink-0 pointer-events-none"
    >
      {/* Stark Editorial Header of the Window Panel */}
      <div className="flex justify-between items-start pointer-events-none">
        <div className="flex flex-col space-y-0.5">
          <span className="font-mono text-[9px] tracking-widest text-black/50 font-black uppercase">
            {spec.label || "CANVAS // ART"}
          </span>
          {spec.sub && (
            <span className="font-sans text-[11px] font-black tracking-tight text-black/70 uppercase">
              {spec.sub}
            </span>
          )}
        </div>

        {/* Minimal catalog index tag */}
        <span className="font-mono text-[8px] text-black/40 border border-black/20 px-1.5 py-0.5 font-bold tracking-tighter">
          {spec.id.toUpperCase()}
        </span>
      </div>

      {/* Wireframe accent, Lumen museum artwork, or stark architectural empty field */}
      {spec.imageSrc ? (
        <div className="flex-1 my-2.5 overflow-hidden border border-black/20 bg-neutral-100 relative rounded-none shadow-inner">
          <img
            src={spec.imageSrc}
            alt={spec.label || "Lumen Museum Web Design"}
            className="w-full h-full object-cover grayscale opacity-85 hover:opacity-100 transition-opacity"
          />
          <div className="absolute bottom-1 right-1 bg-black text-yellow-400 font-mono text-[7px] px-1 py-0.5 font-black uppercase border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            LUMEN.MUSEUM
          </div>
        </div>
      ) : spec.hasWireframeAccent ? (
        <div className="flex-1 my-3 border border-dashed border-black/15 rounded-none p-3 flex flex-col justify-between bg-neutral-50/70 pointer-events-none">
          <div className="flex justify-between items-center opacity-40">
            <div className="w-1.5 h-1.5 bg-black" />
            <div className="h-[1px] flex-1 mx-2 bg-black/20" />
            <div className="w-1.5 h-1.5 border border-black" />
          </div>

          <div className="space-y-1.5 opacity-30">
            <div className="h-1 bg-black/30 w-3/4" />
            <div className="h-1 bg-black/30 w-1/2" />
          </div>

          <div className="flex justify-between items-end opacity-40 font-mono text-[7px] text-black font-bold">
            <span>[NAPKIN.SYNTH]</span>
            <span>MOD: 0.84</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 my-3 flex items-center justify-center pointer-events-none">
          {/* Stark empty window panel with a centered crosshair */}
          <div className="relative w-5 h-5 opacity-20">
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black" />
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-black" />
          </div>
        </div>
      )}

      {/* Bottom Editorial Specs */}
      <div className="flex justify-between items-end pt-2 border-t border-black/10 pointer-events-none">
        <div className="flex items-center space-x-1.5">
          <div className="w-1.5 h-1.5 bg-black/60" />
          <span className="font-mono text-[8px] font-bold tracking-wider text-black/50">
            SLOTH.GALLERY
          </span>
        </div>
        <span className="font-mono text-[8px] font-bold tracking-widest text-black/40">
          DIM: {spec.width}x{spec.height}
        </span>
      </div>
    </div>
  );
}
