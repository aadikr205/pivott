import React, { useState, useEffect } from 'react';
import { AlertCircle, RotateCcw, Clock, ShieldAlert, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../api/client';

interface DeferredTopicsProps {
  onReplanCompleted: () => void;
}

export const DeferredTopics: React.FC<DeferredTopicsProps> = ({ onReplanCompleted }) => {
  const [deferredList, setDeferredList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reincludingId, setReincludingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchDeferred = () => {
    setLoading(true);
    api.getDeferredTopics()
      .then(res => {
        setDeferredList(res.deferred_topics || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load deferred topics:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDeferred();
  }, []);

  const handleReinclude = async (topicId: string) => {
    setReincludingId(topicId);
    setSuccessMsg(null);
    try {
      const res = await api.reincludeTopic(topicId);
      setSuccessMsg(res.message || 'Topic re-included into your study schedule.');
      fetchDeferred();
      onReplanCompleted();
    } catch (err: any) {
      alert(err.message || 'Failed to re-include topic.');
    } finally {
      setReincludingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Sparkles className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Checking deferred syllabus reserves...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
              Safe Overflow Reserve
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {deferredList.length} Topic{deferredList.length === 1 ? '' : 's'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Deferred & Skimmed Syllabus
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
            Whenever time is constrained, Pivott safely parks lower-priority topics here instead of forcing impossible 12–14 hour cram days. They are never lost.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* List of Deferred Topics */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
        {deferredList.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Deferred Topics</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your entire syllabus currently fits within your daily maximum hour cap without any cuts needed!
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {deferredList.map(topic => {
              const isSkim = topic.status === 'skim_only';
              const isReincluding = reincludingId === topic.id;

              return (
                <div
                  key={topic.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-teal-200 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                        {topic.subject_name || 'Subject'}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Focus Level: {topic.weightage}/5
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        isSkim ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {isSkim ? 'Compressed to Skim-Only' : 'Deferred (Time Deficit)'}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 mt-1.5">
                      {topic.name}
                    </h3>

                    <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1 font-mono">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Estimated: {topic.estimated_minutes} mins</span>
                      </span>
                      {topic.mastery_score > 0 && (
                        <span>Mastery: {topic.mastery_score}%</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleReinclude(topic.id)}
                      disabled={isReincluding}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isReincluding ? 'animate-spin' : ''}`} />
                      <span>{isReincluding ? 'Re-Scheduling...' : 'Re-Include in Plan'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
