import React from 'react';
import { 
  Flame, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  XCircle, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { translations } from '../utils/translations';
import { playClick } from '../utils/audio';

export default function HazardManager({
  nodes = [],
  edges = [],
  blockedNodes = new Set(),
  blockedEdges = new Set(),
  closedExits = new Set(),
  onUnblockNode,
  onUnblockEdge,
  onReopenExit,
  lang,
}) {
  const t = translations[lang] || translations.en;

  const nodeMap = new Map();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const edgeMap = new Map();
  edges.forEach(e => edgeMap.set(e.id, e));

  const blockedNodeList = Array.from(blockedNodes);
  const blockedEdgeList = Array.from(blockedEdges);
  const closedExitList = Array.from(closedExits);

  const totalHazards = blockedNodeList.length + blockedEdgeList.length + closedExitList.length;

  return (
    <div className="w-full bg-cyber-850/80 border border-cyber-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyber-700/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-danger/20 text-danger-glow border border-danger/40">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              {t.hazardsTitle}
            </h3>
            <span className="text-[11px] text-slate-400">
              {totalHazards} {lang === 'bn' ? 'টি সক্রিয় ঝুঁকি / বন্ধ' : 'active hazards / restrictions'}
            </span>
          </div>
        </div>

        {totalHazards === 0 ? (
          <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'নিরাপদ' : 'Clear'}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-danger-glow font-medium px-2 py-0.5 rounded-full bg-danger/10 border border-danger/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'বিপদাপন্ন' : 'Active'}</span>
          </span>
        )}
      </div>

      {totalHazards === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs flex flex-col items-center justify-center">
          <ShieldCheck className="w-10 h-10 text-emerald-500/60 mb-2" />
          <p>{t.noActiveHazards}</p>
          <p className="text-[11px] text-slate-500 mt-1">{t.clickToToggleHint}</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
          
          {/* 1. Closed Exits */}
          {closedExitList.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>{t.closedExitsList} ({closedExitList.length})</span>
              </div>
              <div className="space-y-1.5">
                {closedExitList.map((exitId) => {
                  const node = nodeMap.get(exitId);
                  return (
                    <div
                      key={exitId}
                      className="flex items-center justify-between p-2 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs"
                    >
                      <div className="truncate pr-2">
                        <span className="font-medium text-white">
                          {node ? node.label : exitId}
                        </span>
                        <span className="text-[10px] font-mono text-amber-300/80 block">
                          {exitId}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          playClick();
                          onReopenExit(exitId);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-[11px] transition-all shrink-0"
                      >
                        {t.reopen}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Blocked Nodes */}
          {blockedNodeList.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-danger-glow uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>{t.blockedNodesList} ({blockedNodeList.length})</span>
              </div>
              <div className="space-y-1.5">
                {blockedNodeList.map((nodeId) => {
                  const node = nodeMap.get(nodeId);
                  return (
                    <div
                      key={nodeId}
                      className="flex items-center justify-between p-2 rounded-xl bg-danger-dark/30 border border-danger/40 text-xs"
                    >
                      <div className="truncate pr-2">
                        <span className="font-medium text-white">
                          {node ? node.label : nodeId}
                        </span>
                        <span className="text-[10px] font-mono text-red-300/80 block">
                          {nodeId} ({node?.type || 'node'})
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          playClick();
                          onUnblockNode(nodeId);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-[11px] transition-all shrink-0"
                      >
                        {t.unblock}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Blocked Corridors */}
          {blockedEdgeList.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-red-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                <span>{t.blockedEdgesList} ({blockedEdgeList.length})</span>
              </div>
              <div className="space-y-1.5">
                {blockedEdgeList.map((edgeId) => {
                  const edge = edgeMap.get(edgeId);
                  return (
                    <div
                      key={edgeId}
                      className="flex items-center justify-between p-2 rounded-xl bg-danger-dark/30 border border-danger/40 text-xs"
                    >
                      <div className="truncate pr-2">
                        <span className="font-medium text-white">
                          {edge ? `${edge.from} ➔ ${edge.to}` : edgeId}
                        </span>
                        <span className="text-[10px] font-mono text-red-300/80 block">
                          ID: {edgeId} | Cost: {edge?.cost ?? 'N/A'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          playClick();
                          onUnblockEdge(edgeId);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-[11px] transition-all shrink-0"
                      >
                        {t.unblock}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Footer Hint */}
      <div className="mt-3 pt-3 border-t border-cyber-700/60 text-[11px] text-slate-400 flex items-center justify-between">
        <span>{t.clickToToggleHint}</span>
      </div>

    </div>
  );
}
