"use client";

import React, { useMemo, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface CardSpec {
  id: string;
  width: number;
  height: number;
  label?: string;
  sub?: string;
  hasWireframeAccent?: boolean;
  imageSrc?: string;
  objectPosition?: string;
}

// Staggered rows of stark-white window panels flowing diagonally (bottom-left to top-right)
// Richly populated with the authentic Lumen Museum Website Design artwork
const ROWS_DATA: { height: number; speed: number; cards: CardSpec[] }[] = [
  {
    height: 300,
    speed: 54, // duration in seconds
    cards: [
      {
        id: "r1-1",
        width: 440,
        height: 280,
        label: "LUMEN // INTRO",
        sub: "SUMMIT EXHIBITION",
        imageSrc: "/lumen-museum-website-design.webp",
        objectPosition: "top center",
      },
      {
        id: "r1-2",
        width: 300,
        height: 260,
        label: "NAPKIN // WIRE",
        hasWireframeAccent: true,
      },
      {
        id: "r1-3",
        width: 460,
        height: 290,
        label: "CORDATE // ARCHIVE",
        sub: "ALPINE EXPEDITION",
        imageSrc: "/lumen-museum-website-design.webp",
        objectPosition: "right center",
      },
      {
        id: "r1-4",
        width: 320,
        height: 270,
        label: "SYS.V-102",
        hasWireframeAccent: true,
      },
      {
        id: "r1-5",
        width: 420,
        height: 280,
        label: "KRONOS & KAIROS",
        sub: "GLACIAL LAKE",
        imageSrc: "/lumen-museum-website-design.webp",
        objectPosition: "left bottom",
      },
    ],
  },
  {
    height: 330,
    speed: 46,
    cards: [
      {
        id: "r2-1",
        width: 430,
        height: 310,
        label: "LUMEN // SHOP",
        sub: "CATALOGUE & ACCENTS",
        imageSrc: "/lumen-museum-website-design.webp",
        objectPosition: "bottom center",
      },
      {
        id: "r2-2",
        width: 340,
        height: 300,
        label: "OPTIC.SENSOR",
        hasWireframeAccent: true,
      },
      {
        id: "r2-3",
        width: 450,
        height: 310,
        label: "PERMANENT // 200+",
        sub: "EXHIBIT HALL",
        imageSrc: "/lumen-museum-website-design.webp",
        objectPosition: "right top",
      },
      {
        id: "r2-4",
        width: 360,
        height: 300,
        label: "MUSEUM PERSPECTIVE",
        sub: "WINDOW PANELS",
        imageSrc: "/lumen-museum-website-design.webp",
        objectPosition: "left top",
      },
      {
        id: "r2-5",
        width: 320,
        height: 290,
        label: "ORTHO.GRID",
        hasWireframeAccent: true,
      },
    ],
  },
  {
    height: 310,
    speed: 58,
    cards: [
      {
        id: "r3-1",
        width: 470,
        height: 290,
        label: "LUMEN.MUSEUM",
        sub: "ORIGINAL WEB DESIGN",
        imageSrc: "/lumen-museum-website-design.webp",
        objectPosition: "center center",
      },
      {
        id: "r3-2",
        width: 310,
        height: 270,
        label: "FACET.3D",
        hasWireframeAccent: true,
      },
      {
        id: "r3-3",
        width: 440,
        height: 280,
        label: "CORDATE // 04",
        sub: "HISTORIC CLIMB",
        imageSrc: "/lumen-museum-website-design.webp",
        objectPosition: "center top",
      },
      {
        id: "r3-4",
        width: 330,
        height: 270,
        label: "SYNTHESIS // LIVE",
        hasWireframeAccent: true,
      },
      {
        id: "r3-5",
        width: 420,
        height: 280,
        label: "KRONOS MOUNTAIN",
        sub: "PANORAMA",
        imageSrc: "/lumen-museum-website-design.webp",
        objectPosition: "bottom left",
      },
    ],
  },
  {
    height: 320,
    speed: 48,
    cards: [
      {
        id: "r4-1",
        width: 330,
        height: 290,
        label: "DATUM.POINT",
        hasWireframeAccent: true,
      },
      {
        id: "r4-2",
        width: 450,
        height: 300,
        label: "YELLOW SHOP BOOK",
        sub: "EDITORIAL DESIGN",
        imageSrc: "/lumen-museum-website-design.webp",
        objectPosition: "bottom center",
      },
      {
        id: "r4-3",
        width: 300,
        height: 280,
        label: "VECTOR // MONO",
        hasWireframeAccent: true,
      },
      {
        id: "r4-4",
        width: 460,
        height: 300,
        label: "EXHIBIT.01",
        sub: "ALPINE ELEVATION",
        imageSrc: "/lumen-museum-website-design.webp",
        objectPosition: "top left",
      },
      {
        id: "r4-5",
        width: 380,
        height: 290,
        label: "ISO.FLOW // LUMEN",
        imageSrc: "/lumen-museum-website-design.webp",
        objectPosition: "center center",
      },
    ],
  },
  {
    height: 300,
    speed: 56,
    cards: [
      {
        id: "r5-1",
        width: 340,
        height: 280,
        label: "GALLERY // CORE",
        hasWireframeAccent: true,
      },
      {
        id: "r5-2",
        width: 450,
        height: 280,
        label: "KRONOS // TURQUOISE",
        sub: "LUMEN EXHIBIT",
        imageSrc: "/lumen-museum-website-design.webp",
        objectPosition: "bottom left",
      },
      {
        id: "r5-3",
        width: 320,
        height: 270,
        label: "PLATE #19",
        sub: "AXIS ROTATE",
        hasWireframeAccent: true,
      },
      {
        id: "r5-4",
        width: 440,
        height: 280,
        label: "CORDATE ARCHIVE",
        sub: "MOUNTAIN PASS",
        imageSrc: "/lumen-museum-website-design.webp",
        objectPosition: "center right",
      },
      {
        id: "r5-5",
        width: 300,
        height: 260,
        label: "SLOTH.N2C",
        hasWireframeAccent: true,
      },
    ],
  },
  {
    height: 340,
    speed: 44,
    cards: [
      {
        id: "r6-1",
        width: 440,
        height: 310,
        label: "KAIROS.31",
        sub: "GLACIAL HORIZON",
        imageSrc: "/lumen-museum-website-design.webp",
        objectPosition: "left bottom",
      },
      {
        id: "r6-2",
        width: 330,
        height: 300,
        label: "CORDATE // 04",
        hasWireframeAccent: true,
      },
      {
        id: "r6-3",
        width: 470,
        height: 320,
        label: "LUMEN.MUSEUM",
        sub: "DESIGN SYSTEM",
        imageSrc: "/lumen-museum-website-design.webp",
        objectPosition: "center center",
      },
      {
        id: "r6-4",
        width: 320,
        height: 300,
        label: "EXHIBIT.FINAL",
        hasWireframeAccent: true,
      },
      {
        id: "r6-5",
        width: 430,
        height: 310,
        label: "YELLOW ACCENT",
        sub: "SHOP CATALOGUE",
        imageSrc: "/lumen-museum-website-design.webp",
        objectPosition: "bottom right",
      },
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

  // Subtle interactive parallax tilt across 3D isometric plane
  const tiltX = useTransform(smoothY, [-0.5, 0.5], [6, -6]);
  const tiltY = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
  const panX = useTransform(smoothX, [-0.5, 0.5], [-30, 30]);
  const panY = useTransform(smoothY, [-0.5, 0.5], [-30, 30]);

  // Global window mouse listener ensures parallax works even with overlay elements
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const normX = e.clientX / innerWidth - 0.5;
      const normY = e.clientY / innerHeight - 0.5;
      mouseX.set(normX);
      mouseY.set(normY);
    };

    window.addEventListener("mousemove", handleWindowMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleWindowMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      className="absolute inset-0 z-0 w-full h-full overflow-hidden select-none pointer-events-none"
      style={{ perspective: "1400px" }}
    >
      {/* Architectural museum dot-matrix grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.2) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Ambient diagonal lighting for museum depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-yellow-500/10 pointer-events-none" />

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

      {/* Deep perimeter vignette for museum depth */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_180px_rgba(0,0,0,0.85)]" />
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
  const initialOffset = (rowIdx % 4) * -240;

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
      className="relative bg-white text-black rounded-none border-2 border-black p-4 flex flex-col justify-between transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.45)] shrink-0 pointer-events-none"
    >
      {/* Stark Editorial Header of the Window Panel */}
      <div className="flex justify-between items-start pointer-events-none">
        <div className="flex flex-col space-y-0.5">
          <span className="font-mono text-[9px] tracking-widest text-black/70 font-black uppercase">
            {spec.label || "CANVAS // ART"}
          </span>
          {spec.sub && (
            <span className="font-sans text-[11px] font-black tracking-tight text-black uppercase">
              {spec.sub}
            </span>
          )}
        </div>

        {/* Minimal catalog index tag */}
        <span className="font-mono text-[8px] text-black bg-yellow-400 border border-black px-1.5 py-0.5 font-bold tracking-tighter shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
          {spec.id.toUpperCase()}
        </span>
      </div>

      {/* Wireframe accent or vivid Lumen museum artwork */}
      {spec.imageSrc ? (
        <div className="flex-1 my-2 overflow-hidden border border-black bg-neutral-900 relative rounded-none shadow-inner">
          <img
            src={spec.imageSrc}
            alt={spec.label || "Lumen Museum Web Design"}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ objectPosition: spec.objectPosition || "center center" }}
          />
          <div className="absolute bottom-1 right-1 bg-black text-yellow-400 font-mono text-[8px] px-1.5 py-0.5 font-black uppercase border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            LUMEN.MUSEUM
          </div>
        </div>
      ) : spec.hasWireframeAccent ? (
        <div className="flex-1 my-2 border border-dashed border-black/30 rounded-none p-3 flex flex-col justify-between bg-neutral-100/90 pointer-events-none">
          <div className="flex justify-between items-center opacity-70">
            <div className="w-2 h-2 bg-black" />
            <div className="h-[2px] flex-1 mx-2 bg-black/40" />
            <div className="w-2 h-2 border-2 border-black" />
          </div>

          <div className="space-y-1.5 opacity-60">
            <div className="h-1.5 bg-black/60 w-3/4" />
            <div className="h-1.5 bg-black/40 w-1/2" />
          </div>

          <div className="flex justify-between items-end opacity-70 font-mono text-[8px] text-black font-black">
            <span>[NAPKIN.SYNTH]</span>
            <span>MOD: 0.84</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 my-2 flex items-center justify-center pointer-events-none bg-neutral-50 border border-black/10">
          {/* Stark empty window panel with a centered crosshair */}
          <div className="relative w-6 h-6 opacity-30">
            <div className="absolute inset-x-0 top-1/2 h-[2px] bg-black" />
            <div className="absolute inset-y-0 left-1/2 w-[2px] bg-black" />
          </div>
        </div>
      )}

      {/* Bottom Editorial Specs */}
      <div className="flex justify-between items-end pt-2 border-t border-black/20 pointer-events-none">
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 bg-black" />
          <span className="font-mono text-[8px] font-black tracking-wider text-black/70">
            SLOTH.GALLERY
          </span>
        </div>
        <span className="font-mono text-[8px] font-black tracking-widest text-black/60">
          DIM: {spec.width}x{spec.height}
        </span>
      </div>
    </div>
  );
}
