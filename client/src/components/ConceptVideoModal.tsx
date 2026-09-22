import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  ArrowRight, 
  Tv,
  Smile,
  Zap,
  BookmarkCheck
} from 'lucide-react';
import { api, ConceptVideoData, ConceptVideoSlide } from '../api/client';
import { MermaidRenderer } from './MermaidRenderer';

export interface ConceptVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  topicName: string;
  subjectName?: string;
  onCompleted?: () => void;
  videoStyle?: 'cartoon' | 'standard';
  preloadedData?: ConceptVideoData | null;
  onQuizComplete?: (score: number, total: number) => void;
}

const SECONDS_PER_SLIDE = 30;

export const ConceptVideoModal: React.FC<ConceptVideoModalProps> = ({
  isOpen,
  onClose,
  topicId,
  topicName,
  subjectName,
  onCompleted,
  videoStyle = 'standard',
  preloadedData,
  onQuizComplete
}) => {
  const [videoData, setVideoData] = useState<ConceptVideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Continuous playback & seek time states
  const [currentTime, setCurrentTime] = useState(0);
  const [resumedFromTime, setResumedFromTime] = useState<number | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  // Post-Video Quiz Mode states
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Speech synthesis & playback references
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const playbackTimerRef = useRef<any>(null);
  const lastTickTimeRef = useRef<number>(0);

  // Determine effective visual style (either prop or videoData flag)
  const isCartoonStyle = videoStyle === 'cartoon' || videoData?.video_style === 'cartoon';

  // Total duration in seconds
  const totalSlides = videoData?.slides?.length || 0;
  const totalDurationSeconds = Math.max(1, totalSlides * SECONDS_PER_SLIDE);

  const formatTime = (secs: number) => {
    const safeSecs = Math.max(0, Math.floor(secs));
    const m = Math.floor(safeSecs / 60);
    const s = safeSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Stop speech helper
  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Speak current slide script
  const speakCurrentSlide = (slide: ConceptVideoSlide) => {
    stopSpeech();
    if (isMuted || !('speechSynthesis' in window)) return;

    const textToRead = `${slide.title}. ${slide.narration_script}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = isCartoonStyle ? 0.95 : 1.0;
    utterance.pitch = isCartoonStyle ? 1.15 : 1.0;
    utterance.lang = 'en-US';

    utterance.onend = () => {
      // Audio narration for this slide finished
    };

    utterance.onerror = () => {
      // Ignore speech interruptions or browser autoplay restrictions
    };

    utteranceRef.current = utterance;
    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      // Audio fallback
    }
  };

  // Fetch or set video data when modal opens
  useEffect(() => {
    if (!isOpen || !topicId) return;

    setLoading(true);
    setCurrentSlideIndex(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setIsQuizMode(false);
    setUserAnswers({});
    setQuizSubmitted(false);
    setShowResumeBanner(false);
    setResumedFromTime(null);

    const initData = (data: ConceptVideoData) => {
      setVideoData(data);
      const totalSecs = (data.slides?.length || 1) * SECONDS_PER_SLIDE;

      // Check saved resume position
      try {
        const savedPos = localStorage.getItem(`pivott_video_pos_${topicId}`);
        if (savedPos) {
          const parsed = parseFloat(savedPos);
          if (!isNaN(parsed) && parsed > 5 && parsed < totalSecs - 5) {
            setCurrentTime(parsed);
            const initialSlide = Math.min((data.slides?.length || 1) - 1, Math.floor(parsed / SECONDS_PER_SLIDE));
            setCurrentSlideIndex(initialSlide);
            setResumedFromTime(parsed);
            setShowResumeBanner(true);
          }
        }
      } catch (err) {
        console.warn('Could not read video resume position:', err);
      }
    };

    if (preloadedData) {
      initData(preloadedData);
      setLoading(false);
    } else {
      api.getTopicVideo(topicId)
        .then(data => {
          initData(data);
        })
        .catch(err => {
          console.error('Failed to load concept video:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }

    return () => {
      stopSpeech();
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isOpen, topicId, preloadedData]);

  // Continuous Playback Loop
  useEffect(() => {
    if (!isPlaying || isQuizMode || loading || isDraggingSlider) {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
      return;
    }

    lastTickTimeRef.current = Date.now();
    playbackTimerRef.current = setInterval(() => {
      const now = Date.now();
      const deltaSec = (now - lastTickTimeRef.current) / 1000;
      lastTickTimeRef.current = now;

      setCurrentTime(prevTime => {
        const nextTime = prevTime + deltaSec;

        // Save position to localStorage periodically
        try {
          localStorage.setItem(`pivott_video_pos_${topicId}`, Math.floor(nextTime).toString());
        } catch {
          // Ignore storage quota error
        }

        // Check if reached the end
        if (nextTime >= totalDurationSeconds) {
          setIsPlaying(false);
          stopSpeech();
          // Clear resume position upon completion
          try {
            localStorage.removeItem(`pivott_video_pos_${topicId}`);
          } catch {}
          api.completeTopicVideo(topicId).catch(() => {});
          setIsQuizMode(true);
          return totalDurationSeconds;
        }

        // Check slide sync
        const calculatedSlideIndex = Math.min(totalSlides - 1, Math.floor(nextTime / SECONDS_PER_SLIDE));
        if (calculatedSlideIndex !== currentSlideIndex) {
          setCurrentSlideIndex(calculatedSlideIndex);
          if (videoData?.slides?.[calculatedSlideIndex]) {
            speakCurrentSlide(videoData.slides[calculatedSlideIndex]);
          }
        }

        return nextTime;
      });
    }, 250);

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, isQuizMode, loading, isDraggingSlider, currentSlideIndex, totalSlides, totalDurationSeconds, topicId, videoData]);

  // Handle Play/Pause toggle
  const togglePlay = () => {
    if (!isPlaying) {
      // Start or Resume
      setIsPlaying(true);
      if (videoData?.slides?.[currentSlideIndex]) {
        speakCurrentSlide(videoData.slides[currentSlideIndex]);
      }
    } else {
      setIsPlaying(false);
      stopSpeech();
    }
  };

  // Jump to specific time (Seek)
  const seekToTime = (targetSec: number, resumePlay: boolean = isPlaying) => {
    const clamped = Math.max(0, Math.min(totalDurationSeconds, targetSec));
    setCurrentTime(clamped);
    const newSlideIndex = Math.min(totalSlides - 1, Math.floor(clamped / SECONDS_PER_SLIDE));
    setCurrentSlideIndex(newSlideIndex);

    try {
      localStorage.setItem(`pivott_video_pos_${topicId}`, Math.floor(clamped).toString());
    } catch {}

    if (resumePlay && videoData?.slides?.[newSlideIndex]) {
      speakCurrentSlide(videoData.slides[newSlideIndex]);
    } else {
      stopSpeech();
    }
  };

  // Skip forward +10s
  const handleSkipForward = () => {
    seekToTime(currentTime + 10);
  };

  // Skip backward -10s
  const handleSkipBackward = () => {
    seekToTime(currentTime - 10);
  };

  // Manual Slide Navigation buttons
  const advanceSlide = () => {
    if (currentSlideIndex < totalSlides - 1) {
      const nextSlide = currentSlideIndex + 1;
      seekToTime(nextSlide * SECONDS_PER_SLIDE);
    } else {
      handleStartQuiz();
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      const prev = currentSlideIndex - 1;
      seekToTime(prev * SECONDS_PER_SLIDE);
    } else {
      seekToTime(0);
    }
  };

  const handleStartQuiz = () => {
    setIsPlaying(false);
    stopSpeech();
    api.completeTopicVideo(topicId).catch(() => {});
    setIsQuizMode(true);
  };

  const handleRestartFromBeginning = () => {
    setShowResumeBanner(false);
    setResumedFromTime(null);
    seekToTime(0, false);
    try {
      localStorage.removeItem(`pivott_video_pos_${topicId}`);
    } catch {}
  };

  const handleSelectAnswer = (questionIdx: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionIdx]: optionIdx
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!videoData || !videoData.quiz) return;
    setSubmittingQuiz(true);

    let score = 0;
    videoData.quiz.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct_index) {
        score++;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    try {
      if (onQuizComplete) {
        onQuizComplete(score, videoData.quiz.length);
      } else {
        await api.submitQuiz({
          topic_id: topicId,
          score,
          total_questions: videoData.quiz.length,
          time_taken_seconds: 90,
          questions: videoData.quiz
        });

        if (score >= 7) {
          const todayStr = new Date().toISOString().split('T')[0];
          await api.markProgress({
            date: todayStr,
            topic_id: topicId,
            minutes_done: 30,
            status: 'done'
          });
        }
      }

      if (onCompleted) {
        onCompleted();
      }
    } catch (err) {
      console.error('Failed to submit post-video quiz:', err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  if (!isOpen) return null;

  const currentSlide = videoData?.slides?.[currentSlideIndex];
  const progressPercent = totalDurationSeconds > 0 ? (currentTime / totalDurationSeconds) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className={`border rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white transition-colors duration-300 ${
        isCartoonStyle 
          ? 'bg-slate-900 border-amber-400/40 ring-1 ring-amber-400/20' 
          : 'bg-slate-900 border-slate-800'
      }`}>
        
        {/* Top Header Bar */}
        <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
          isCartoonStyle 
            ? 'bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900 border-amber-500/30' 
            : 'bg-slate-900/90 border-slate-800/80'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs ${
              isCartoonStyle 
                ? 'bg-gradient-to-br from-amber-400 to-pink-500 border-amber-300/40 text-slate-950' 
                : 'bg-teal-500/20 border-teal-500/30 text-teal-400'
            }`}>
              {isCartoonStyle ? <Smile className="w-6 h-6 animate-bounce" /> : <Tv className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  isCartoonStyle
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                    : 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                }`}>
                  {isCartoonStyle ? '🎨 Cartoon Animation Studio' : 'Interactive Concept Video'}
                </span>
                <span className="text-xs text-slate-400">
                  {subjectName || 'Study Topic'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight line-clamp-1">
                {topicName}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isQuizMode && (
              <button
                onClick={handleStartQuiz}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Jump to 10-Q Quiz</span>
              </button>
            )}
            <button
              onClick={() => {
                stopSpeech();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resume Position Banner if returning to video */}
        {showResumeBanner && !isQuizMode && (
          <div className="bg-teal-500/15 border-b border-teal-500/30 px-5 py-2 flex items-center justify-between text-xs text-teal-200 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <BookmarkCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>
                Resumed from where you left off at <strong className="font-mono text-teal-100">{formatTime(resumedFromTime || 0)}</strong>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRestartFromBeginning}
                className="underline hover:text-white font-semibold cursor-pointer"
              >
                Restart from Beginning
              </button>
              <button
                onClick={() => setShowResumeBanner(false)}
                className="text-slate-400 hover:text-white cursor-pointer ml-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/40">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <Sparkles className="w-9 h-9 text-teal-400 animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-300">
                {isCartoonStyle 
                  ? 'Assembling colorful cartoon frames & friendly voiceover...' 
                  : 'Generating structured concept briefing with narration...'}
              </p>
            </div>
          ) : isQuizMode ? (
            /* 10-Question Post-Video Quiz Screen */
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                    <Award className="w-4 h-4" />
                    <span>Post-Video Retention Check</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">10-Question Post-Video Quiz</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Target threshold: ≥ 7/10 (70%) to confirm topic mastery.
                  </p>
                </div>
                <button
                  onClick={() => setIsQuizMode(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
                >
                  ← Back to Video
                </button>
              </div>

              {quizSubmitted ? (
                /* Quiz Results Screen */
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-5 animate-fade-in">
                  <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center border ${
                    quizScore >= 7 
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                      : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  }`}>
                    {quizScore >= 7 ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-white">
                      {quizScore >= 7 ? 'Mastery Confirmed!' : 'Keep Practicing!'}
                    </h3>
                    <p className="text-sm text-slate-300 mt-1">
                      You scored <strong className="text-white text-lg font-mono">{quizScore} / 10</strong> ({quizScore * 10}%)
                    </p>
                    <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
                      {quizScore >= 7 
                        ? 'Great job! You met the 70% threshold. Topic has been recorded in your timetable.' 
                        : 'Review the explanations below, then replay the video to master the core principles.'}
                    </p>
                  </div>

                  {/* Answers review list */}
                  <div className="text-left space-y-3 pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detailed Answer Review</h4>
                    {videoData?.quiz?.map((q, qIdx) => {
                      const selected = userAnswers[qIdx];
                      const isCorrect = selected === q.correct_index;
                      return (
                        <div key={qIdx} className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                          isCorrect ? 'bg-emerald-950/30 border-emerald-900/60' : 'bg-rose-950/30 border-rose-900/60'
                        }`}>
                          <div className="font-semibold text-slate-200">
                            {qIdx + 1}. {q.question}
                          </div>
                          <div className="text-slate-300">
                            Correct: <strong className="text-emerald-400">{q.options[q.correct_index]}</strong>
                            {!isCorrect && selected !== undefined && (
                              <span className="text-rose-400 ml-2">(Your answer: {q.options[selected]})</span>
                            )}
                          </div>
                          <p className="text-slate-400 italic text-[11px] mt-1">
                            💡 {q.explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setUserAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      Re-take Quiz
                    </button>
                    <button
                      onClick={() => {
                        stopSpeech();
                        onClose();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white shadow-md transition-colors cursor-pointer"
                    >
                      Done & Return
                    </button>
                  </div>
                </div>
              ) : (
                /* Question-by-Question Form */
                <div className="space-y-4">
                  {videoData?.quiz?.map((q, qIdx) => (
                    <div key={qIdx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-bold text-indigo-400 uppercase tracking-wider">Question {qIdx + 1} of 10</span>
                        <span>{userAnswers[qIdx] !== undefined ? '✓ Answered' : 'Pending'}</span>
                      </div>
                      <p className="text-sm font-semibold text-white leading-snug">
                        {q.question}
                      </p>

                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = userAnswers[qIdx] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectAnswer(qIdx, oIdx)}
                              className={`text-left p-3 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer flex items-center space-x-3 ${
                                isSelected
                                  ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-xs'
                                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
                              }`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 pb-6 flex justify-end">
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(userAnswers).length < (videoData?.quiz?.length || 10) || submittingQuiz}
                      className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:hover:bg-teal-600 text-white text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer flex items-center space-x-2"
                    >
                      <span>{submittingQuiz ? 'Evaluating...' : 'Submit 10-Question Quiz'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Interactive Video Slideshow Screen */
            <div className="space-y-4 max-w-3xl mx-auto py-2">
              {currentSlide && (
                <div className={`border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden transition-all ${
                  isCartoonStyle
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 border-amber-500/30'
                    : 'bg-slate-900 border-slate-800'
                }`}>
                  
                  {/* Slide Title & Visual Mascot Bar */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[11px] font-black uppercase tracking-wider ${
                          isCartoonStyle ? 'text-amber-400' : 'text-teal-400'
                        }`}>
                          Slide {currentSlideIndex + 1} of {totalSlides}
                        </span>
                        {isCartoonStyle && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Fun Story Mode
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {currentSlide.title}
                      </h3>
                    </div>
                    
                    {/* TTS Voice Status Icon */}
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        isMuted 
                          ? 'bg-slate-800 border-slate-700 text-slate-400' 
                          : isCartoonStyle
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                      }`}
                      title={isMuted ? 'Unmute Audio Narration' : 'Mute Audio Narration'}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
                    </button>
                  </div>

                  {/* Bullet Points */}
                  <div className="space-y-3">
                    {currentSlide.bullet_points?.map((pt, idx) => (
                      <div key={idx} className={`flex items-start space-x-3 p-3 rounded-2xl border text-xs sm:text-sm ${
                        isCartoonStyle
                          ? 'bg-slate-800/50 border-amber-500/20 text-amber-50'
                          : 'bg-slate-950/40 border-slate-800/70 text-slate-200'
                      }`}>
                        <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                          isCartoonStyle ? 'bg-amber-400 shadow-amber-400/50 shadow-sm' : 'bg-teal-400'
                        }`} />
                        <span className="leading-relaxed font-medium">{pt}</span>
                      </div>
                    ))}
                  </div>

                  {/* Formula / Rule Box */}
                  {currentSlide.equation_or_rule && (
                    <div className={`p-3.5 sm:p-4 rounded-2xl border font-mono text-xs sm:text-sm flex items-center space-x-3 ${
                      isCartoonStyle
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                        : 'bg-slate-950/80 border-teal-500/30 text-teal-200'
                    }`}>
                      <BookOpen className={`w-4 h-4 shrink-0 ${isCartoonStyle ? 'text-amber-400' : 'text-teal-400'}`} />
                      <span>{currentSlide.equation_or_rule}</span>
                    </div>
                  )}

                  {/* Mermaid Diagram if present */}
                  {currentSlide.diagram_mermaid && (
                    <div className="mt-4 pt-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        {isCartoonStyle ? 'Adventure Map' : 'Visual Concept Architecture'}
                      </div>
                      <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800">
                        <MermaidRenderer chart={currentSlide.diagram_mermaid} />
                      </div>
                    </div>
                  )}

                  {/* Narration Script Subtitle Box */}
                  <div className={`border rounded-2xl p-3.5 sm:p-4 text-xs flex items-start space-x-3 ${
                    isCartoonStyle 
                      ? 'bg-amber-950/20 border-amber-500/30 text-amber-100'
                      : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
                  }`}>
                    <Volume2 className={`w-4 h-4 shrink-0 mt-0.5 ${isCartoonStyle ? 'text-amber-400' : 'text-teal-400'}`} />
                    <p className="italic leading-relaxed font-sans">
                      "{currentSlide.narration_script}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Video Player Control Bar (Visible in Slide Mode) */}
        {!isQuizMode && (
          <div className="px-5 py-3.5 bg-slate-900 border-t border-slate-800/80 shrink-0 space-y-2.5">
            {/* Draggable Seek Bar & Time Display */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 px-0.5">
                <span className="text-teal-400">{formatTime(currentTime)}</span>
                <span className="text-slate-500">/ {formatTime(totalDurationSeconds)}</span>
              </div>
              
              <div className="relative flex items-center group">
                <input
                  type="range"
                  min={0}
                  max={totalDurationSeconds}
                  step={0.5}
                  value={currentTime}
                  onMouseDown={() => setIsDraggingSlider(true)}
                  onTouchStart={() => setIsDraggingSlider(true)}
                  onChange={(e) => {
                    const target = parseFloat(e.target.value);
                    setCurrentTime(target);
                  }}
                  onMouseUp={(e) => {
                    setIsDraggingSlider(false);
                    const target = parseFloat((e.target as HTMLInputElement).value);
                    seekToTime(target);
                  }}
                  onTouchEnd={(e) => {
                    setIsDraggingSlider(false);
                    const target = parseFloat((e.target as HTMLInputElement).value);
                    seekToTime(target);
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 hover:accent-teal-300 focus:outline-hidden"
                  style={{
                    background: `linear-gradient(to right, ${isCartoonStyle ? '#f59e0b' : '#14b8a6'} 0%, ${isCartoonStyle ? '#f59e0b' : '#14b8a6'} ${progressPercent}%, #334155 ${progressPercent}%, #334155 100%)`
                  }}
                  title="Drag to seek to any point in the concept video"
                />
              </div>
            </div>

            {/* Main Video Controls Bar */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                {/* Previous Slide */}
                <button
                  onClick={prevSlide}
                  disabled={currentSlideIndex === 0 && currentTime <= 2}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors cursor-pointer"
                  title="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* -10s Skip Backward */}
                <button
                  onClick={handleSkipBackward}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold font-mono transition-colors cursor-pointer flex items-center gap-1"
                  title="Skip Backward 10 Seconds"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>-10s</span>
                </button>

                {/* Play / Pause Primary Button */}
                <button
                  onClick={togglePlay}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 shadow-md transition-all cursor-pointer ${
                    isCartoonStyle
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                      : 'bg-teal-600 hover:bg-teal-500 text-white'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>{currentTime === 0 ? 'Play Video' : 'Resume'}</span>
                    </>
                  )}
                </button>

                {/* +10s Skip Forward */}
                <button
                  onClick={handleSkipForward}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold font-mono transition-colors cursor-pointer flex items-center gap-1"
                  title="Skip Forward 10 Seconds"
                >
                  <span>+10s</span>
                  <RotateCcw className="w-3.5 h-3.5 rotate-180" />
                </button>

                {/* Restart Slide Narration */}
                <button
                  onClick={() => {
                    if (currentSlide) speakCurrentSlide(currentSlide);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer hidden sm:block"
                  title="Replay Audio"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                {currentSlideIndex < totalSlides - 1 ? (
                  <button
                    onClick={advanceSlide}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <span>Next Slide</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleStartQuiz}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg transition-colors cursor-pointer animate-pulse"
                  >
                    <span>Start 10-Q Quiz</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
