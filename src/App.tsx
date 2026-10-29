import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { PropertyForm } from './components/PropertyForm';
import { ScriptEditor } from './components/ScriptEditor';
import { VideoStudio } from './components/VideoStudio';
import { SubmissionDocsModal } from './components/SubmissionDocsModal';
import { SAMPLE_PROPERTIES } from './data/sampleProperties';
import { PropertyDetails, VideoProject } from './types/property';
import {
  generateFallbackScript,
  validateProperty,
} from './utils/propertyLogic';
import { FileText, Sparkles, CheckSquare } from 'lucide-react';

export default function App() {
  // Default to the 2-BHK listing
  const [details, setDetails] = useState<PropertyDetails>(SAMPLE_PROPERTIES['sunset-loft']);
  const [activeTab, setActiveTab] = useState<'details' | 'storyboard'>('details');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [scriptSource, setScriptSource] = useState<string>('gemini-3.8-flash');
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Compute validation
  const validation = useMemo(() => validateProperty(details), [details]);

  // Initial fallback storyboard
  const initialStoryboard = useMemo(() => generateFallbackScript(details), [details.propertyName]);

  // Video Project State with Red accent
  const [project, setProject] = useState<VideoProject>({
    details,
    aspectRatio: '16:9',
    targetDurationSec: 25,
    musicTheme: 'luxury_ambient',
    musicVolume: 0.35,
    voiceVolume: 0.95,
    enableVoiceover: true,
    enableMusic: true,
    scenes: initialStoryboard.scenes,
    fullScript: initialStoryboard.fullVoiceover,
    accentColor: '#dc2626', // Bold red accent
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Switch sample property
  const handleSelectSample = (sample: PropertyDetails) => {
    setDetails(sample);
    const storyboard = generateFallbackScript(sample);
    setProject((prev) => ({
      ...prev,
      details: sample,
      scenes: storyboard.scenes,
      fullScript: storyboard.fullVoiceover,
    }));
    showNotification(`Loaded listing: "${sample.propertyName}"`);
  };

  // Update property details
  const handleDetailsChange = (updated: PropertyDetails) => {
    setDetails(updated);
    setProject((prev) => ({
      ...prev,
      details: updated,
    }));
  };

  // Update scenes
  const handleScenesChange = (scenes: any[]) => {
    setProject((prev) => ({
      ...prev,
      scenes,
    }));
  };

  const handleUpdateProject = (updated: Partial<VideoProject>) => {
    setProject((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  // Generate Script via Gemini Backend Route
  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setScriptSource(data.source || 'gemini-3.8-flash');

      if (data.scenes && Array.isArray(data.scenes)) {
        setProject((prev) => ({
          ...prev,
          scenes: data.scenes,
          fullScript: data.fullVoiceover || prev.fullScript,
        }));
        setActiveTab('storyboard');
        showNotification('AI Storyboard generated successfully!');
      }
    } catch (err) {
      console.warn('Backend call failed, using deterministic fallback:', err);
      const fallback = generateFallbackScript(details);
      setScriptSource('deterministic-template');
      setProject((prev) => ({
        ...prev,
        scenes: fallback.scenes,
        fullScript: fallback.fullVoiceover,
      }));
      setActiveTab('storyboard');
      showNotification('Generated storyboard with validated listing facts.');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Global Navigation Header */}
      <Header
        currentProperty={details}
        currentScenes={project.scenes}
        onSelectSample={handleSelectSample}
        onSelectScene={(idx) => {
          setActiveTab('storyboard');
          showNotification(`Navigated to Scene #${idx + 1}`);
        }}
        onAddMediaImage={(img) => {
          const nextImages = [...details.images, img];
          handleDetailsChange({ ...details, images: nextImages });
          showNotification(`Added "${img.label}" to video photos!`);
        }}
        onOpenDocs={() => setIsDocsOpen(true)}
      />

      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-600 text-white border border-red-500/40 px-5 py-3 rounded-none font-bold text-xs uppercase tracking-wider shadow-2xl flex items-center space-x-2.5">
          <CheckSquare className="w-4 h-4 text-white" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form & AI Script Editor (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* View Switcher Tabs */}
            <div className="bg-zinc-950 border border-zinc-800 p-1 rounded-none flex items-center justify-between gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-2.5 px-3 rounded-none text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition ${
                  activeTab === 'details'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Listing Details</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('storyboard')}
                className={`flex-1 py-2.5 px-3 rounded-none text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition ${
                  activeTab === 'storyboard'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Storyboard ({project.scenes.length})</span>
              </button>
            </div>

            {/* Content per Tab */}
            {activeTab === 'details' ? (
              <PropertyForm
                details={details}
                onChange={handleDetailsChange}
                validation={validation}
                onGenerateScript={handleGenerateScript}
                isGeneratingScript={isGeneratingScript}
              />
            ) : (
              <ScriptEditor
                project={project}
                onChangeScenes={handleScenesChange}
                onUpdateFullScript={(fullScript) =>
                  setProject((p) => ({ ...p, fullScript }))
                }
                scriptSource={scriptSource}
              />
            )}
          </div>

          {/* Right Column: Interactive Video Studio & Canvas (7 cols) */}
          <div className="lg:col-span-7 sticky top-20">
            <VideoStudio
              project={project}
              onUpdateProject={handleUpdateProject}
            />
          </div>
        </div>
      </main>

      {/* Candidate README & Evaluation Docs Modal */}
      <SubmissionDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}
