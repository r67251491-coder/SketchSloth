# 🦥 SKETCHSLOTH — NAPKIN-TO-CODE

> **Deterministic Image-to-Code Compiler for Hand-Drawn UI Sketches.**  
> Built with Next.js 16 (Turbopack), Tailwind CSS, Lucide Icons, React-Live, and Local Vision Models via Ollama.

---

## ⚡ Overview

**SketchSloth** compiles napkin wireframes and whiteboard diagrams directly into functional, responsive, and compilable Next.js TSX components.

### Core Features

- **Brutalist Tactile UI**: Stark black borders (`border-4 border-black`), electric yellow accents (`bg-yellow-400`), high-contrast neo-brutalist shadows (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`), and mechanical feedback.
- **Multi-Input Wireframe Synthesis**:
  1. **Single-Screen Item Record**: Mobile form with tactile file upload, category title, multi-line descriptions, and record submission (`LOST AND FOUND ITEMS`).
  2. **10-Screen Architecture Grid**: Multi-screen mobile architecture blueprint (`HEX CENTRAL // FIELD OPS`) with responsive screen switcher tabs (`[01] Log In`, `[02] Home`, `[03] Search Sites`, `[04] Site Details`, `[05] Edit Address`, `[06] Create Site`, `[07] User Menu`, `[08] Photos`, `[09] Map`, `[10] Docs`).
  3. **2-Column Field Ops Dashboard**: Telemetry dashboard with **Hero Component** (14 cluster deploys, 99.98% SLA, 12ms latency, deploy workload actions) and **Sidebar Stats** (live CPU 64%, Memory 8.2/16GB DDR5, network throughput meters).
- **Dual Pipeline (Streaming LLM + Spatial Synthesizer)**:
  - Streams TSX code from local vision models (`llama3.2-vision` or `moondream` on `127.0.0.1:11434`).
  - Automatic spatial grounding fallback: if small vision models output coordinate bounding boxes or time out under CPU load, the spatial synthesizer instantly reconstructs the complete functional component with zero downtime.
- **Live React-Live Execution**: Auto-sanitizes code, auto-balances brackets, strips preamble artifacts, and executes the component live in a sandboxed interactive preview.
- **Audio & Visual FX**: Tactile shutter clicks, cyber laser sweep audio feedback, and 100ms white optical flash on wireframe capture.

---

## 🚀 Quick Start Guide

### 1. Start Ollama with Permissive Origins (PowerShell)
```powershell
$env:OLLAMA_ORIGINS="*"; ollama serve
```
*(Or double-click `start_ollama.bat` located in the project directory).*

### 2. Verify or Pull the Vision Model
```powershell
ollama pull llama3.2-vision
# Or lightweight alternative:
ollama pull moondream
```

### 3. Install Dependencies & Launch Dev Server
```bash
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

---

## 📐 Best Practices for Drawing Wireframes (Pencil & Ruler Guidelines)

For optimal optical character recognition and deterministic layout compilation by vision models (Llama 3.2-Vision / Moondream):

> [!IMPORTANT]
> **Use a Ruler/Scale and Sharp Pencil/Pen — Do Not Submit Rough Freehand Scribbles!**
> Vision models perform spatial object detection by recognizing geometric rectangular boundaries and clear contrast edges. Hand-wavy scribbles or messy doodles often trigger object-detection loops or hallucinated spatial coordinates.

### 1. Straight Geometric Lines with a Scale / Ruler
* **Card & Screen Boundaries**: Always use a ruler or straight edge to draw rectangular screen borders and container cards.
* **Component Outlines**: Input boxes, buttons, navigation bars, and modal windows must have distinct, closed rectangular borders.
* **Avoid Freehand Curves**: Do not draw shaky, rounded, or incomplete loops for structural UI containers.

### 2. Legible Block Lettering
* **All-Caps Block Text**: Write all UI labels, button text, and headings in legible uppercase print (e.g., `HERO COMPONENT`, `SIDEBAR STATS`, `LOG IN`, `SEARCH SITES`).
* **Text Inside Boundaries**: Ensure text is centered or neatly positioned inside its corresponding button or card border without overlapping line edges.
* **Semantic Placeholders**: Use clear prompt markers like `//Descriptions`, `[Upload Photo]`, or `[Map View]` to signal specialized UI widgets.

### 3. High Contrast & Lighting Conditions
* **Paper & Ink**: Draw on plain white paper (unlined or light grid paper) using dark black ink, felt-tip pen, or a dark #2/HB pencil with firm stroke pressure.
* **Uniform Illumination**: When capturing via webcam or smartphone, avoid casting shadows across the paper or introducing shiny camera flash glare.
* **Ortho-Planar Alignment**: Align the camera squarely perpendicular (flat top-down angle) to the sheet of paper rather than at a steep tilt.

### 4. Clear Multi-Screen Separation
* When sketching multi-screen architectures (e.g. 2x3 or 2x5 grids), number each screen card explicitly in the top header bar (`[01] LOG IN`, `[02] HOME`, `[03] SEARCH`).
* Maintain consistent gutters (margins) between individual screen frames.

---

## 🛠️ Testing Multiple Distinct Inputs

SketchSloth provides 3 built-in sample wireframes accessible directly from the **OPTICAL INPUT** section header or central drop zone:

1. **`[1] LOST & FOUND`**: Single-screen mobile item submission.
2. **`[2] MULTI-SCREEN`**: 10-screen mobile architecture grid (`Hex Central`).
3. **`[3] DASHBOARD`**: 2-column Field Ops Dashboard with live meters.

Click any of the sample buttons, then click **`PROCESS SKETCH`** to observe the optical laser scan and watch the corresponding Next.js TSX code stream directly into the live preview.

---

## 🏗️ Production Build & Verification

To validate TypeScript compilation and production optimization:
```bash
npm run build
```

---

## 📂 Project Architecture

```
SketchSloth/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Main application orchestration & state
│   │   ├── layout.tsx             # Root layout with fonts & metadata
│   │   └── globals.css            # Brutalist CSS tokens & animations
│   ├── components/
│   │   ├── Header.tsx             # 3-step navigation & engine status
│   │   ├── OpticalInput.tsx       # Webcam feed, sample wireframes, audio FX
│   │   ├── CodeOutput.tsx         # Split code view & React-Live interactive preview
│   │   └── InfiniteGalleryFlow.tsx# Community wireframe showcase
│   ├── hooks/
│   │   └── useSketchEngine.ts     # Ollama streaming hook & error handling
│   └── lib/
│       ├── sampleWireframes.ts    # Wireframe canvas generators for 3 sample types
│       ├── wireframeSynthesizer.ts# Dynamic spatial synthesizer & failsafes
│       └── imageNormalizer.ts     # Proportionate scaling to max 1024px
├── start_ollama.bat               # Windows 1-click startup script for Ollama
└── package.json
```

---

## 🛡️ License

MIT License. Designed and engineered for high-performance napkin-to-code compilation.
