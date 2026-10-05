import React from 'react';
import { 
  Flame, 
  Upload, 
  Volume2, 
  VolumeX, 
  Globe, 
  FileCode2, 
  Layers, 
  Sparkles 
} from 'lucide-react';
import { translations } from '../utils/translations';
import { PRESET_MAPS } from '../utils/presets';

export default function Navbar({
  lang,
  onToggleLang,
  soundMuted,
  onToggleSound,
  currentPresetId,
  onSelectPreset,
  onOpenUploadModal,
  onOpenJsonViewer,
  mapName,
}) {
  const t = translations[lang] || translations.en;

  return (
    <header className="sticky top-0 z-40 w-full bg-cyber-900/90 backdrop-blur-md border-b border-cyber-700/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyber-800 border border-emerald-500/40 shadow-lg shadow-emerald-950/50">
            <span className="text-xl">🏃</span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>{t.appTitle}</span>
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                v2.0 SPA
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 font-sans">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Center / Floor Plan Presets */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-800/80 border border-cyber-700 text-xs text-slate-300">
            <Layers className="w-3.5 h-3.5 text-neon-blue" />
            <span className="text-slate-400">{t.presetMaps}:</span>
            <select
              value={currentPresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-transparent text-emerald-400 font-medium focus:outline-none cursor-pointer pr-2"
            >
              {PRESET_MAPS.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-cyber-850 text-white">
                  {preset.name[lang] || preset.name.en}
                </option>
              ))}
              {currentPresetId === 'custom' && (
                <option value="custom" className="bg-cyber-850 text-amber-400">
                  {lang === 'bn' ? 'কাস্টম ফ্লোর প্ল্যান' : 'Custom Uploaded Map'}
                </option>
              )}
            </select>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Preset Selector for mobile/tablet */}
          <div className="lg:hidden">
            <select
              value={currentPresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-cyber-800 text-emerald-400 text-xs py-1.5 px-2 rounded-lg border border-cyber-700 focus:outline-none"
            >
              {PRESET_MAPS.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-cyber-850 text-white">
                  {preset.name[lang] || preset.name.en}
                </option>
              ))}
              {currentPresetId === 'custom' && (
                <option value="custom" className="bg-cyber-850 text-amber-400">
                  Custom
                </option>
              )}
            </select>
          </div>

          {/* Upload JSON Button */}
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-800 hover:bg-cyber-750 border border-cyber-600/80 text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm hover:border-emerald-500/50"
            title={t.uploadJson}
          >
            <Upload className="w-3.5 h-3.5 text-neon-blue" />
            <span className="hidden sm:inline">{t.uploadJson}</span>
          </button>

          {/* View / Edit Raw JSON Button */}
          <button
            onClick={onOpenJsonViewer}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyber-800 hover:bg-cyber-750 border border-cyber-700 text-xs text-slate-300 hover:text-white transition-all"
            title={t.pasteJson}
          >
            <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">{t.pasteJson}</span>
          </button>

          {/* Sound Mute/Unmute */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition-all ${
              soundMuted
                ? 'bg-cyber-800/80 border-cyber-700 text-slate-400 hover:text-white'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            }`}
            title={soundMuted ? t.soundOff : t.soundOn}
            aria-label="Toggle Sound"
          >
            {soundMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          {/* Bilingual Language Switcher */}
          <div className="flex items-center rounded-lg bg-cyber-800/90 p-0.5 border border-cyber-700">
            <button
              onClick={() => onToggleLang('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                lang === 'en'
                  ? 'bg-emerald-500 text-cyber-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onToggleLang('bn')}
              className={`px-2.5 py-1 text-xs font-bangla font-bold rounded-md transition-all ${
                lang === 'bn'
                  ? 'bg-emerald-500 text-cyber-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              বাংলা
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
