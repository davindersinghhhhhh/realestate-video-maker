import React from 'react';
import { BookOpen, Building2, Download } from 'lucide-react';
import { SAMPLE_PROPERTIES } from '../data/sampleProperties';
import { PropertyDetails, PropertyImage, Scene } from '../types/property';
import { SearchBar } from './SearchBar';

interface HeaderProps {
  currentProperty: PropertyDetails;
  currentScenes: Scene[];
  onSelectSample: (details: PropertyDetails) => void;
  onSelectScene: (sceneIndex: number) => void;
  onAddMediaImage: (image: PropertyImage) => void;
  onOpenDocs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProperty,
  currentScenes,
  onSelectSample,
  onSelectScene,
  onAddMediaImage,
  onOpenDocs,
}) => {
  return (
    <header className="bg-black border-b border-zinc-800 text-white sticky top-0 z-40 backdrop-blur-md bg-black/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand - Davinder Singh */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-9 h-9 rounded-none bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30 text-white font-black text-base tracking-tighter border border-red-500">
            DS
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-2">
              <span className="font-black tracking-tight text-white text-base uppercase">
                DAVINDER SINGH
              </span>
              <span className="bg-red-600/10 text-red-500 border border-red-600/30 text-[9px] font-bold px-1.5 py-0.5 rounded-none uppercase tracking-widest">
                REALTOR AI
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
              AI Property Video Studio • Indian Real Estate (INR ₹)
            </p>
          </div>
        </div>

        {/* Global Fast Search Bar */}
        <SearchBar
          currentProperty={currentProperty}
          currentScenes={currentScenes}
          onSelectProperty={onSelectSample}
          onSelectScene={onSelectScene}
          onAddMediaImage={onAddMediaImage}
        />

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Preset Selector */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-zinc-950 border border-zinc-800 rounded-none p-1">
            <span className="text-[11px] font-bold text-zinc-400 pl-2 flex items-center uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 mr-1 text-red-500" />
              Presets:
            </span>
            <select
              aria-label="Load Sample Listing"
              onChange={(e) => {
                if (e.target.value && SAMPLE_PROPERTIES[e.target.value]) {
                  onSelectSample(SAMPLE_PROPERTIES[e.target.value]);
                }
              }}
              defaultValue=""
              className="bg-black text-xs text-white rounded-none px-2.5 py-1.5 border border-zinc-800 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 cursor-pointer font-medium"
            >
              <option value="" disabled>Load Sample Property...</option>
              <option value="sunset-loft">The Lumina 2-BHK (₹1.85 Cr - Gurugram)</option>
              <option value="emerald-villa">Villa Bellisima Estate (₹8.45 Cr - Goa)</option>
              <option value="urban-penthouse">The Crown Penthouse (₹14.50 Cr - Worli)</option>
              <option value="bangalore-loft">Indiranagar Terrace (₹3.25 Cr - Bengaluru)</option>
              <option value="expressway-2bhk">Godrej Meridian 2-BHK (₹95 Lakh)</option>
            </select>
          </div>

          {/* Download Source Code ZIP */}
          <a
            href="/realty-assistant-source.zip"
            download="davinder-singh-realestate-assistant.zip"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
            title="Download complete source code (.zip)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Download Code</span>
            <span className="md:hidden">.ZIP</span>
          </a>

          {/* Submission / Docs Button */}
          <button
            onClick={onOpenDocs}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden sm:inline">Docs</span>
            <span className="sm:hidden">Docs</span>
          </button>
        </div>
      </div>
    </header>
  );
};
