import React from 'react';
import { 
  Navigation, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  ShieldAlert, 
  Layers, 
  Hash, 
  GitFork,
  Sparkles
} from 'lucide-react';
import { translations } from '../utils/translations';

export default function RouteDetails({
  routeResult,
  nodes = [],
  edges = [],
  lang,
}) {
  const t = translations[lang] || translations.en;

  const nodeMap = new Map();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const edgeMap = new Map();
  edges.forEach(e => edgeMap.set(e.id, e));

  if (!routeResult || routeResult.status !== 'ROUTE_FOUND') {
    return (
      <div className="w-full bg-cyber-850/70 border border-cyber-700/60 rounded-2xl p-5 shadow-lg text-center flex flex-col items-center justify-center min-h-[200px]">
        <div className="w-12 h-12 rounded-full bg-cyber-800 flex items-center justify-center text-slate-500 mb-3 border border-cyber-700">
          <Navigation className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-300">
          {lang === 'bn' ? 'কোনো সক্রিয় স্থানান্তর পথ নেই' : 'No Active Evacuation Route'}
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          {routeResult?.status === 'START_BLOCKED'
            ? t.statusStartBlocked
            : routeResult?.status === 'NO_ROUTE'
            ? t.statusNoRoute
            : (lang === 'bn' ? 'শুরুর স্থান নির্বাচন করুন অথবা বাধা সরান।' : 'Select an unblocked start node or clear corridor hazards.')}
        </p>
      </div>
    );
  }

  const { cost, exitId, path = [], edgePath = [], destinationNode } = routeResult;

  // Build hop-by-hop corridor data
  const steps = [];
  for (let i = 0; i < path.length - 1; i++) {
    const fromId = path[i];
    const toId = path[i + 1];
    const edgeId = edgePath[i];

    const fromNode = nodeMap.get(fromId);
    const toNode = nodeMap.get(toId);
    const edgeObj = edgeMap.get(edgeId);

    steps.push({
      stepNumber: i + 1,
      fromLabel: fromNode ? fromNode.label : fromId,
      fromId,
      toLabel: toNode ? toNode.label : toId,
      toId,
      cost: edgeObj ? edgeObj.cost : (lang === 'bn' ? 'অজানা' : 'N/A'),
      edgeId
    });
  }

  return (
    <div className="w-full bg-cyber-850/80 border border-cyber-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      
      {/* Header & Main Stats */}
      <div className="flex items-center justify-between border-b border-cyber-700/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              {t.routeSummary}
            </h3>
            <p className="text-[11px] text-slate-400">
              {t.tieBreakerInfo}
            </p>
          </div>
        </div>

        {/* Cost Badge */}
        <div className="text-right">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
            {t.totalCost}
          </span>
          <div className="text-lg font-bold font-mono text-emerald-400 flex items-center justify-end gap-1">
            <span>{cost}</span>
            <span className="text-xs font-normal text-emerald-300/80">{t.costUnits}</span>
          </div>
        </div>
      </div>

      {/* Target Exit & Steps Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-cyber-800/80 border border-cyber-700/70">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            {t.destinationExit}
          </span>
          <div className="font-semibold text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
            <span className="text-emerald-400">🚪</span>
            <span>{destinationNode ? destinationNode.label : exitId}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400/80 block mt-0.5">
            ID: {exitId}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-cyber-800/80 border border-cyber-700/70">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            {t.stepCount}
          </span>
          <div className="font-semibold text-xs sm:text-sm text-white flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-neon-blue" />
            <span>{path.length} {lang === 'bn' ? 'টি নোড' : 'Nodes'}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
            {edgePath.length} {lang === 'bn' ? 'টি করিডোর' : 'Corridors'}
          </span>
        </div>
      </div>

      {/* Path Sequence Breadcrumbs */}
      <div>
        <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-2">
          {t.pathSequence}
        </label>
        <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-cyber-900/80 border border-cyber-750 max-h-28 overflow-y-auto">
          {path.map((nodeId, idx) => {
            const node = nodeMap.get(nodeId);
            const isFirst = idx === 0;
            const isLast = idx === path.length - 1;

            return (
              <React.Fragment key={nodeId}>
                <span
                  className={`text-xs px-2 py-1 rounded-lg font-mono flex items-center gap-1 border transition-all ${
                    isFirst
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-semibold'
                      : isLast
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                      : 'bg-cyber-800 text-slate-200 border-cyber-700'
                  }`}
                  title={node ? `${node.label} (${node.type})` : nodeId}
                >
                  <span className="text-[10px] text-slate-400">#{idx + 1}</span>
                  <span>{node ? node.label : nodeId}</span>
                </span>
                {!isLast && (
                  <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step by Step Corridor Navigation Directions */}
      <div>
        <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-2">
          {t.corridorBreakdown}
        </label>
        <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
          {steps.map((step) => (
            <div
              key={step.stepNumber}
              className="flex items-center justify-between p-2.5 rounded-xl bg-cyber-800/60 border border-cyber-700/60 text-xs hover:border-emerald-500/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyber-750 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
                  {step.stepNumber}
                </span>
                <div className="text-slate-200">
                  <span className="font-medium text-white">{step.fromLabel}</span>
                  <span className="text-slate-400 mx-1.5">➔</span>
                  <span className="font-medium text-emerald-300">{step.toLabel}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-emerald-400 font-bold">
                  +{step.cost}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {step.edgeId}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
