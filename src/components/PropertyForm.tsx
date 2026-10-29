import React, { useState } from 'react';
import { PropertyDetails, PropertyImage, ValidationResult } from '../types/property';
import { Plus, Trash2, Image as ImageIcon, AlertCircle, Sparkles, AlertTriangle } from 'lucide-react';
import { SAMPLE_PROPERTIES } from '../data/sampleProperties';

interface PropertyFormProps {
  details: PropertyDetails;
  onChange: (updated: PropertyDetails) => void;
  validation: ValidationResult;
  onGenerateScript: () => void;
  isGeneratingScript: boolean;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  details,
  onChange,
  validation,
  onGenerateScript,
  isGeneratingScript,
}) => {
  const [newFeature, setNewFeature] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageLabel, setNewImageLabel] = useState('');
  const [showAddImageModal, setShowAddImageModal] = useState(false);

  const handleFieldChange = (field: keyof PropertyDetails, value: any) => {
    onChange({ ...details, [field]: value });
  };

  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeature.trim()) return;
    const current = details.keyFeatures || [];
    handleFieldChange('keyFeatures', [...current, newFeature.trim()]);
    setNewFeature('');
  };

  const handleRemoveFeature = (index: number) => {
    const current = [...(details.keyFeatures || [])];
    current.splice(index, 1);
    handleFieldChange('keyFeatures', current);
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    const newImg: PropertyImage = {
      id: `custom-img-${Date.now()}`,
      url: newImageUrl.trim(),
      label: newImageLabel.trim() || `View ${details.images.length + 1}`,
      isCustom: true,
    };
    handleFieldChange('images', [...details.images, newImg]);
    setNewImageUrl('');
    setNewImageLabel('');
    setShowAddImageModal(false);
  };

  const handleRemoveImage = (index: number) => {
    const current = [...details.images];
    current.splice(index, 1);
    handleFieldChange('images', current);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const newImg: PropertyImage = {
            id: `upload-${Date.now()}`,
            url: uploadEvent.target.result as string,
            label: file.name.replace(/\.[^/.]+$/, ''),
            isCustom: true,
          };
          handleFieldChange('images', [...details.images, newImg]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Validation Banner */}
      {!validation.isValid && (
        <div className="bg-red-950/80 border-2 border-red-600 rounded-none p-4 text-xs text-white">
          <div className="flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-white uppercase tracking-wider block mb-1">
                Missing Required Details:
              </span>
              <ul className="list-disc pl-4 space-y-0.5 text-zinc-300">
                {validation.errors.map((err, i) => (
                  <li key={i}>{err.message}</li>
                ))}
              </ul>
              <button
                onClick={() => onChange(SAMPLE_PROPERTIES['sunset-loft'])}
                className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-none font-bold uppercase tracking-wider transition"
              >
                <span>Autofill with Sample 2-BHK</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warnings Banner */}
      {validation.warnings.length > 0 && validation.isValid && (
        <div className="bg-zinc-950 border border-red-600/50 rounded-none p-3 text-xs text-zinc-300">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <div className="flex-1">
              {validation.warnings.map((w, i) => (
                <div key={i}>{w}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1. Core Property Metadata */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-none p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h2 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-2">
            <span className="w-2 h-2 bg-red-600"></span>
            <span>01. Listing Information</span>
          </h2>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Step 1 of 4</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Property Name / Project *
            </label>
            <input
              type="text"
              value={details.propertyName}
              onChange={(e) => handleFieldChange('propertyName', e.target.value)}
              placeholder="e.g. The Lumina 2-BHK Skyline Haven"
              className="w-full bg-black border border-zinc-800 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Property Type *
            </label>
            <select
              value={details.propertyType}
              onChange={(e) => handleFieldChange('propertyType', e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 cursor-pointer"
            >
              <option value="2-BHK Designer Apartment">2-BHK Designer Apartment</option>
              <option value="3-BHK Luxury Apartment">3-BHK Luxury Apartment</option>
              <option value="4-BHK Mediterranean Villa">4-BHK Mediterranean Villa</option>
              <option value="Duplex Penthouse">Duplex Penthouse</option>
              <option value="Modern Studio Residence">Modern Studio Residence</option>
              <option value="Gated Community Estate">Gated Community Estate</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Listing Price (INR ₹) *
            </label>
            <input
              type="text"
              value={details.price}
              onChange={(e) => handleFieldChange('price', e.target.value)}
              placeholder="e.g. ₹1.85 Cr or ₹95 Lakh"
              className="w-full bg-black border border-zinc-800 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-bold"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Location & Neighborhood *
            </label>
            <input
              type="text"
              value={details.location}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              placeholder="e.g. DLF Cyber City, Sector 42, Gurugram"
              className="w-full bg-black border border-zinc-800 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Bedrooms / Layout
            </label>
            <input
              type="text"
              value={details.bedrooms || ''}
              onChange={(e) => handleFieldChange('bedrooms', e.target.value)}
              placeholder="e.g. 2 Beds"
              className="w-full bg-black border border-zinc-800 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Carpet / Super Area
            </label>
            <input
              type="text"
              value={details.areaSqft || ''}
              onChange={(e) => handleFieldChange('areaSqft', e.target.value)}
              placeholder="e.g. 1,320 sq.ft."
              className="w-full bg-black border border-zinc-800 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            />
          </div>
        </div>
      </div>

      {/* 2. Key Features */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-none p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-600"></span>
              <span>02. Key Features & Amenities</span>
            </h2>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Highlight scenes synthesized into promotional video reels.
            </p>
          </div>
          <span className="text-[10px] font-bold text-red-500 bg-red-600/10 border border-red-600/30 px-2 py-0.5 rounded-none uppercase tracking-wider">
            {details.keyFeatures.length} Added
          </span>
        </div>

        {/* Feature Tags List */}
        <div className="flex flex-wrap gap-2">
          {details.keyFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="bg-black border border-zinc-800 rounded-none px-3 py-1.5 flex items-center space-x-2 text-xs text-white"
            >
              <span className="w-1.5 h-1.5 bg-red-600"></span>
              <span>{feat}</span>
              <button
                type="button"
                onClick={() => handleRemoveFeature(idx)}
                className="text-zinc-500 hover:text-red-500 ml-1 transition"
                aria-label={`Remove feature ${feat}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Feature Input */}
        <form onSubmit={handleAddFeature} className="flex gap-2">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="Add highlight (e.g. Private Pool, Italian Marble, Sunset Balcony)..."
            className="flex-1 bg-black border border-zinc-800 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-none transition flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* 3. Photos & Images */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-none p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-600"></span>
              <span>03. Property Photos ({details.images.length})</span>
            </h2>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              4 to 8 images recommended. Each photo maps directly to a Ken Burns scene.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <label className="cursor-pointer px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 rounded-none text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition">
              <Plus className="w-3.5 h-3.5 text-red-500" />
              <span>Upload</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              type="button"
              onClick={() => setShowAddImageModal(!showAddImageModal)}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 rounded-none text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition"
            >
              <ImageIcon className="w-3.5 h-3.5 text-red-500" />
              <span>URL</span>
            </button>
          </div>
        </div>

        {/* Add URL Drawer */}
        {showAddImageModal && (
          <form onSubmit={handleAddImage} className="bg-black border border-zinc-800 rounded-none p-3 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="bg-zinc-950 border border-zinc-800 rounded-none px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-600"
                required
              />
              <input
                type="text"
                value={newImageLabel}
                onChange={(e) => setNewImageLabel(e.target.value)}
                placeholder="Label (e.g. Master Bedroom, Rooftop Deck)"
                className="bg-zinc-950 border border-zinc-800 rounded-none px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddImageModal(false)}
                className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white rounded-none"
              >
                Add Image
              </button>
            </div>
          </form>
        )}

        {/* Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {details.images.map((img, idx) => (
            <div
              key={img.id || idx}
              className="relative group bg-black rounded-none overflow-hidden border border-zinc-800 aspect-video flex flex-col justify-end"
            >
              <img
                src={img.url}
                alt={img.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
              
              <div className="relative p-2 flex items-center justify-between text-white z-10">
                <div className="truncate pr-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-red-500 block">
                    Scene #{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-white truncate block">{img.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="opacity-0 group-hover:opacity-100 p-1 bg-red-600 hover:bg-red-700 text-white rounded-none transition"
                  aria-label={`Remove image ${img.label}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Contact & Call to Action */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-none p-5 space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-2">
          <span className="w-2 h-2 bg-red-600"></span>
          <span>04. Contact & Closing CTA</span>
        </h2>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
            Call to Action / Broker Contact Info (Davinder Singh)
          </label>
          <textarea
            rows={2}
            value={details.contactText}
            onChange={(e) => handleFieldChange('contactText', e.target.value)}
            placeholder="e.g. Schedule a Private Tour with Davinder Singh: +91 98110 24890 | davinder@singhrealty.com"
            className="w-full bg-black border border-zinc-800 rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
        </div>
      </div>

      {/* AI Script Generation CTA */}
      <div className="bg-zinc-950 border border-red-600/60 rounded-none p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span>AI Script & Voiceover Generation</span>
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1 max-w-md">
            Gemini Flash writes a concise, high-converting voiceover and scene subtitles strictly using provided listing details.
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerateScript}
          disabled={isGeneratingScript || !validation.isValid}
          className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-none shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 transition shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGeneratingScript ? 'Writing AI Script...' : 'Generate AI Storyboard'}</span>
        </button>
      </div>
    </div>
  );
};
