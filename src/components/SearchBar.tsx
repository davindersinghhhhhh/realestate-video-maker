import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Building2, Film, Image as ImageIcon, Sparkles, Check, ArrowRight } from 'lucide-react';
import { PropertyDetails, PropertyImage, Scene } from '../types/property';
import { searchContent, SearchResultItem } from '../utils/searchLogic';

interface SearchBarProps {
  currentProperty: PropertyDetails;
  currentScenes: Scene[];
  onSelectProperty: (prop: PropertyDetails) => void;
  onSelectScene: (sceneIndex: number) => void;
  onAddMediaImage: (image: PropertyImage) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  currentProperty,
  currentScenes,
  onSelectProperty,
  onSelectScene,
  onAddMediaImage,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [addedMediaId, setAddedMediaId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const results = searchContent(query, currentProperty, currentScenes);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectResult = (item: SearchResultItem) => {
    if (item.type === 'property') {
      onSelectProperty(item.data);
      setIsOpen(false);
      setQuery('');
    } else if (item.type === 'scene') {
      onSelectScene(item.data.sceneIndex);
      setIsOpen(false);
    } else if (item.type === 'media') {
      onAddMediaImage(item.data);
      setAddedMediaId(item.data.id);
      setTimeout(() => setAddedMediaId(null), 2000);
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md mx-2 sm:mx-4">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search listings, Goa/Gurgaon, pool, scenes, photos..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-none pl-9 pr-14 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
        />

        <div className="absolute right-2.5 flex items-center space-x-1">
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="p-1 text-zinc-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block font-mono text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded-none">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Dropdown Results Card */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-black border border-zinc-800 rounded-none shadow-2xl overflow-hidden z-50 max-h-[420px] flex flex-col">
          <div className="px-3 py-2 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 uppercase tracking-wider font-bold">
            <span>Search Results ({results.length})</span>
            <span className="text-[10px] text-zinc-500">ESC to dismiss</span>
          </div>

          <div className="overflow-y-auto divide-y divide-zinc-900">
            {results.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                No matching properties or media found for &ldquo;{query}&rdquo;.
              </div>
            ) : (
              results.map((item) => {
                const isProp = item.type === 'property';
                const isScene = item.type === 'scene';
                const isMedia = item.type === 'media';
                const isAdded = addedMediaId === item.data?.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectResult(item)}
                    className="w-full text-left p-3 hover:bg-zinc-900 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-none bg-zinc-950 flex items-center justify-center shrink-0 border border-zinc-800 text-red-500 group-hover:border-red-600">
                        {isProp && <Building2 className="w-4 h-4" />}
                        {isScene && <Film className="w-4 h-4" />}
                        {isMedia && <ImageIcon className="w-4 h-4" />}
                        {item.type === 'feature' && <Sparkles className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-white truncate group-hover:text-red-400">
                            {item.title}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-none bg-zinc-900 text-zinc-300 border border-zinc-800 shrink-0">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-zinc-400 group-hover:text-red-500">
                      {isMedia ? (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-none transition flex items-center space-x-1 ${
                          isAdded ? 'bg-white text-black' : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}>
                          {isAdded ? <Check className="w-3 h-3" /> : <span>+ Add</span>}
                        </span>
                      ) : (
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition text-red-500" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
