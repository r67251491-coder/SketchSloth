import { SAMPLE_WIREFRAME_BASE64 } from "./sampleWireframeBase64";

export type SketchType = "single" | "multi" | "dashboard";

export interface SampleSketchInfo {
  id: SketchType;
  label: string;
  badge: string;
  title: string;
  description: string;
  getBase64: () => string;
}

/**
 * Generates an authentic brutalist hand-drawn wireframe for a Multi-Screen Mobile Architecture
 */
export function generateMultiScreenSketch(): string {
  if (typeof document === "undefined") {
    return SAMPLE_WIREFRAME_BASE64;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext("2d");
  if (!ctx) return SAMPLE_WIREFRAME_BASE64;

  // Off-white napkin textured background
  ctx.fillStyle = "#faf9f6";
  ctx.fillRect(0, 0, 1200, 800);

  // Subtle napkin grid
  ctx.strokeStyle = "#e5e5e0";
  ctx.lineWidth = 1;
  for (let x = 0; x < 1200; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 800);
    ctx.stroke();
  }
  for (let y = 0; y < 800; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1200, y);
    ctx.stroke();
  }

  // Outer border
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 30, 1140, 740);

  // Header Banner
  ctx.fillStyle = "#111111";
  ctx.fillRect(40, 40, 1120, 70);
  ctx.fillStyle = "#ffea00";
  ctx.font = "bold 24px monospace";
  ctx.fillText("HEX CENTRAL // MULTI-SCREEN MOBILE ARCHITECTURE (10 SCREENS)", 60, 84);

  // Draw 6 wireframe phone cards in 2 rows of 3
  const cardW = 340;
  const cardH = 280;
  const gapX = 30;
  const gapY = 25;
  const startX = 60;
  const startY = 140;

  const cardTitles = [
    "[01] LOG IN SCREEN - User Auth",
    "[02] HOME SCREEN - Site Dispatch",
    "[03] SEARCH SITES - Facility Directory",
    "[04] SITE DETAILS - Telemetry & Audit",
    "[05] LOCATION MAP - GPS Coordinates",
    "[06] ATTACH PHOTOS - Optical Capture",
  ];

  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 4;

  cardTitles.forEach((title, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);

    // Card boundary
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, cardW, cardH);
    ctx.strokeRect(x, y, cardW, cardH);

    // Mini header bar
    ctx.fillStyle = "#111111";
    ctx.fillRect(x, y, cardW, 36);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px monospace";
    ctx.fillText(title, x + 10, y + 23);

    // Wireframe content elements inside card
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 2.5;

    if (idx === 0) {
      // Login
      ctx.strokeRect(x + 20, y + 60, cardW - 40, 36);
      ctx.strokeRect(x + 20, y + 110, cardW - 40, 36);
      ctx.fillStyle = "#ffea00";
      ctx.fillRect(x + 20, y + 170, cardW - 40, 40);
      ctx.strokeRect(x + 20, y + 170, cardW - 40, 40);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 14px monospace";
      ctx.fillText("LOGIN BUTTON", x + 100, y + 195);
    } else if (idx === 1) {
      // Home
      ctx.strokeRect(x + 20, y + 60, cardW - 40, 40);
      ctx.strokeRect(x + 20, y + 120, cardW - 40, 80);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 12px monospace";
      ctx.fillText("SEARCH SITES // CREATE ENTRY", x + 30, y + 160);
    } else if (idx === 2) {
      // Search
      ctx.strokeRect(x + 20, y + 55, cardW - 40, 32);
      ctx.strokeRect(x + 20, y + 100, cardW - 40, 40);
      ctx.strokeRect(x + 20, y + 150, cardW - 40, 40);
      ctx.strokeRect(x + 20, y + 200, cardW - 40, 40);
    } else if (idx === 3) {
      // Details
      ctx.strokeRect(x + 20, y + 55, cardW - 40, 60);
      for (let i = 0; i < 4; i++) {
        ctx.strokeRect(x + 20 + i * 72, y + 130, 62, 50);
      }
      ctx.strokeRect(x + 20, y + 200, cardW - 40, 40);
    } else if (idx === 4) {
      // Map
      ctx.strokeRect(x + 20, y + 55, cardW - 40, 140);
      ctx.beginPath();
      ctx.moveTo(x + 20, y + 55);
      ctx.lineTo(x + cardW - 20, y + 195);
      ctx.moveTo(x + cardW - 20, y + 55);
      ctx.lineTo(x + 20, y + 195);
      ctx.stroke();
      ctx.fillStyle = "#000000";
      ctx.font = "bold 14px monospace";
      ctx.fillText("[GPS MAP GRID 123 EXAMPLE ST]", x + 35, y + 225);
    } else {
      // Photos
      ctx.strokeRect(x + 20, y + 55, cardW - 40, 80);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 14px monospace";
      ctx.fillText("[CAMERA CAPTURE + ATTACH]", x + 50, y + 100);
      ctx.strokeRect(x + 20, y + 150, 85, 80);
      ctx.strokeRect(x + 125, y + 150, 85, 80);
      ctx.strokeRect(x + 230, y + 150, 85, 80);
    }
  });

  return canvas.toDataURL("image/jpeg", 0.92);
}

/**
 * Generates an authentic brutalist hand-drawn wireframe for a 2-Column Field Ops Dashboard
 */
