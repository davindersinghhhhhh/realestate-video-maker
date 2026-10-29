import React from 'react';
import { Scene, VideoProject } from '../types/property';
import { Volume2, ShieldCheck } from 'lucide-react';
import { audioSynthesizer } from '../utils/audioSynthesizer';

interface ScriptEditorProps {
  project: VideoProject;
  onChangeScenes: (scenes: Scene[]) => void;
  onUpdateFullScript: (script: string) => void;
  scriptSource?: string;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  project,
  onChangeScenes,
  onUpdateFullScript,
  scriptSource,
}) => {
  const handleSceneChange = (index: number, updated: Partial<Scene>) => {
    const next = [...project.scenes];
    next[index] = { ...next[index], ...updated };
    onChangeScenes(next);

    const reassembled = next.map((s) => s.voiceoverScript).join(' ');
    onUpdateFullScript(reassembled);
  };

  const handlePreviewVoice = (text: string) => {
    audioSynthesizer.speakNarration(text);
  };

  return (
    <div className="space-y-4">
      {/* Script Source & Grounding Assurance */}
      <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-none p-3 text-xs">
        <div className="flex items-center space-x-2 text-zinc-300">
          <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
          <span>
            Fact Grounding:{' '}
            <strong className="text-white">
              {scriptSource === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Validated Property Logic'}
            </strong>
          </span>
        </div>
        <span className="text-[10px] text-white bg-red-600 px-2 py-0.5 rounded-none font-bold uppercase tracking-widest">
          Zero Hallucination
        </span>
      </div>

      {/* Scene by Scene Timeline Editor */}
      <div className="space-y-3">
        {project.scenes.map((scene, idx) => {
          const targetImg = project.details.images[scene.imageIndex] || project.details.images[0];
          const isIntro = scene.type === 'intro';
          const isOutro = scene.type === 'outro';

          return (
            <div
              key={scene.id || idx}
              className="bg-zinc-950 border border-zinc-800 rounded-none p-4 transition-all hover:border-red-600 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-6 h-6 rounded-none bg-red-600 text-white text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      {isIntro ? 'Opening Scene' : isOutro ? 'Closing CTA' : `Feature Scene #${idx}`}
                    </span>
                    <span className="text-[11px] text-zinc-400 ml-2">
                      ({scene.durationSec}s duration)
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handlePreviewVoice(scene.voiceoverScript)}
                    className="p-1.5 bg-zinc-900 hover:bg-red-600 text-white rounded-none border border-zinc-800 transition"
                    title="Listen to this scene's voiceover"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Thumbnail & Quick Form */}
              <div className="flex gap-3">
                {targetImg && (
                  <div className="w-24 h-16 rounded-none overflow-hidden relative shrink-0 bg-black border border-zinc-800">
                    <img
                      src={targetImg.url}
                      alt={scene.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/80 text-[8px] font-bold uppercase tracking-wider text-white px-1 rounded-none border border-white/20">
                      {targetImg.label}
                    </span>
                  </div>
                )}

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Overlay Title
                    </label>
                    <input
                      type="text"
                      value={scene.title}
                      onChange={(e) => handleSceneChange(idx, { title: e.target.value })}
                      className="w-full bg-black border border-zinc-800 rounded-none px-2.5 py-1 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Badge / Tag
                    </label>
                    <input
                      type="text"
                      value={scene.badgeText || ''}
                      onChange={(e) => handleSceneChange(idx, { badgeText: e.target.value })}
                      className="w-full bg-black border border-zinc-800 rounded-none px-2.5 py-1 text-xs text-red-400 font-bold focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>
              </div>

              {/* Voiceover Script Box */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Voiceover Narration & Subtitle
                </label>
                <textarea
                  rows={2}
                  value={scene.voiceoverScript}
                  onChange={(e) =>
                    handleSceneChange(idx, {
                      voiceoverScript: e.target.value,
                      caption: e.target.value,
                    })
                  }
                  className="w-full bg-black border border-zinc-800 rounded-none p-2 text-xs text-zinc-200 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
