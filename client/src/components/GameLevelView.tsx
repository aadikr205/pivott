import React, { useState } from 'react';
import { Trophy, Star, Flame, Zap, Shield, Play, CheckCircle2, Lock, Sparkles, Award, ArrowRight, Heart } from 'lucide-react';

export interface GameLevelItem {
  id: string;
  topic_name: string;
  subject_name: string;
  allocated_minutes: number;
  status: 'not_started' | 'in_progress' | 'done' | 'deferred' | 'revision';
  mastery_score?: number;
  onPlay?: () => void;
  onOpenVideo?: () => void;
  onOpenQuiz?: () => void;
}

interface GameLevelViewProps {
  title?: string;
  subtitle?: string;
  items: GameLevelItem[];
  onOpenQuiz?: (topicId: string, topicName: string, subjectName: string) => void;
  onOpenVideo?: (topicId: string, topicName: string, subjectName: string) => void;
  onStartTimer?: (topicId: string) => void;
}

const RANK_TITLES = [
  'Novice Explorer',
  'Concept Apprentice',
  'Formula Fighter',
  'Knowledge Knight',
  'Problem Slayer',
  'Exam Boss Champion',
  'Grandmaster Scholar'
];

export const GameLevelView: React.FC<GameLevelViewProps> = ({
  title = '🎮 Daily Study Quest (गेम लेवल मोड)',
  subtitle = 'Har topic ek level hai! Level complete karo, XP kamao aur exam boss ko harao.',
  items,
  onOpenQuiz,
  onOpenVideo,
  onStartTimer
}) => {
  const completedCount = items.filter(i => i.status === 'done').length;
  const totalXp = completedCount * 150 + items.filter(i => i.status === 'in_progress').length * 50;
  const playerLevel = Math.max(1, Math.floor(completedCount / 1) + 1);
  const currentRank = RANK_TITLES[Math.min(RANK_TITLES.length - 1, playerLevel - 1)];

  // Find first uncompleted level
  const activeLevelIdx = items.findIndex(i => i.status !== 'done');
  const safeActiveIdx = activeLevelIdx === -1 ? items.length - 1 : activeLevelIdx;

  return (
    <div className="space-y-6">
      {/* Player Game Profile & XP Stats Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 p-6 sm:p-7 shadow-2xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 p-0.5 shadow-xl flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex flex-col items-center justify-center text-amber-400">
                <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
                <span className="text-[10px] font-black uppercase text-amber-300">Lv.{playerLevel}</span>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[11px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" /> Rank: {currentRank}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Gamified Counters */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3" /> Total XP
              </span>
              <span className="text-base sm:text-lg font-black text-amber-300">
                {totalXp} XP
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-slate-950/80 border border-rose-500/30 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-rose-500 animate-bounce" /> Streak
              </span>
              <span className="text-base sm:text-lg font-black text-rose-300">
                5 Days 🔥
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center justify-center gap-1">
                <Star className="w-3 h-3" /> Cleared
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-300">
                {completedCount}/{items.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Level Quest Trail */}
      <div className="max-w-xl mx-auto py-6 space-y-8 relative">
        {items.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No active quests or topics right now.
          </div>
        ) : (
          items.map((item, idx) => {
            const isDone = item.status === 'done';
            const isActive = idx === safeActiveIdx && !isDone;
            const isLocked = idx > safeActiveIdx;

            // Alternate zig-zag layout for RPG adventure feel
            const alignment = idx % 2 === 0 ? 'sm:justify-start' : 'sm:justify-end';

            return (
              <div key={item.id || idx} className={`flex justify-center ${alignment} relative group`}>
                <div
                  className={`w-full sm:max-w-md p-5 rounded-3xl border transition-all ${
                    isActive
                      ? 'bg-gradient-to-b from-purple-950/80 via-slate-900 to-indigo-950/80 border-purple-500 shadow-2xl ring-4 ring-purple-500/20 scale-[1.02]'
                      : isDone
                      ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      {/* Circular Level Avatar */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-xl shrink-0 transition-transform ${
                          isActive
                            ? 'bg-gradient-to-tr from-purple-600 to-amber-500 text-white animate-pulse'
                            : isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5" />
                        ) : (
                          <span>L{idx + 1}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                            Level {idx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {item.subject_name}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-white mt-0.5 leading-snug">
                          {item.topic_name}
                        </h4>
                      </div>
                    </div>

                    {/* Star Reward Rating */}
                    <div className="flex items-center space-x-1 shrink-0">
                      {isDone ? (
                        <>
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        </>
                      ) : (
                        <div className="text-[11px] font-black text-amber-400 font-mono">
                          +150 XP
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Level Details & Time */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Target Time: {item.allocated_minutes} Mins</span>
                    <span
                      className={`font-bold ${
                        isDone
                          ? 'text-emerald-400'
                          : isActive
                          ? 'text-purple-300 animate-pulse font-black'
                          : 'text-slate-500'
                      }`}
                    >
                      {isDone ? '⭐⭐⭐ CLEARED' : isActive ? '⚔️ CURRENT QUEST' : '🔒 LOCKED'}
                    </span>
                  </div>

                  {/* Active Level Play CTA Buttons */}
                  {isActive && (
                    <div className="mt-3.5 pt-2 flex items-center gap-2 flex-wrap justify-end">
                      {onStartTimer && (
                        <button
                          type="button"
                          onClick={() => onStartTimer(item.id)}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-lg transition-transform hover:scale-105 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>PLAY LEVEL</span>
                        </button>
                      )}

                      {onOpenVideo && (
                        <button
                          type="button"
                          onClick={() => onOpenVideo(item.id, item.topic_name, item.subject_name)}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Video</span>
                        </button>
                      )}

                      {onOpenQuiz && (
                        <button
                          type="button"
                          onClick={() => onOpenQuiz(item.id, item.topic_name, item.subject_name)}
                          className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Quiz (+100 XP)</span>
                        </button>
                      )}
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
