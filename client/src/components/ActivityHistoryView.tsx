import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Filter, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  RotateCcw, 
  LogIn, 
  User as UserIcon,
  Search,
  Sparkles,
  Lock,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import { api, ActivityLog, User } from '../api/client';

interface ActivityHistoryViewProps {
  user: User | null;
  onNavigateToTab?: (tab: string) => void;
}

export const ActivityHistoryView: React.FC<ActivityHistoryViewProps> = ({ user, onNavigateToTab }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      let startDate: string | undefined;
      const now = new Date();

      if (selectedDateRange === 'today') {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        startDate = d.toISOString();
      } else if (selectedDateRange === '7d') {
        const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = d.toISOString();
      } else if (selectedDateRange === '30d') {
        const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate = d.toISOString();
      }

      const res = await api.getActivityHistory({
        type: selectedType === 'all' ? undefined : selectedType,
        start_date: startDate,
        limit: 100
      });

      setLogs(res.logs || []);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to fetch activity history:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedDateRange]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Filter logs by search query
  const filteredLogs = logs.filter(log => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (log.title && log.title.toLowerCase().includes(query)) ||
      (log.activity_type && log.activity_type.toLowerCase().includes(query)) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(query))
    );
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz_attempt':
        return <Award className="w-4 h-4 text-indigo-600" />;
      case 'pyq_practice':
      case 'pyq_attempt':
        return <BookOpen className="w-4 h-4 text-purple-600" />;
      case 'timetable_progress':
        return <CheckCircle2 className="w-4 h-4 text-teal-600" />;
      case 'timetable_replan':
        return <RotateCcw className="w-4 h-4 text-amber-600" />;
      case 'auth_signup':
      case 'auth_login':
        return <LogIn className="w-4 h-4 text-emerald-600" />;
      case 'profile_photo_update':
      case 'profile_avatar_update':
        return <UserIcon className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'quiz_attempt':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'pyq_practice':
      case 'pyq_attempt':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'timetable_progress':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'timetable_replan':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'auth_signup':
      case 'auth_login':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'profile_photo_update':
      case 'profile_avatar_update':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner with Security Verification Badge */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Immutable Audit Trail • Insert-Only Protection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Permanent Activity History
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Every milestone, practice session, and timetable adjustment is cryptographically recorded 
              against verified Gmail ID <strong className="text-white font-mono underline decoration-teal-400">{user?.email || 'Student Account'}</strong>. 
              Logs are permanent and cannot be altered or deleted.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[120px]">
              <div className="text-2xl font-black text-teal-300">{totalCount}</div>
              <div className="text-[11px] text-slate-300 font-medium uppercase tracking-wider">Logged Events</div>
            </div>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all cursor-pointer"
              title="Refresh Activity"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search logged topics, actions, or scores..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0 ml-1 mr-0.5" />
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' }
            ].map(range => (
              <button
                key={range.id}
                onClick={() => setSelectedDateRange(range.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedDateRange === range.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Type Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {[
            { id: 'all', label: 'All Types' },
            { id: 'timetable_progress', label: 'Study Progress' },
            { id: 'quiz_attempt', label: 'Quizzes' },
            { id: 'pyq_practice', label: 'PYQ Practice' },
            { id: 'timetable_replan', label: 'Re-Plans' },
            { id: 'auth_login', label: 'Logins & Auth' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedType === type.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
            <p className="text-sm text-slate-500">Retrieving permanent audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Activity Logs Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start studying topics, practicing PYQs, or taking quizzes to see your permanent progress trail here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log, index) => {
              const detailsObj = typeof log.details === 'string' ? JSON.parse(log.details || '{}') : (log.details || {});
              return (
                <div
                  key={log.id || index}
                  className="flex items-start space-x-3.5 sm:space-x-4 p-3.5 sm:p-4 rounded-2xl border border-slate-100 hover:border-teal-200 hover:bg-slate-50/50 transition-all group"
                >
                  {/* Icon Circle */}
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 border ${getActivityBadgeColor(log.activity_type)}`}>
                    {getActivityIcon(log.activity_type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getActivityBadgeColor(log.activity_type)}`}>
                          {log.activity_type.replace(/_/g, ' ')}
                        </span>
                        {detailsObj.status && (
                          <span className="text-[11px] font-medium text-slate-500">
                            Status: <strong className="text-slate-700 capitalize">{detailsObj.status}</strong>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatDateTime(log.created_at)}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-teal-900 transition-colors">
                      {log.title}
                    </h4>

                    {/* Meta Chips */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {detailsObj.score !== undefined && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                          Score: {detailsObj.score}/{detailsObj.total_questions || 10} ({detailsObj.percentage || 0}%)
                        </span>
                      )}
                      {detailsObj.minutes_done !== undefined && detailsObj.minutes_done > 0 && (
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                          +{detailsObj.minutes_done} mins studied
                        </span>
                      )}
                      {detailsObj.year && (
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                          Year {detailsObj.year}
                        </span>
                      )}
                      {detailsObj.keptCount !== undefined && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                          {detailsObj.keptCount} kept • {detailsObj.compressedCount} compressed • {detailsObj.deferredCount} deferred
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono ml-auto">
                        Log ID: {log.id?.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security Info Card */}
      <div className="rounded-2xl p-4 bg-slate-100/80 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-slate-500 shrink-0" />
          <span>This audit ledger is append-only. No deletion, editing, or truncating is permitted by API.</span>
        </div>
        <span className="text-slate-400 font-mono text-[11px]">Pivott v2.5 Security</span>
      </div>
    </div>
  );
};
