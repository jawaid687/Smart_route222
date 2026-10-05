import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  MapPin, 
  Flame, 
  Sparkles, 
  Activity, 
  Layers, 
  Info,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

import Navbar from './components/Navbar';
import AlertBanner from './components/AlertBanner';
import MapCanvas from './components/MapCanvas';
import ControlPanel from './components/ControlPanel';
import RouteDetails from './components/RouteDetails';
import HazardManager from './components/HazardManager';
import JsonUploadModal from './components/JsonUploadModal';

import { PRESET_MAPS } from './utils/presets';
import { calculateEscapeRoute } from './utils/dijkstra';
import { translations } from './utils/translations';
import { 
  setSoundMuted, 
  isSoundMuted, 
  playRouteFound, 
  playHazardToggle, 
  playAlertWarning, 
  playStepSound, 
  playSuccessChime 
} from './utils/audio';

export default function App() {
  // 1. Core State
  const [lang, setLang] = useState('en'); // 'en' | 'bn'
  const [soundMuted, setSoundMutedState] = useState(false);
  const [currentPresetId, setCurrentPresetId] = useState('corporate_hq');
  const [interactiveMode, setInteractiveMode] = useState('toggle_hazard'); // 'toggle_hazard' | 'set_start'

  // Current loaded map data
  const [mapData, setMapData] = useState(() => PRESET_MAPS[0].data);
  const [startNodeId, setStartNodeId] = useState(() => PRESET_MAPS[0].defaultStart);

  // Dynamic Hazard Sets
  const [blockedNodes, setBlockedNodes] = useState(() => new Set(PRESET_MAPS[0].data.initial_state.blocked_nodes || []));
  const [blockedEdges, setBlockedEdges] = useState(() => new Set(PRESET_MAPS[0].data.initial_state.blocked_edges || []));
  const [closedExits, setClosedExits] = useState(() => new Set(PRESET_MAPS[0].data.initial_state.closed_exits || []));

  // Modals & UI Banners
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [customNotice, setCustomNotice] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  // Walkthrough simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(-1);
  const simulationTimerRef = useRef(null);

  const t = translations[lang] || translations.en;

  // Sound Mute Toggle
  const handleToggleSound = useCallback(() => {
    setSoundMutedState(prev => {
      const next = !prev;
      setSoundMuted(next);
      return next;
    });
  }, []);

  // Language Toggle
  const handleToggleLang = useCallback((newLang) => {
    setLang(newLang);
    document.documentElement.lang = newLang;
  }, []);

  // Preset Floor Plan Selection
  const handleSelectPreset = useCallback((presetId) => {
    const preset = PRESET_MAPS.find(p => p.id === presetId);
    if (!preset) return;

    setCurrentPresetId(presetId);
    setMapData(preset.data);
    setStartNodeId(preset.defaultStart);

    // Load initial_state
    const initial = preset.data.initial_state || {};
    setBlockedNodes(new Set(initial.blocked_nodes || []));
    setBlockedEdges(new Set(initial.blocked_edges || []));
    setClosedExits(new Set(initial.closed_exits || []));

    setValidationErrors([]);
    setCustomNotice(null);
    setIsSimulating(false);
    setWalkthroughStep(-1);
  }, []);

  // Custom Map Loaded via Upload/Paste
  const handleLoadCustomMap = useCallback((loadedData) => {
    setCurrentPresetId('custom');
    setMapData(loadedData);

    // Pick first room or junction as default start
    const firstStart = loadedData.nodes.find(n => n.type === 'room' || n.type === 'junction');
    setStartNodeId(firstStart ? firstStart.id : (loadedData.nodes[0]?.id || ''));

    // Apply initial_state
    const initial = loadedData.initial_state || {};
    setBlockedNodes(new Set(initial.blocked_nodes || []));
    setBlockedEdges(new Set(initial.blocked_edges || []));
    setClosedExits(new Set(initial.closed_exits || []));

    setValidationErrors([]);
    setCustomNotice(t.jsonValidationSuccess);
    setTimeout(() => setCustomNotice(null), 4000);
    setIsSimulating(false);
    setWalkthroughStep(-1);
  }, [t.jsonValidationSuccess]);

  // Dijkstra Shortest Path Computation (Reactive, instant recalculation)
  const routeResult = useMemo(() => {
    if (!mapData || !mapData.nodes || !mapData.edges) return null;

    return calculateEscapeRoute({
      nodes: mapData.nodes,
      edges: mapData.edges,
      startNodeId,
      blockedNodes,
      blockedEdges,
      closedExits,
    });
  }, [mapData, startNodeId, blockedNodes, blockedEdges, closedExits]);

  // Audio & Notice Triggers on route status change
  const prevStatusRef = useRef(routeResult?.status);
  useEffect(() => {
    if (!routeResult) return;
    const prev = prevStatusRef.current;
    prevStatusRef.current = routeResult.status;

    if (routeResult.status === 'ROUTE_FOUND' && prev !== 'ROUTE_FOUND') {
      playRouteFound();
    } else if (routeResult.status === 'START_BLOCKED' || routeResult.status === 'NO_ROUTE') {
      if (prev !== routeResult.status) {
        playAlertWarning();
      }
    }
  }, [routeResult]);

  // Reset to initial_state handler
  const handleResetInitialState = useCallback(() => {
    const initial = mapData.initial_state || {};
    setBlockedNodes(new Set(initial.blocked_nodes || []));
    setBlockedEdges(new Set(initial.blocked_edges || []));
    setClosedExits(new Set(initial.closed_exits || []));

    setCustomNotice(t.statusInitialReset);
    setTimeout(() => setCustomNotice(null), 3500);
    setIsSimulating(false);
    setWalkthroughStep(-1);
  }, [mapData, t.statusInitialReset]);

  // Clear all hazards handler
  const handleClearAllHazards = useCallback(() => {
    setBlockedNodes(new Set());
    setBlockedEdges(new Set());
    setClosedExits(new Set());

    setCustomNotice(t.statusHazardsCleared);
    setTimeout(() => setCustomNotice(null), 3500);
    setIsSimulating(false);
    setWalkthroughStep(-1);
  }, [t.statusHazardsCleared]);

  // Simulate Random Hazard Drill
  const handleSimulateRandomHazard = useCallback(() => {
    const unblockedEdges = mapData.edges.filter(e => !blockedEdges.has(e.id));
    const unblockedRooms = mapData.nodes.filter(n => n.type === 'room' && !blockedNodes.has(n.id) && n.id !== startNodeId);

    if (unblockedEdges.length > 0 && Math.random() > 0.4) {
      const randomEdge = unblockedEdges[Math.floor(Math.random() * unblockedEdges.length)];
      setBlockedEdges(prev => new Set([...prev, randomEdge.id]));
      playHazardToggle(true);
    } else if (unblockedRooms.length > 0) {
      const randomNode = unblockedRooms[Math.floor(Math.random() * unblockedRooms.length)];
      setBlockedNodes(prev => new Set([...prev, randomNode.id]));
      playHazardToggle(true);
    }

    setCustomNotice(t.statusRandomHazard);
    setTimeout(() => setCustomNotice(null), 3500);
  }, [mapData, blockedEdges, blockedNodes, startNodeId, t.statusRandomHazard]);

  // Dynamic Hazard Toggles: Node
  const handleToggleNodeBlocked = useCallback((nodeId) => {
    setBlockedNodes(prev => {
      const next = new Set(prev);
      const isBlocked = next.has(nodeId);
      if (isBlocked) {
        next.delete(nodeId);
        playHazardToggle(false);
      } else {
        next.add(nodeId);
        playHazardToggle(true);
      }
      return next;
    });
  }, []);

  // Dynamic Hazard Toggles: Edge
  const handleToggleEdgeBlocked = useCallback((edgeId) => {
    setBlockedEdges(prev => {
      const next = new Set(prev);
      const isBlocked = next.has(edgeId);
      if (isBlocked) {
        next.delete(edgeId);
        playHazardToggle(false);
      } else {
        next.add(edgeId);
        playHazardToggle(true);
      }
      return next;
    });
  }, []);

  // Dynamic Hazard Toggles: Exit Closed
  const handleToggleExitClosed = useCallback((exitId) => {
    setClosedExits(prev => {
      const next = new Set(prev);
      const isClosed = next.has(exitId);
      if (isClosed) {
        next.delete(exitId);
        playHazardToggle(false);
      } else {
        next.add(exitId);
        playHazardToggle(true);
      }
      return next;
    });
  }, []);

  // Start Location Selector
  const handleSelectStartNode = useCallback((nodeId) => {
    setStartNodeId(nodeId);
    setIsSimulating(false);
    setWalkthroughStep(-1);
  }, []);

  // Evacuation Walkthrough Simulation
  const handleStartSimulation = useCallback(() => {
    if (!routeResult || routeResult.status !== 'ROUTE_FOUND' || !routeResult.path || routeResult.path.length === 0) {
      return;
    }

    setIsSimulating(true);
    setWalkthroughStep(0);
    playStepSound();

    let step = 0;
    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);

    simulationTimerRef.current = setInterval(() => {
      step += 1;
      if (step < routeResult.path.length) {
        setWalkthroughStep(step);
        playStepSound();
      } else {
        clearInterval(simulationTimerRef.current);
        setIsSimulating(false);
        playSuccessChime();
        // Trigger celebratory confetti burst!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}
        setCustomNotice(t.evacuationComplete);
        setTimeout(() => setCustomNotice(null), 4000);
      }
    }, 700);
  }, [routeResult, t.evacuationComplete]);

  const handleStopSimulation = useCallback(() => {
    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    setIsSimulating(false);
    setWalkthroughStep(-1);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-cyber-900 text-slate-100 flex flex-col antialiased">
      
      {/* 1. Header Navigation */}
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenJsonViewer={() => setIsUploadModalOpen(true)}
        mapName={mapData.name}
      />

      {/* 2. Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Status Alerts & Error Banners */}
        <AlertBanner
          routeResult={routeResult}
          validationErrors={validationErrors}
          lang={lang}
          onDismissValidation={() => setValidationErrors([])}
          customNotice={customNotice}
        />

        {/* Central Grid: Map Viewport & Sidebar Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (8 cols): 2D Interactive Graph Canvas & Controls */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Interactive SVG Canvas */}
            <MapCanvas
              nodes={mapData.nodes}
              edges={mapData.edges}
              startNodeId={startNodeId}
              onSelectStartNode={handleSelectStartNode}
              blockedNodes={blockedNodes}
              blockedEdges={blockedEdges}
              closedExits={closedExits}
              onToggleNodeBlocked={handleToggleNodeBlocked}
              onToggleEdgeBlocked={handleToggleEdgeBlocked}
              onToggleExitClosed={handleToggleExitClosed}
              routeResult={routeResult}
              interactiveMode={interactiveMode}
              lang={lang}
              walkthroughStep={walkthroughStep}
              isSimulating={isSimulating}
            />

            {/* Controls Bar: Start node, Hazard mode, Resets, Walkthrough */}
            <ControlPanel
              nodes={mapData.nodes}
              startNodeId={startNodeId}
              onSelectStartNode={handleSelectStartNode}
              interactiveMode={interactiveMode}
              onChangeMode={setInteractiveMode}
              onResetInitialState={handleResetInitialState}
              onClearAllHazards={handleClearAllHazards}
              onSimulateRandomHazard={handleSimulateRandomHazard}
              isSimulating={isSimulating}
              onStartSimulation={handleStartSimulation}
              onStopSimulation={handleStopSimulation}
              routeAvailable={routeResult?.status === 'ROUTE_FOUND'}
              blockedNodes={blockedNodes}
              lang={lang}
            />

          </div>

          {/* Right Column (4 cols): Route Details & Active Hazard Manager */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Route Summary & Turn-by-Turn Corridor Directions */}
            <RouteDetails
              routeResult={routeResult}
              nodes={mapData.nodes}
              edges={mapData.edges}
              lang={lang}
            />

            {/* Active Hazards & Fast Clearance Manager */}
            <HazardManager
              nodes={mapData.nodes}
              edges={mapData.edges}
              blockedNodes={blockedNodes}
              blockedEdges={blockedEdges}
              closedExits={closedExits}
              onUnblockNode={handleToggleNodeBlocked}
              onUnblockEdge={handleToggleEdgeBlocked}
              onReopenExit={handleToggleExitClosed}
              lang={lang}
            />

          </div>

        </div>

      </main>

      {/* 3. Footer */}
      <footer className="w-full border-t border-cyber-800 bg-cyber-900/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">Smart Escape</span>
            <span>•</span>
            <span>{t.appSubtitle}</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Dijkstra Shortest Path • Lexicographical Tie-breaking • Pure Frontend SPA
          </div>
        </div>
      </footer>

      {/* 4. JSON Upload & Editor Modal */}
      <JsonUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onLoadMapData={handleLoadCustomMap}
        currentMapData={mapData}
        lang={lang}
      />

    </div>
  );
}
