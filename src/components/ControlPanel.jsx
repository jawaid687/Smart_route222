import React from 'react';
import { 
  RotateCcw, 
  Trash2, 
  Dice5, 
  Play, 
  Square, 
  Flame, 
  Crosshair, 
  MapPin, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { translations } from '../utils/translations';
import { playClick } from '../utils/audio';

export default function ControlPanel({
  nodes = [],
  startNodeId,
  onSelectStartNode,
  interactiveMode,
  onChangeMode,
  onResetInitialState,
  onClearAllHazards,
  onSimulateRandomHazard,
  isSimulating,
  onStartSimulation,
  onStopSimulation,
  routeAvailable,
  blockedNodes,
  lang,
}) {
  const t = translations[lang] || translations.en;

  // Filter valid starting nodes (rooms and junctions)
  const candidateStartNodes = nodes.filter(n => n.type === 'room' || n.type === 'junction');

  return (
    <div className="w-full bg-cyber-850/80 border border-cyber-700/80 rounded-2xl p-4 lg:p-5 shadow-xl backdrop-blur-md">
      
      {/* Top Grid: Start Node Selector & Mode Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pb-4 border-b border-cyber-700/60">
        
        {/* Start Node Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-neon-blue" />
            <span>{t.startLocation}</span>
          </label>
          <div className="relative">
            <select
              value={startNodeId || ''}
              onChange={(e) => {
                playClick();
                onSelectStartNode(e.target.value);
              }}
              className="w-full bg-cyber-800 border border-cyber-600/90 text-white rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all cursor-pointer"
            >
              {candidateStartNodes.map((n) => {
                const isBlocked = blockedNodes.has(n.id);
                return (
                  <option key={n.id} value={n.id} className="bg-cyber-850 py-1 text-slate-100">
                    {isBlocked ? '🔥 [BLOCKED] ' : '📍 '}
                    {n.label} ({n.id}) — {n.type}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Interactive Mode Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.modeSelect}</span>
          </label>
          <div className="grid grid-cols-2 p-1 bg-cyber-900/90 border border-cyber-700 rounded-xl">
            <button
              onClick={() => {
                playClick();
                onChangeMode('toggle_hazard');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                interactiveMode === 'toggle_hazard'
                  ? 'bg-danger/20 text-danger-glow border border-danger/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{t.modeToggleHazard}</span>
            </button>

            <button
              onClick={() => {
                playClick();
                onChangeMode('set_start');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                interactiveMode === 'set_start'
                  ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>{t.modeSetStart}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Action Buttons Row */}
      <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
        
        {/* Reset & Hazard Manipulations */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Reset to Initial State Button */}
          <button
            onClick={() => {
              playClick();
              onResetInitialState();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyber-800 hover:bg-cyber-750 text-slate-200 hover:text-white border border-cyber-600/80 text-xs font-medium transition-all shadow-sm active:scale-95"
            title={t.resetInitial}
          >
            <RotateCcw className="w-3.5 h-3.5 text-neon-blue" />
            <span>{t.resetInitial}</span>
          </button>

          {/* Clear All Hazards */}
          <button
            onClick={() => {
              playClick();
              onClearAllHazards();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyber-800 hover:bg-cyber-750 text-slate-300 hover:text-white border border-cyber-700 text-xs font-medium transition-all shadow-sm active:scale-95"
            title={t.clearHazards}
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.clearHazards}</span>
          </button>

          {/* Random Hazard Simulation Drill */}
          <button
            onClick={() => {
              playClick();
              onSimulateRandomHazard();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyber-800 hover:bg-cyber-750 text-amber-300 hover:text-amber-200 border border-warning/40 text-xs font-medium transition-all shadow-sm active:scale-95"
            title={t.simulateHazard}
          >
            <Dice5 className="w-3.5 h-3.5 text-warning" />
            <span>{t.simulateHazard}</span>
          </button>

        </div>

        {/* Walkthrough Simulation Controls */}
        <div>
          {isSimulating ? (
            <button
              onClick={() => {
                playClick();
                onStopSimulation();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-danger hover:bg-red-600 text-white text-xs font-bold transition-all shadow-lg shadow-red-950/40 active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t.stopWalkthrough}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                playClick();
                onStartSimulation();
              }}
              disabled={!routeAvailable}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 ${
                routeAvailable
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-950/40 hover:shadow-emerald-900/60'
                  : 'bg-cyber-800 text-slate-500 border border-cyber-700/60 cursor-not-allowed opacity-60'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t.walkthrough}</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