export function generateDashboardSketch(): string {
  if (typeof document === "undefined") {
    return SAMPLE_WIREFRAME_BASE64;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext("2d");
  if (!ctx) return SAMPLE_WIREFRAME_BASE64;

  // Off-white napkin textured background
  ctx.fillStyle = "#f8f9fa";
  ctx.fillRect(0, 0, 1200, 800);

  // Subtle grid
  ctx.strokeStyle = "#e9ecef";
  ctx.lineWidth = 1;
  for (let x = 0; x < 1200; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 800);
    ctx.stroke();
  }
  for (let y = 0; y < 800; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1200, y);
    ctx.stroke();
  }

  // Outer border
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 30, 1140, 740);

  // Top Nav / Header
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(50, 50, 1100, 80);
  ctx.strokeRect(50, 50, 1100, 80);

  ctx.fillStyle = "#000000";
  ctx.font = "bold 26px monospace";
  ctx.fillText("FIELD OPS DASHBOARD // SYSTEM TELEMETRY", 80, 100);

  ctx.fillStyle = "#ffea00";
  ctx.fillRect(940, 65, 180, 50);
  ctx.strokeRect(940, 65, 180, 50);
  ctx.fillStyle = "#000000";
  ctx.font = "bold 16px monospace";
  ctx.fillText("STATUS: ONLINE", 960, 96);

  // Column 1: HERO COMPONENT (2/3 width)
  const heroX = 50;
  const heroY = 160;
  const heroW = 700;
  const heroH = 580;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(heroX, heroY, heroW, heroH);
  ctx.strokeRect(heroX, heroY, heroW, heroH);

  // Hero Title
  ctx.fillStyle = "#111111";
  ctx.font = "bold 24px monospace";
  ctx.fillText("HERO COMPONENT // PRIMARY WORKSPACE", heroX + 30, heroY + 50);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(heroX + 30, heroY + 70);
  ctx.lineTo(heroX + heroW - 30, heroY + 70);
  ctx.stroke();

  // 3 KPI metric boxes inside Hero
  const kpiW = 190;
  const kpiH = 100;
  for (let i = 0; i < 3; i++) {
    const kx = heroX + 30 + i * (kpiW + 30);
    const ky = heroY + 100;
    ctx.fillStyle = "#f1f3f5";
    ctx.fillRect(kx, ky, kpiW, kpiH);
    ctx.strokeRect(kx, ky, kpiW, kpiH);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 12px monospace";
    const labels = ["TOTAL DEPLOYS", "UPTIME SLA", "LATENCY"];
    const vals = ["14 CLUSTERS", "99.98%", "12 MS"];
    ctx.fillText(labels[i], kx + 15, ky + 35);
    ctx.font = "bold 20px monospace";
    ctx.fillText(vals[i], kx + 15, ky + 75);
  }

  // Workload Control Action Buttons inside Hero
  ctx.fillStyle = "#000000";
  ctx.fillRect(heroX + 30, heroY + 460, 280, 60);
  ctx.fillStyle = "#ffea00";
  ctx.font = "bold 18px monospace";
  ctx.fillText("⚡ DEPLOY WORKLOAD", heroX + 60, heroY + 497);

  ctx.fillStyle = "#ffffff";
  ctx.strokeRect(heroX + 340, heroY + 460, 200, 60);
  ctx.fillStyle = "#000000";
  ctx.font = "bold 16px monospace";
  ctx.fillText("TOGGLE STATE", heroX + 375, heroY + 497);

  // Column 2: SIDEBAR STATS (1/3 width)
  const sideX = 780;
  const sideY = 160;
  const sideW = 370;
  const sideH = 580;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(sideX, sideY, sideW, sideH);
  ctx.strokeRect(sideX, sideY, sideW, sideH);

  ctx.fillStyle = "#111111";
  ctx.font = "bold 22px monospace";
  ctx.fillText("SIDEBAR STATS", sideX + 30, sideY + 50);
  ctx.beginPath();
  ctx.moveTo(sideX + 30, sideY + 70);
  ctx.lineTo(sideX + sideW - 30, sideY + 70);
  ctx.stroke();

  // Progress Bars for CPU & RAM
  const stats = [
    { name: "CPU LOAD: 64%", barW: 0.64 },
    { name: "MEMORY: 8.2 / 16 GB", barW: 0.51 },
    { name: "NETWORK: 1.42 GB/S", barW: 0.82 },
  ];

  stats.forEach((st, idx) => {
    const sy = sideY + 110 + idx * 110;
    ctx.fillStyle = "#000000";
    ctx.font = "bold 14px monospace";
    ctx.fillText(st.name, sideX + 30, sy);

    ctx.strokeRect(sideX + 30, sy + 15, sideW - 60, 30);
    ctx.fillStyle = idx === 0 ? "#111111" : "#ffea00";
    ctx.fillRect(sideX + 30, sy + 15, (sideW - 60) * st.barW, 30);
  });

  return canvas.toDataURL("image/jpeg", 0.92);
}

/**
 * Returns sample sketch base64 by type
 */
export function getSampleSketchByType(type: SketchType): string {
  switch (type) {
    case "multi":
      return generateMultiScreenSketch();
    case "dashboard":
      return generateDashboardSketch();
    case "single":
    default:
      return SAMPLE_WIREFRAME_BASE64;
  }
}
