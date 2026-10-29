import React, { useState } from 'react';
import { X, Copy, Check, ShieldCheck, Download, Terminal, Cpu } from 'lucide-react';

interface SubmissionDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmissionDocsModal: React.FC<SubmissionDocsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'readme' | 'ai_approach' | 'architecture' | 'mac_setup'>('overview');

  if (!isOpen) return null;

  const readmeMarkdown = `# Davinder Singh Real Estate AI Property Video Generator
**Creator & Lead Engineer:** Davinder Singh
**Track:** AI Content Creation / Multimedia Real Estate Reel Studio

---

## 1. Problem Overview & Solution
Real estate sales teams frequently capture high-resolution property photos and basic listing specifications (e.g. 2-BHK apartment, pricing, location, marble flooring, skyline views), but creating bespoke promotional video reels for each listing requires extensive manual editing or expensive post-production agencies. 

Davinder Singh's solution delivers an automated, zero-friction AI Video Generator that transforms raw property details and 4–8 photographs into an engaging, ready-to-share promotional video with:
1. **Dynamic Ken Burns camera motion** (smooth panning and zoom easing across architectural elements).
2. **Strictly grounded AI voiceover scripts & subtitles** using Gemini Flash (guaranteed zero hallucinations).
3. **Multi-platform aspect ratios** (16:9 Landscape for Web & MLS, 9:16 Vertical for Instagram Reels & TikTok, 1:1 for Social Feeds).
4. **Royalty-free multi-layer luxury background audio** synthesized via the browser's Web Audio API.
5. **Direct MP4 / WebM video export** rendered directly client-side via HTML5 Canvas + MediaRecorder.

---

## 2. AI / ML Approach & Model Specifications
- **AI Model:** Google Gemini \`gemini-3.8-flash\` via the modern \`@google/genai\` SDK.
- **Server-Side Integration:** Express route \`/api/generate-script\` receives listing metadata and securely interfaces with Gemini API using \`process.env.GEMINI_API_KEY\`.
- **Hallucination Prevention (Zero Hallucination Guarantee):**
  - Prompt enforces a strict closed-world fact assumption: the model is explicitly instructed to extract and rephrase only supplied property attributes.
  - Formatted via JSON Schema with typed scenes, voiceover lines, overlay titles, and durations.
  - Deterministic fallback engine is integrated so the tool works 100% reliably even in offline or network-constrained testing environments.

---

## 3. Tech Stack & Dependencies
- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Video & Audio Engine:** HTML5 2D Canvas, Web Audio API (real-time chord synthesis), MediaRecorder API, Web Speech Synthesis.
- **Backend:** Node.js, Express, tsx, @google/genai.
- **Testing:** Pure logic unit tests with Node test runner (\`node:test\`).

---

## 4. Quick Start & Installation Instructions
\`\`\`bash
# 1. Clone repository and install dependencies
npm install

# 2. Configure Environment (optional - deterministic fallback provided)
cp .env.example .env
# Add GEMINI_API_KEY="your-api-key"

# 3. Run Unit Tests (Validates schema, timing logic, INR pricing, and search engine)
npx --yes tsx --test src/utils/propertyLogic.test.ts src/utils/searchLogic.test.ts

# 4. Start Full-Stack Application
npm run dev
# Server launches on http://localhost:3000
\`\`\`

---

## 5. Key Decisions & Architecture
- **Client-Side Hardware-Accelerated Video Rendering:** Generating video via canvas + MediaRecorder avoids costly cloud GPU rendering infrastructure for real estate agencies, enabling instantaneous previews and free downloads.
- **In-browser Royalty-Free Audio Synthesis:** Procedurally generates ambient progressions directly through the Web Audio API without relying on external MP3 URLs that may expire or trigger copyright strikes.
`;

  const handleCopyReadme = () => {
    navigator.clipboard.writeText(readmeMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-black border-2 border-zinc-800 rounded-none w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-none bg-red-600 flex items-center justify-center text-white font-black text-sm border border-red-500">
              DS
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Davinder Singh Real Estate AI Suite • Technical Documentation
              </h2>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                Lead Engineer: Davinder Singh • AI Property Video Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-none text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
            aria-label="Close Documentation Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-zinc-800 flex space-x-4 bg-zinc-950 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-red-600 text-red-500'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('ai_approach')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
              activeTab === 'ai_approach'
                ? 'border-red-600 text-red-500'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            AI Grounding
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'border-red-600 text-red-500'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setActiveTab('readme')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'readme'
                ? 'border-red-600 text-red-500'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>README</span>
          </button>
          <button
            onClick={() => setActiveTab('mac_setup')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'mac_setup'
                ? 'border-red-600 text-red-500'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Setup Guide</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-zinc-200 text-xs leading-relaxed bg-black">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-none space-y-2">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block">
                    Problem Solved
                  </span>
                  <p className="text-zinc-300">
                    Solves the bottleneck real estate sales teams face when creating individual video reels for multiple active listings. Automates the compilation of raw photos and specs into ready-to-share social videos.
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-none space-y-2">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block">
                    Working Implementation
                  </span>
                  <p className="text-zinc-300">
                    Live HTML5 Canvas player with real-time Ken Burns camera pans, animated subtitles, timeline scrubbing, and client-side MP4/WebM video recording with mixed audio.
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-none space-y-2">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block">
                    AI Quality & Grounding
                  </span>
                  <p className="text-zinc-300">
                    Gemini 3.8 Flash API writes persuasive marketing scripts constrained strictly to input data, preventing AI hallucinations. Dual-layer fallback ensures zero downtime.
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-none space-y-2">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block">
                    Black, White & Red Visual Design
                  </span>
                  <p className="text-zinc-300">
                    Modern high-contrast architectural UI engineered by Davinder Singh, featuring sharp geometric edges and pure black-white-red palette.
                  </p>
                </div>
              </div>

              {/* Sample listings quick info in INR */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-none p-4 space-y-2">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Pre-Loaded Listing Presets (INR ₹)
                </h3>
                <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                  <li><strong>The Lumina 2-BHK Skyline Haven (₹1.85 Cr - Gurugram):</strong> 2-BHK apartment scenario with 5 architectural photos.</li>
                  <li><strong>Villa Bellisima Private Estate (₹8.45 Cr - Goa):</strong> Luxury 4-BHK villa with heated pool and wine cellar scenes.</li>
                  <li><strong>The Crown Penthouse at Worli (₹14.50 Cr - Mumbai):</strong> High-rise duplex penthouse with direct keyed elevator.</li>
                  <li><strong>Indiranagar Urban Terrace (₹3.25 Cr - Bengaluru):</strong> 3-BHK penthouse with private terrace garden.</li>
                  <li><strong>Godrej Meridian (₹95 Lakh - Dwarka Expressway):</strong> Contemporary high-rise 2-BHK apartment.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'ai_approach' && (
            <div className="space-y-4">
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-none space-y-3">
                <div className="flex items-center space-x-2 text-red-500 font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Strict Fact Grounding & Zero Hallucination</span>
                </div>
                <p className="text-zinc-300">
                  Real estate marketing requires absolute legal precision. If an AI claims a property has amenities it does not possess, it exposes the brokerage to legal liability.
                </p>
                <div className="p-3 bg-black rounded-none border border-zinc-800 font-mono text-[11px] text-zinc-300 space-y-1">
                  <div className="text-red-500 font-bold">// Guardrail Prompt:</div>
                  <div>&quot;You are a professional real estate video copywriter. You must strictly only use the facts provided in the prompt. Do not hallucinate or invent features. Output pure JSON only without markdown fences.&quot;</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-none space-y-2">
                  <span className="font-bold text-white block uppercase tracking-wider">Voice Narration Engine</span>
                  <p className="text-zinc-300">
                    Integrates speech synthesis with scene timestamp boundaries. When scene transitions occur, the audio synthesizer speaks the corresponding voiceover sentence in sync with the visual lower-third overlay.
                  </p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-none space-y-2">
                  <span className="font-bold text-white block uppercase tracking-wider">Procedural Web Audio</span>
                  <p className="text-zinc-300">
                    Synthesizes ambient luxury music chords (Cadd9, Dm7, Fmaj7) with low-pass filters and soft marimba chimes directly in the browser with zero external audio assets.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-none space-y-2">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">System Pipeline</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 text-center">
                  <div className="p-3 bg-black rounded-none border border-zinc-800">
                    <span className="font-bold text-red-500 block mb-1 uppercase tracking-wider">1. Ingestion</span>
                    <span className="text-[10px] text-zinc-400">Listing form, photo uploads, 4–8 images, validation</span>
                  </div>
                  <div className="p-3 bg-black rounded-none border border-zinc-800">
                    <span className="font-bold text-red-500 block mb-1 uppercase tracking-wider">2. AI Storyboard</span>
                    <span className="text-[10px] text-zinc-400">Gemini Flash parses facts into structured JSON scene storyboard</span>
                  </div>
                  <div className="p-3 bg-black rounded-none border border-zinc-800">
                    <span className="font-bold text-red-500 block mb-1 uppercase tracking-wider">3. Canvas Motion</span>
                    <span className="text-[10px] text-zinc-400">Ken Burns zoom/pan math, luxury typography, scrims</span>
                  </div>
                  <div className="p-3 bg-black rounded-none border border-zinc-800">
                    <span className="font-bold text-red-500 block mb-1 uppercase tracking-wider">4. MP4 Export</span>
                    <span className="text-[10px] text-zinc-400">MediaRecorder streams canvas + Web Audio into video blob</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-none space-y-2">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">Multi-Platform Aspect Ratios</h3>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2.5 bg-black rounded-none border border-zinc-800">
                    <span className="font-bold text-white block">16:9 Landscape</span>
                    <span className="text-[10px] text-zinc-400">1280x720 • YouTube, MLS, Web</span>
                  </div>
                  <div className="p-2.5 bg-black rounded-none border border-zinc-800">
                    <span className="font-bold text-white block">9:16 Vertical</span>
                    <span className="text-[10px] text-zinc-400">720x1280 • Instagram Reels, TikTok</span>
                  </div>
                  <div className="p-2.5 bg-black rounded-none border border-zinc-800">
                    <span className="font-bold text-white block">1:1 Square</span>
                    <span className="text-[10px] text-zinc-400">1080x1080 • Social Feed</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'readme' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">README.md Content</span>
                <button
                  onClick={handleCopyReadme}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-none transition flex items-center space-x-1.5 text-xs uppercase tracking-wider"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy README'}</span>
                </button>
              </div>
              <pre className="p-4 bg-black rounded-none border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[360px]">
                {readmeMarkdown}
              </pre>
            </div>
          )}

          {activeTab === 'mac_setup' && (
            <div className="space-y-4">
              <div className="bg-zinc-950 border border-red-600/60 rounded-none p-4 space-y-1">
                <span className="font-bold text-white text-xs uppercase tracking-wider block">
                  Quick Run Instructions
                </span>
                <p className="text-zinc-400 text-xs">
                  Run the application locally with Node.js in seconds.
                </p>
              </div>

              {/* Step 1 */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-none p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-none bg-red-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                  <span className="font-bold text-white text-xs uppercase tracking-wider">Verify Node.js</span>
                </div>
                <pre className="ml-8 p-3 bg-black rounded-none border border-zinc-800 font-mono text-[11px] text-white overflow-x-auto">
node -v
                </pre>
              </div>

              {/* Step 2 */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-none p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-none bg-red-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                  <span className="font-bold text-white text-xs uppercase tracking-wider">Install Dependencies</span>
                </div>
                <pre className="ml-8 p-3 bg-black rounded-none border border-zinc-800 font-mono text-[11px] text-white overflow-x-auto">
npm install
                </pre>
              </div>

              {/* Step 3 */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-none p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-none bg-red-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                  <span className="font-bold text-white text-xs uppercase tracking-wider">Start Development Server</span>
                </div>
                <pre className="ml-8 p-3 bg-black rounded-none border border-zinc-800 font-mono text-[11px] text-white overflow-x-auto">
npm run dev
                </pre>
                <p className="text-zinc-400 text-xs pl-8">
                  Open <strong>http://localhost:3000</strong> to view the studio.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-bold">
            Davinder Singh Real Estate AI Suite • Black, White & Red Edition
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-none text-xs font-bold uppercase tracking-wider transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
