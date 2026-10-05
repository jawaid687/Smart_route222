import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Flame, 
  Lock, 
  Unlock, 
  Footprints, 
  Crosshair, 
  Sparkles,
  AlertOctagon,
  LogOut,
  Info
} from 'lucide-react';
import { translations } from '../utils/translations';
import { playClick, playHazardToggle } from '../utils/audio';

export default function MapCanvas({
  nodes = [],
  edges = [],
  startNodeId,
  onSelectStartNode,
  blockedNodes = new Set(),
  blockedEdges = new Set(),
  closedExits = new Set(),
  onToggleNodeBlocked,
  onToggleEdgeBlocked,
  onToggleExitClosed,
  routeResult,
  interactiveMode, // 'toggle_hazard' | 'set_start'
  lang,
  walkthroughStep = -1, // Step index during active simulation
  isSimulating = false
}) {
  const t = translations[lang] || translations.en;
  const svgRef = useRef(null);

  // Pan & Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredItem, setHoveredItem] = useState(null); // { type: 'node'|'edge', data: Object, x, y }

  // Map node lookup
  const nodeMap = useMemo(() => {
    const map = new Map();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Compute bounding box with margin
  const bounds = useMemo(() => {
    if (nodes.length === 0) return { minX: 0, maxX: 800, minY: 0, maxY: 600, width: 800, height: 600 };
    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const pad = 90;
    const width = Math.max(700, (maxX - minX) + pad * 2);
    const height = Math.max(500, (maxY - minY) + pad * 2);
    return {
      minX: minX - pad,
      minY: minY - pad,
      width,
      height
    };
  }, [nodes]);

  // Active Route Sets for O(1) checks
  const routeNodeSet = useMemo(() => {
    if (!routeResult || routeResult.status !== 'ROUTE_FOUND' || !routeResult.path) return new Set();
    return new Set(routeResult.path);
  }, [routeResult]);

  const routeEdgeSet = useMemo(() => {
    if (!routeResult || routeResult.status !== 'ROUTE_FOUND' || !routeResult.edgePath) return new Set();
    return new Set(routeResult.edgePath);
  }, [routeResult]);

  // Node order map for sequence numbering (#1, #2, #3...)
  const nodeSequenceIndex = useMemo(() => {
    const map = new Map();
    if (routeResult && routeResult.status === 'ROUTE_FOUND' && routeResult.path) {
      routeResult.path.forEach((nodeId, idx) => {
        map.set(nodeId, idx + 1);
      });
    }
    return map;
  }, [routeResult]);

  // Pan controls
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    // Only drag if clicking canvas background, not interactive elements
    if (e.target.tagName === 'svg' || e.target.classList.contains('canvas-bg')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(2.5, Math.max(0.5, prev * zoomFactor)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    playClick();
  };

  // Node interaction handler
  const handleNodeClick = (node, e) => {
    e.stopPropagation();
    playClick();

    if (interactiveMode === 'set_start') {
      if (node.type === 'exit') {
        // Exits are destinations, but if clicked in set start, show feedback
        return;
      }
      onSelectStartNode(node.id);
    } else {
      // Toggle hazard mode
      if (node.type === 'exit') {
        // Toggle closed exit state
        onToggleExitClosed(node.id);
      } else {
        // Toggle room or junction blocked state
        onToggleNodeBlocked(node.id);
      }
    }
  };

  // Edge interaction handler
  const handleEdgeClick = (edge, e) => {
    e.stopPropagation();
    onToggleEdgeBlocked(edge.id);
  };

  // Runner current position during walkthrough
  const currentRunnerPos = useMemo(() => {
    if (!isSimulating || walkthroughStep < 0 || !routeResult || !routeResult.path) return null;
    const targetNodeId = routeResult.path[walkthroughStep];
    const node = nodeMap.get(targetNodeId);
    return node ? { x: node.x, y: node.y, id: targetNodeId, label: node.label } : null;
  }, [isSimulating, walkthroughStep, routeResult, nodeMap]);

  return (
    <div className="relative w-full h-[580px] lg:h-[640px] bg-cyber-900 rounded-2xl border border-cyber-700/80 shadow-2xl overflow-hidden flex flex-col select-none">
      
      {/* Canvas Top Bar Tools */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        {/* Mode Indicator Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyber-850/90 backdrop-blur-md border border-cyber-700 text-xs shadow-lg">
          <span className="text-slate-400">{t.modeSelect}:</span>
          <span className={`font-semibold flex items-center gap-1 ${
            interactiveMode === 'set_start' ? 'text-neon-blue' : 'text-danger-glow'
          }`}>
            {interactiveMode === 'set_start' ? (
              <>
                <Crosshair className="w-3.5 h-3.5" />
                {t.modeSetStart}
              </>
            ) : (
              <>
                <Flame className="w-3.5 h-3.5" />
                {t.modeToggleHazard}
              </>
            )}
          </span>
        </div>

        {/* Quick hint badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyber-850/70 backdrop-blur-md border border-cyber-750 text-[11px] text-slate-400 shadow-md">
          <Info className="w-3 h-3 text-slate-400" />
          <span>{t.helpTip}</span>
        </div>
      </div>

      {/* Floating Zoom & Pan Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-cyber-850/90 backdrop-blur-md p-1.5 rounded-xl border border-cyber-700 shadow-xl">
        <button
          onClick={() => { setZoom(prev => Math.min(2.5, prev + 0.15)); playClick(); }}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-cyber-700/70 transition-all"
          title={t.zoomIn}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setZoom(prev => Math.max(0.5, prev - 0.15)); playClick(); }}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-cyber-700/70 transition-all"
          title={t.zoomOut}
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="h-[1px] bg-cyber-700/60 my-0.5" />
        <button
          onClick={resetView}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-cyber-700/70 transition-all"
          title={t.resetView}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Walkthrough Status Banner */}
      {isSimulating && currentRunnerPos && (
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyber-850/95 border border-emerald-500/60 shadow-xl backdrop-blur-md animate-bounce">
          <Footprints className="w-4 h-4 text-escape-green animate-pulse" />
          <span className="text-xs text-white font-medium">
            {t.walkthroughProgress} <strong>{currentRunnerPos.label}</strong> ({walkthroughStep + 1}/{routeResult.path.length})
          </span>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-3 px-3 py-2 rounded-xl bg-cyber-850/85 backdrop-blur-md border border-cyber-750 text-[11px] text-slate-300 shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-neon-blue border border-cyan-300/50" />
          <span>{t.room}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-300/50" />
          <span>{t.junction}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-300/50 animate-pulse" />
          <span>{t.exit}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-danger border border-red-300/50" />
          <span>{t.blockedNode}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 rounded bg-emerald-400" />
          <span>{t.activeRoute}</span>
        </div>
      </div>

      {/* Interactive SVG Workspace */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing canvas-bg"
        viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          {/* Subtle architectural grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            <circle cx="0" cy="0" r="1.2" fill="rgba(56, 189, 248, 0.12)" />
          </pattern>

          {/* Gradients */}
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>

          {/* Arrowhead marker for active route directions */}
          <marker
            id="routeArrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#34d399" />
          </marker>
        </defs>

        {/* Scalable Container for Pan and Zoom */}
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{ transformOrigin: `${bounds.minX + bounds.width / 2}px ${bounds.minY + bounds.height / 2}px` }}
        >
          {/* Architectural Background Grid */}
          <rect
            className="canvas-bg"
            x={bounds.minX - 500}
            y={bounds.minY - 500}
            width={bounds.width + 1000}
            height={bounds.height + 1000}
            fill="url(#grid)"
          />

          {/* ============================================================== */}
          {/* 1. EDGES / CORRIDORS LAYER                                     */}
          {/* ============================================================== */}
          <g className="edges-layer">
            {edges.map((edge) => {
              const u = nodeMap.get(edge.from);
              const v = nodeMap.get(edge.to);
              if (!u || !v) return null;

              const isBlocked = blockedEdges.has(edge.id);
              const isRouteEdge = routeEdgeSet.has(edge.id);
              const midX = (u.x + v.x) / 2;
              const midY = (u.y + v.y) / 2;

              return (
                <g key={edge.id} className="cursor-pointer group">
                  {/* Invisible thick stroke for easy clicking */}
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke="transparent"
                    strokeWidth="28"
                    strokeLinecap="round"
                    onClick={(e) => handleEdgeClick(edge, e)}
                    onMouseEnter={() => setHoveredItem({ type: 'edge', data: edge, x: midX, y: midY })}
                    onMouseLeave={() => setHoveredItem(null)}
                  />

                  {/* Base Corridor Path */}
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={
                      isBlocked
                        ? '#ef4444'
                        : isRouteEdge
                        ? '#059669'
                        : '#334155'
                    }
                    strokeWidth={isRouteEdge ? '6' : isBlocked ? '4' : '3'}
                    strokeDasharray={isBlocked ? '6 6' : 'none'}
                    strokeLinecap="round"
                    className="transition-colors duration-200"
                    onClick={(e) => handleEdgeClick(edge, e)}
                  />

                  {/* Active Escape Route Glowing Overlay with flowing dashes */}
                  {isRouteEdge && !isBlocked && (
                    <line
                      x1={u.x}
                      y1={u.y}
                      x2={v.x}
                      y2={v.y}
                      stroke="#34d399"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="route-active-line glow-emerald"
                      markerEnd="url(#routeArrow)"
                      onClick={(e) => handleEdgeClick(edge, e)}
                    />
                  )}

                  {/* Hazard Indicator overlay on blocked corridors */}
                  {isBlocked && (
                    <circle
                      cx={midX}
                      cy={midY}
                      r="12"
                      fill="#7f1d1d"
                      stroke="#ef4444"
                      strokeWidth="2"
                      className="animate-pulse"
                      onClick={(e) => handleEdgeClick(edge, e)}
                    />
                  )}

                  {/* Corridor Cost Badge */}
                  <g
                    transform={`translate(${midX}, ${midY})`}
                    onClick={(e) => handleEdgeClick(edge, e)}
                    className="transition-transform transform hover:scale-110"
                  >
                    <rect
                      x="-15"
                      y="-10"
                      width="30"
                      height="20"
                      rx="6"
                      fill={
                        isBlocked
                          ? '#991b1b'
                          : isRouteEdge
                          ? '#064e3b'
                          : '#1e293b'
                      }
                      stroke={
                        isBlocked
                          ? '#ef4444'
                          : isRouteEdge
                          ? '#34d399'
                          : '#475569'
                      }
                      strokeWidth={isRouteEdge ? '1.5' : '1'}
                      className="transition-colors"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={isBlocked ? '#fca5a5' : isRouteEdge ? '#6ee7b7' : '#cbd5e1'}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {isBlocked ? '✕' : edge.cost}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* ============================================================== */}
          {/* 2. NODES LAYER                                                 */}
          {/* ============================================================== */}
          <g className="nodes-layer">
            {nodes.map((node) => {
              const isStart = node.id === startNodeId;
              const isBlocked = blockedNodes.has(node.id);
              const isClosed = node.type === 'exit' && closedExits.has(node.id);
              const isRouteNode = routeNodeSet.has(node.id);
              const isDestination = routeResult?.status === 'ROUTE_FOUND' && routeResult.exitId === node.id;
              const seqNum = nodeSequenceIndex.get(node.id);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onClick={(e) => handleNodeClick(node, e)}
                  onMouseEnter={() => setHoveredItem({ type: 'node', data: node, x: node.x, y: node.y })}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {/* Radar Wave for Start Location */}
                  {isStart && !isBlocked && (
                    <circle
                      cx="0"
                      cy="0"
                      r="22"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      className="radar-wave"
                    />
                  )}

                  {/* Pulsing Beacon for Destination Exit */}
                  {isDestination && (
                    <circle
                      cx="0"
                      cy="0"
                      r="26"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      className="radar-wave glow-emerald"
                    />
                  )}

                  {/* Danger Halo for Blocked/Hazard nodes */}
                  {isBlocked && (
                    <circle
                      cx="0"
                      cy="0"
                      r="24"
                      fill="rgba(239, 68, 68, 0.15)"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      className="animate-spin-slow glow-danger"
                    />
                  )}

                  {/* -------------------------------------------------------- */}
                  {/* NODE SHAPES BY TYPE                                      */}
                  {/* -------------------------------------------------------- */}

                  {/* TYPE A: EMERGENCY EXIT */}
                  {node.type === 'exit' && (
                    <g>
                      <rect
                        x="-24"
                        y="-20"
                        width="48"
                        height="40"
                        rx="10"
                        fill={
                          isBlocked || isClosed
                            ? '#7f1d1d'
                            : isDestination
                            ? '#065f46'
                            : '#064e3b'
                        }
                        stroke={
                          isBlocked || isClosed
                            ? '#ef4444'
                            : isDestination
                            ? '#34d399'
                            : '#10b981'
                        }
                        strokeWidth={isDestination ? '3' : '2'}
                        className={`transition-all duration-200 group-hover:scale-105 ${
                          isDestination ? 'glow-emerald' : ''
                        }`}
                      />

                      {/* Exit Glyph */}
                      <text
                        x="0"
                        y="1"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="16"
                      >
                        {isClosed || isBlocked ? '🔒' : '🚪'}
                      </text>

                      {/* Small "EXIT" header pill */}
                      <rect
                        x="-18"
                        y="-26"
                        width="36"
                        height="12"
                        rx="4"
                        fill={isClosed ? '#ef4444' : '#10b981'}
                      />
                      <text
                        x="0"
                        y="-17"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="Outfit, sans-serif"
                      >
                        {isClosed ? 'CLOSED' : 'EXIT'}
                      </text>
                    </g>
                  )}

                  {/* TYPE B: ROOM */}
                  {node.type === 'room' && (
                    <g>
                      <rect
                        x="-22"
                        y="-22"
                        width="44"
                        height="44"
                        rx="12"
                        fill={
                          isBlocked
                            ? '#7f1d1d'
                            : isStart
                            ? '#0369a1'
                            : isRouteNode
                            ? '#064e3b'
                            : '#1e293b'
                        }
                        stroke={
                          isBlocked
                            ? '#ef4444'
                            : isStart
                            ? '#38bdf8'
                            : isRouteNode
                            ? '#34d399'
                            : '#475569'
                        }
                        strokeWidth={isStart || isRouteNode ? '2.5' : '1.5'}
                        className={`transition-all duration-200 group-hover:scale-105 ${
                          isStart ? 'glow-blue' : isRouteNode ? 'glow-emerald' : ''
                        }`}
                      />

                      {/* Room Glyph */}
                      <text
                        x="0"
                        y="2"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="16"
                      >
                        {isBlocked ? '🔥' : isStart ? '🏃' : '🏠'}
                      </text>
                    </g>
                  )}

                  {/* TYPE C: JUNCTION */}
                  {node.type === 'junction' && (
                    <g>
                      <circle
                        cx="0"
                        cy="0"
                        r="18"
                        fill={
                          isBlocked
                            ? '#7f1d1d'
                            : isStart
                            ? '#0369a1'
                            : isRouteNode
                            ? '#064e3b'
                            : '#1e293b'
                        }
                        stroke={
                          isBlocked
                            ? '#ef4444'
                            : isStart
                            ? '#38bdf8'
                            : isRouteNode
                            ? '#34d399'
                            : '#475569'
                        }
                        strokeWidth={isStart || isRouteNode ? '2.5' : '1.5'}
                        className={`transition-all duration-200 group-hover:scale-105 ${
                          isStart ? 'glow-blue' : isRouteNode ? 'glow-emerald' : ''
                        }`}
                      />

                      {/* Junction Glyph */}
                      <text
                        x="0"
                        y="1"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="13"
                      >
                        {isBlocked ? '⚠️' : isStart ? '🏃' : '✦'}
                      </text>
                    </g>
                  )}

                  {/* Sequence Order Badge (#1, #2, #3...) for path nodes */}
                  {seqNum !== undefined && !isBlocked && (
                    <g transform="translate(16, -16)">
                      <circle
                        cx="0"
                        cy="0"
                        r="9"
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="shadow"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="#090d16"
                        fontSize="9"
                        fontWeight="800"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {seqNum}
                      </text>
                    </g>
                  )}

                  {/* "START" badge tag */}
                  {isStart && (
                    <g transform="translate(0, -32)">
                      <rect
                        x="-20"
                        y="-8"
                        width="40"
                        height="16"
                        rx="4"
                        fill="#0284c7"
                        stroke="#38bdf8"
                        strokeWidth="1"
                        className="animate-bounce"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="Outfit, sans-serif"
                      >
                        START
                      </text>
                    </g>
                  )}

                  {/* Node Label Text */}
                  <text
                    x="0"
                    y={node.type === 'exit' ? 32 : 32}
                    textAnchor="middle"
                    fill={
                      isBlocked
                        ? '#f87171'
                        : isStart
                        ? '#7dd3fc'
                        : isRouteNode
                        ? '#6ee7b7'
                        : '#cbd5e1'
                    }
                    fontSize="11"
                    fontWeight={isStart || isRouteNode ? '600' : '500'}
                    fontFamily="Outfit, Noto Sans Bengali, sans-serif"
                    className="pointer-events-none drop-shadow"
                    style={{ textDecoration: isBlocked ? 'line-through' : 'none' }}
                  >
                    {node.label}
                  </text>

                  {/* Node ID Subtext */}
                  <text
                    x="0"
                    y={node.type === 'exit' ? 44 : 44}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    className="pointer-events-none"
                  >
                    {node.id}
                  </text>
                </g>
              );
            })}
          </g>

          {/* ============================================================== */}
          {/* 3. SIMULATION RUNNER AVATAR LAYER                              */}
          {/* ============================================================== */}
          {isSimulating && currentRunnerPos && (
            <g
              transform={`translate(${currentRunnerPos.x}, ${currentRunnerPos.y})`}
              className="transition-all duration-300 pointer-events-none"
            >
              <circle
                cx="0"
                cy="0"
                r="24"
                fill="#34d399"
                opacity="0.3"
                className="animate-ping"
              />
              <circle
                cx="0"
                cy="0"
                r="16"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text
                x="0"
                y="5"
                textAnchor="middle"
                fontSize="14"
              >
                🏃
              </text>
            </g>
          )}
        </g>
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredItem && (
        <div
          className="absolute z-30 pointer-events-none bg-cyber-850/95 border border-cyber-600 backdrop-blur-md rounded-xl p-2.5 shadow-2xl text-xs max-w-xs transition-opacity duration-150"
          style={{
            left: '50%',
            bottom: '72px',
            transform: 'translateX(-50%)'
          }}
        >
          {hoveredItem.type === 'node' ? (
            <div>
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="font-bold text-white text-sm">
                  {hoveredItem.data.label}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyber-700 text-slate-300">
                  {hoveredItem.data.type}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                ID: <span className="text-slate-200">{hoveredItem.data.id}</span> | Coords: ({hoveredItem.data.x}, {hoveredItem.data.y})
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-cyber-700/80 text-[11px] text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>
                  {interactiveMode === 'set_start'
                    ? (lang === 'bn' ? 'শুরুর স্থান করতে ক্লিক করুন' : 'Click to set as Start Location')
                    : (lang === 'bn' ? 'ঝুঁকি অবস্থা টগল করতে ক্লিক করুন' : 'Click to toggle hazard state')}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="font-bold text-white text-sm">
                  {lang === 'bn' ? 'করিডোর' : 'Corridor'} {hoveredItem.data.id}
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {t.traversalCost.replace('{cost}', hoveredItem.data.cost)}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {hoveredItem.data.from} ➔ {hoveredItem.data.to}
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-cyber-700/80 text-[11px] text-danger-glow flex items-center gap-1">
                <Flame className="w-3 h-3" />
                <span>
                  {blockedEdges.has(hoveredItem.data.id)
                    ? (lang === 'bn' ? 'করিডোর খুলতে ক্লিক করুন' : 'Click to unblock corridor')
                    : (lang === 'bn' ? 'করিডোর অবরুদ্ধ করতে ক্লিক করুন' : 'Click to block corridor')}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
