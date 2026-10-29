# Davinder Singh Real Estate AI • Property Video Studio

> **High-Performance AI Multimedia Studio for Indian Real Estate (INR ₹)**  
> **Developed by:** Davinder Singh  
> **Aesthetic:** Minimalist High-Contrast Architectural UI (Black, White & Red • Sharp Geometric)

---

## 📌 Executive Overview

Creating bespoke promotional video reels for active real estate listings typically requires hours of manual post-production or expensive agency contracts.

**Davinder Singh Real Estate AI** automates this entire pipeline. By supplying core property specifications (pricing in INR ₹, carpet area, location, key amenities) and 4–8 photographs, the engine immediately generates an engaging, ready-to-share promotional video reel featuring:

1. **Cinematic Ken Burns Camera Motion:** Smooth hardware-accelerated panning and zoom easing focused on architectural details.
2. **Zero-Hallucination AI Copywriting:** Powered by **Google Gemini 3.8 Flash** (`@google/genai`) with strict closed-world fact grounding that guarantees marketing claims never hallucinate non-existent amenities.
3. **Multi-Platform Aspect Ratios:**
   - **16:9 Landscape** (1280×720) — Portals, MLS, YouTube, Website Showcase
   - **9:16 Vertical** (720×1280) — Instagram Reels, TikTok, YouTube Shorts
   - **1:1 Square** (1080×1080) — Instagram & Facebook Feed Carousels
4. **Procedural In-Browser Web Audio Synthesizer:** Multi-layered luxury ambient chords generated dynamically via the Web Audio API—completely royalty-free and immune to dead audio URLs or portal copyright strikes.
5. **Client-Side MP4/WebM Video Export:** Real-time video encoding directly in the browser via HTML5 2D Canvas and the MediaRecorder API, eliminating expensive cloud GPU rendering costs.

---

## 🎨 Visual Identity & Frontend Architecture

The frontend follows a strict **3-color minimalist architectural palette** engineered for high-end luxury real estate:

* **Pure Black (`#000000` / `bg-black` / `bg-zinc-950`):** Seamless dark surface backgrounds, devoid of slate/blue tints.
* **Pure White (`#ffffff` / `text-white`):** Crisp high-contrast typography, structural outlines, and iconography.
* **Crimson Red (`#dc2626` / `border-red-600`):** Sharp focus rings, active tab indicators, timeline scrubbers, and primary CTAs.
* **Sharp Geometric Structure (`rounded-none`):** Zero rounded bubble shapes; uses razor-sharp rectangular cards, technical crosshair viewport markers, and linear dividers inspired by modern architectural design.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite, Tailwind CSS v4 |
| **Motion & Icons** | Motion (Framer Motion), Lucide React |
| **AI / LLM Integration** | Google Gemini `gemini-3.8-flash` via `@google/genai` SDK |
| **Video Engine** | HTML5 2D Canvas, Ken Burns Matrix Math, MediaRecorder API |
| **Audio Engine** | Web Audio API (real-time chord synthesis), Web Speech API |
| **Backend API** | Node.js, Express, tsx, dotenv |
| **Unit Testing** | Native Node Test Runner (`node:test`, `node:assert/strict`) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **npm** or **bun** / **pnpm**

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/your-username/realestate-assistant.git
cd realestate-assistant
npm install
```

### 3. Configure Environment Variables (Optional)
The system includes an instantaneous **deterministic fallback engine** that operates with 100% offline reliability. To activate live Gemini Flash AI generation, add your Gemini API key:

```bash
cp .env.example .env
```

Edit `.env` and set your key:
```env
PORT=3000
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 4. Run Pure Logic Unit Tests
Execute the unit tests to verify property validation, Indian Rupee (INR) price formatting, scene timing math, and the fast search engine:

```bash
npx tsx --test src/utils/propertyLogic.test.ts src/utils/searchLogic.test.ts
```

### 5. Launch Development Server
```bash
npm run dev
```

Open your browser to:
```
http://localhost:3000
```

---

## 📂 Project Structure

