import React, { useState, useEffect } from 'react';
import { History, Sparkles, CheckCircle2, ShieldCheck, AlertCircle, Minimize2 } from 'lucide-react';
import { api } from '../api/client';

export const ReplanHistory: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getReplanHistory()
      .then(res => {
        setLogs(res.history || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load replan history:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Sparkles className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading audit trail of plan adjustments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              Audit Trail
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {logs.length} Total Re-Adjustment Events
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Re-Plan & Adaptation History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Transparent record of every time Pivott protected your hours and redistributed your study load.
          </p>
        </div>
      </div>

      {/* List of Replan Logs */}
      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No Re-Plans Recorded Yet</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your initial schedule was generated. As you log progress, any re-plan events will be logged here.
            </p>
          </div>
        ) : (
          logs.map((log) => {
            const dateStr = new Date(log.triggered_at).toLocaleString();
            const diff = log.diff_summary || {};

            return (
              <div
                key={log.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
                    <h3 className="text-sm font-bold text-slate-900">{log.reason}</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{dateStr}</span>
                </div>

                {/* AI Calm Explanation Note */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200/60 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-800 mb-1">Coach Note:</p>
                  <p>{log.summary_text}</p>
                </div>

                {/* Diff metrics */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  {diff.keptCount !== undefined && (
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{diff.keptCount} Topics Protected</span>
                    </div>
                  )}

                  {diff.compressedCount !== undefined && diff.compressedCount > 0 && (
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 font-medium">
                      <Minimize2 className="w-4 h-4 text-blue-600" />
                      <span>{diff.compressedCount} Compressed (Skim)</span>
                    </div>
                  )}

                  {diff.deferredCount !== undefined && diff.deferredCount > 0 && (
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 font-medium">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>{diff.deferredCount} Deferred</span>
                    </div>
                  )}

                  {diff.maxDailyHours && (
                    <div className="text-slate-500 font-medium ml-auto">
                      Daily Cap: ≤ {diff.maxDailyHours}h
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
