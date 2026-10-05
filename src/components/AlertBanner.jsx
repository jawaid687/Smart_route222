import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { translations } from '../utils/translations';

export default function AlertBanner({
  routeResult,
  validationErrors,
  lang,
  onDismissValidation,
  customNotice
}) {
  const t = translations[lang] || translations.en;

  // 1. Validation Errors
  if (validationErrors && validationErrors.length > 0) {
    return (
      <div className="w-full bg-danger-dark/80 border border-danger/60 backdrop-blur-md text-red-100 rounded-xl p-4 shadow-lg shadow-red-950/40 animate-fadeIn mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-danger-glow shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white flex items-center gap-2">
                <span>{t.jsonValidationFailed}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/30 text-red-200">
                  {validationErrors.length} {lang === 'bn' ? 'টি সমস্যা' : 'issues'}
                </span>
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-red-200 list-disc list-inside max-h-36 overflow-y-auto pr-2">
                {validationErrors.map((err, idx) => (
                  <li key={idx} className="font-mono text-xs text-red-100/90">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {onDismissValidation && (
            <button
              onClick={onDismissValidation}
              className="text-red-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              title={t.close}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. Custom Notice (e.g. Initial state reset, drill triggered)
  if (customNotice) {
    return (
      <div className="w-full bg-cyber-750/90 border border-cyber-600/60 backdrop-blur-md text-slate-200 rounded-xl p-3.5 shadow-md flex items-center justify-between gap-3 mb-4 animate-fadeIn">
        <div className="flex items-center gap-2.5 text-sm">
          <Info className="w-5 h-5 text-neon-blue shrink-0" />
          <span>{customNotice}</span>
        </div>
      </div>
    );
  }

  // 3. Algorithm Route Statuses
  if (!routeResult) return null;

  if (routeResult.status === 'START_BLOCKED') {
    return (
      <div className="w-full bg-red-950/70 border-2 border-danger/80 backdrop-blur-md text-red-200 rounded-xl p-4 shadow-xl shadow-red-950/50 flex items-start gap-3 mb-4 animate-pulse-slow">
        <ShieldAlert className="w-6 h-6 text-danger-glow shrink-0 mt-0.5 animate-bounce" />
        <div>
          <h4 className="font-bold text-white text-base tracking-wide flex items-center gap-2">
            <span>{t.statusStartBlocked}</span>
          </h4>
          <p className="text-xs text-red-300/90 mt-1">
            {lang === 'bn'
              ? 'অনুগ্রহ করে মানচিত্র থেকে অন্য একটি অনিষিদ্ধ শুরুর কক্ষ নির্বাচন করুন অথবা বর্তমান নোডের অবরুদ্ধ অবস্থা অপসারণ করুন।'
              : 'Please choose an unblocked starting room/junction or click this node to remove the hazard.'}
          </p>
        </div>
      </div>
    );
  }

  if (routeResult.status === 'NO_ROUTE') {
    return (
      <div className="w-full bg-amber-950/70 border-2 border-warning/80 backdrop-blur-md text-amber-200 rounded-xl p-4 shadow-xl shadow-amber-950/50 flex items-start gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-warning-glow shrink-0 mt-0.5 animate-pulse" />
        <div>
          <h4 className="font-bold text-white text-base tracking-wide">
            {t.statusNoRoute}
          </h4>
          <p className="text-xs text-amber-300/90 mt-1">
            {lang === 'bn'
              ? 'কোনো খোলা জরুরি প্রস্থানের সাথে কোনো সক্রিয় সংযোগ নেই। করিডোর অথবা নোড থেকে বাধা সরিয়ে পথ তৈরি করুন।'
              : 'All passages leading to open emergency exits are blocked by hazards. Clear one or more corridors to restore safe egress.'}
          </p>
        </div>
      </div>
    );
  }

  if (routeResult.status === 'NO_OPEN_EXITS') {
    return (
      <div className="w-full bg-amber-950/70 border-2 border-warning/80 backdrop-blur-md text-amber-200 rounded-xl p-4 shadow-xl shadow-amber-950/50 flex items-start gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-warning-glow shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-white text-base tracking-wide">
            {t.statusNoExits}
          </h4>
          <p className="text-xs text-amber-300/90 mt-1">
            {lang === 'bn'
              ? 'ভবনের সবকটি জরুরি প্রস্থান বন্ধ অথবা অবরুদ্ধ রয়েছে। যেকোনো একটি প্রস্থান পুনরায় খুলুন।'
              : 'Every emergency exit is locked or hazardous. Reopen at least one exit to compute a route.'}
          </p>
        </div>
      </div>
    );
  }

  if (routeResult.status === 'ROUTE_FOUND') {
    return (
      <div className="w-full bg-emerald-950/50 border border-escape-green/50 backdrop-blur-md text-emerald-200 rounded-xl p-3 shadow-lg shadow-emerald-950/30 flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-escape-glow shrink-0" />
          <span className="text-sm font-medium text-white">
            {t.statusRouteFound}
          </span>
          <span className="hidden sm:inline-block text-xs font-mono bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/50">
            {t.totalCost}: <strong className="text-white">{routeResult.cost}</strong> {t.costUnits}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-300/80 font-mono">
          <span>➔ {routeResult.exitId}</span>
        </div>
      </div>
    );
  }

  return null;
}