```
├── public/                     # Static media assets & sample video
│   ├── sample-property-video.mp4
│   └── assets/
├── src/
│   ├── components/             # React UI Components
│   │   ├── Header.tsx          # DS branding, global search, presets & downloads
│   │   ├── SearchBar.tsx       # Sub-millisecond Cmd+K search across catalog & media
│   │   ├── PropertyForm.tsx    # 4-step listing editor with live validation & photo upload
│   │   ├── ScriptEditor.tsx    # Scene-by-scene storyboard editor with voice preview
│   │   ├── VideoStudio.tsx     # Canvas player, aspect ratio switcher & MP4 export
│   │   └── SubmissionDocsModal.tsx # Built-in technical documentation modal
│   ├── data/
│   │   └── sampleProperties.ts # Pre-loaded test properties formatted in INR (₹)
│   ├── types/
│   │   └── property.ts         # TypeScript schema definitions (Project, Scene, Details)
│   ├── utils/
│   │   ├── audioSynthesizer.ts # Procedural Web Audio API synthesis & speech narration
│   │   ├── propertyLogic.ts    # Validation, INR price math, deterministic script engine
│   │   ├── propertyLogic.test.ts # Unit tests for pure property logic
│   │   ├── searchLogic.ts      # Fast indexing & search engine across catalog/media
│   │   ├── searchLogic.test.ts # Unit tests for search functionality
│   │   └── videoRenderer.ts    # Real-time Ken Burns canvas renderer & video exporter
│   ├── App.tsx                 # Main application layout and state manager
│   ├── index.css               # Tailwind CSS v4 base & custom black/red scrollbar styles
│   └── main.tsx                # React application entry point
├── .env.example                # Template for environment variables
├── index.html                  # HTML5 entry with Space Grotesk typography
├── metadata.json               # Application capabilities manifest
├── package.json                # Dependencies and project scripts
├── server.ts                   # Express server with /api/generate-script endpoint
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite bundler configuration
```

---

## 🏢 Pre-Loaded Indian Real Estate Test Presets

The application comes pre-loaded with diverse test listings formatted in **Indian Rupees (INR ₹)**:

| Listing Name | Property Type | Location | Pricing | Media |
| :--- | :--- | :--- | :--- | :--- |
| **The Lumina Skyline Haven** | 2-BHK Designer Apartment | DLF Cyber City, Gurugram | ₹1.85 Cr | 5 Photos |
| **Villa Bellisima Private Estate** | 4-BHK Luxury Pool Villa | Assagao, North Goa | ₹8.45 Cr | 5 Photos |
| **The Crown Penthouse** | 4-BHK Duplex Penthouse | Worli Sea Face, South Mumbai | ₹14.50 Cr | 5 Photos |
| **Indiranagar Urban Terrace** | 3-BHK Garden Penthouse | 100ft Road, Bengaluru | ₹3.25 Cr | 4 Photos |
| **Godrej Meridian High-Rise** | 2-BHK Modern Apartment | Dwarka Expressway, Gurugram | ₹95 Lakh | 4 Photos |

---

## 🔍 Key Architectural Decisions & Engineering Highlights

### 1. In-Browser Client-Side Video Rendering
* **Decision:** Video frames are drawn onto an HTML5 2D Canvas at 30 FPS using parametric Ken Burns math ($s(t) = s_0 + (s_1 - s_0) \cdot \text{ease}(t)$) and recorded directly via `MediaRecorder`.
* **Benefit:** Zero server GPU costs, immediate client previews, and zero rendering queue wait time for real estate agents.

### 2. Zero-Hallucination Guardrails
* **Decision:** The Gemini Flash prompt enforces a strict closed-world fact boundary:
  ```text
  "You are a professional real estate video copywriter. You must strictly only use the facts provided in the prompt. Do not hallucinate or invent features. Output pure JSON only."
  ```
* **Benefit:** Brokerages avoid legal liability from AI inventing non-existent parking spaces, balconies, or views.

### 3. Procedural Luxury Audio Synthesis
* **Decision:** Instead of loading copyrighted or ephemeral MP3 audio tracks, a procedural Web Audio graph generates lush ambient musical progressions (Cadd9, Dm7, Fmaj7) directly using oscillators, biquad filters, and gain ramps.
* **Benefit:** 100% royalty-free, zero network requests for audio files, and zero copyright strikes on social media.

### 4. Global Sub-Millisecond Search (`Cmd + K`)
* **Decision:** Pure in-memory keyword token indexing across property titles, locations, key features, scene overlays, and curated photo libraries.
* **Benefit:** Instantaneous search and 1-click addition of stock photos to active listings.

---

## 🧪 Quality Assurance & Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts full-stack server (Vite + Express backend on port 3000) |
| `npm run build` | Compiles frontend assets for production |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npx tsx --test <path>` | Executes pure logic unit tests |

---

## 👤 Author

**Davinder Singh**  
*Lead Architect & Full-Stack AI Engineer*  
*Contact:* [davinder@singhrealty.com](mailto:davinder@singhrealty.com) | +91 98110 24890  
*Project:* Davinder Singh Real Estate AI Suite

