import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api, setToken, clearToken, User, TodayScheduleResponse, ReplanResponse } from './api/client';
import { safeStorage } from './utils/safeStorage';
import { Navbar } from './components/Navbar';
import { TodayView } from './components/TodayView';
import { ScheduleView } from './components/ScheduleView';
import { DashboardView } from './components/DashboardView';
import { DeferredTopics } from './components/DeferredTopics';
import { ReplanHistory } from './components/ReplanHistory';
import { OnboardingWizard } from './components/OnboardingWizard';
import { ReplanModal } from './components/ReplanModal';
import { QuizModal } from './components/QuizModal';
import { AuthModal } from './components/AuthModal';
import { InstallModal } from './components/InstallModal';
import { InstallBanner } from './components/InstallBanner';
import { PYQBankView } from './components/PYQBankView';
import { ShortNotesView } from './components/ShortNotesView';
import { DoubtBotModal } from './components/DoubtBotModal';
import { DoubtBotFloating } from './components/DoubtBotFloating';
import { OfflineBanner } from './components/OfflineBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useNavigationStack } from './hooks/useNavigationStack';
import { ProfilePhotoModal } from './components/ProfilePhotoModal';
import { ConceptVideoModal } from './components/ConceptVideoModal';
import { ActivityHistoryView } from './components/ActivityHistoryView';
import { SelfTimetableView } from './components/SelfTimetableView';
import { Sparkles, Calendar, BookOpen, Compass, AlertCircle, RotateCcw } from 'lucide-react';

export function App() {
  // Optimistic state hydration from safeStorage for 0ms launch time
  const [user, setUser] = useState<User | null>(() => safeStorage.getJSON<User>('pivott_cached_user'));
  const [authLoading, setAuthLoading] = useState<boolean>(() => {
    // If we have both cached user and token, don't show blocking loading screen
    const hasToken = !!safeStorage.getItem('pivott_token');
    const hasCachedUser = !!safeStorage.getJSON<User>('pivott_cached_user');
    return !(hasToken && hasCachedUser);
  });
  const [authTimeoutTriggered, setAuthTimeoutTriggered] = useState(false);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'today' | 'schedule' | 'dashboard' | 'notes' | 'pyq' | 'deferred' | 'history' | 'activity' | 'self-timetable'>('today');
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [todayData, setTodayData] = useState<TodayScheduleResponse | null>(() => safeStorage.getJSON<TodayScheduleResponse>('pivott_cached_today'));
  const [todayLoading, setTodayLoading] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Profile photo modal state
  const [isProfilePhotoOpen, setIsProfilePhotoOpen] = useState(false);

  // Concept video modal state
  const [conceptVideoState, setConceptVideoState] = useState<{
    isOpen: boolean;
    topicId: string;
    topicName: string;
    subjectName: string;
  }>({
    isOpen: false,
    topicId: '',
    topicName: '',
    subjectName: ''
  });

  // AI Doubt Bot state
  const [isDoubtBotOpen, setIsDoubtBotOpen] = useState(false);
  const [doubtBotContext, setDoubtBotContext] = useState<{
    doubt?: string;
    topic?: string;
    subject?: string;
    exam?: string;
  } | undefined>(undefined);

  const handleOpenDoubtBot = (context?: { doubt?: string; topic?: string; subject?: string; exam?: string }) => {
    setDoubtBotContext(context);
    setIsDoubtBotOpen(true);
  };
  
  const { isInstalled, hasNativePrompt, isIOS, promptInstall } = usePWAInstall();
  
  // Replan states
  const [isReplanning, setIsReplanning] = useState(false);
  const [replanData, setReplanData] = useState<ReplanResponse | null>(null);
  const [isReplanModalOpen, setIsReplanModalOpen] = useState(false);

  // Quiz modal state
  const [quizState, setQuizState] = useState<{
    isOpen: boolean;
    topicId: string;
    topicName: string;
    subjectName: string;
  }>({
    isOpen: false,
    topicId: '',
    topicName: '',
    subjectName: ''
  });

  // Back Navigation & Modal Stack Manager
  const openModals = [
    ...(isProfilePhotoOpen ? [{ name: 'profilePhoto', close: () => setIsProfilePhotoOpen(false) }] : []),
    ...(conceptVideoState.isOpen ? [{ name: 'conceptVideo', close: () => setConceptVideoState(prev => ({ ...prev, isOpen: false })) }] : []),
    ...(isDoubtBotOpen ? [{ name: 'doubtBot', close: () => setIsDoubtBotOpen(false) }] : []),
    ...(isReplanModalOpen ? [{ name: 'replanModal', close: () => setIsReplanModalOpen(false) }] : []),
    ...(quizState.isOpen ? [{ name: 'quizModal', close: () => setQuizState(prev => ({ ...prev, isOpen: false })) }] : []),
    ...(isInstallModalOpen ? [{ name: 'installModal', close: () => setIsInstallModalOpen(false) }] : []),
  ];

  const { exitToastVisible } = useNavigationStack({
    activeTab,
    setActiveTab,
    openModals,
    rootTab: 'today'
  });

  const [hasExplicitlyLoggedOut, setHasExplicitlyLoggedOut] = useState(false);
  const lastActiveDateRef = useRef<string>(new Date().toISOString().split('T')[0]);

  // Keep safeStorage in sync with active user
  const updateUser = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      safeStorage.setJSON('pivott_cached_user', newUser);
    } else {
      safeStorage.removeItem('pivott_cached_user');
    }
  }, []);

  // Keep safeStorage in sync with today's schedule
  const updateTodayData = useCallback((newData: TodayScheduleResponse | null) => {
    setTodayData(newData);
    if (newData) {
      safeStorage.setJSON('pivott_cached_today', newData);
    } else {
      safeStorage.removeItem('pivott_cached_today');
    }
  }, []);

  // Fetch today's schedule
  const fetchToday = useCallback(async () => {
    if (!user) return;
    setTodayLoading(true);
    try {
      const data = await api.getTodaySchedule();
      updateTodayData(data);
      // If planned items is empty and total topics is 0, offer onboarding
      if (!data.planned_items || (data.planned_items.length === 0 && !data.total_allocated_minutes)) {
        const allSched = await api.getAllSchedule();
        if (!allSched.days || allSched.days.length === 0) {
          setIsOnboarding(true);
        }
      }
    } catch (err) {
      console.warn('[Pivott] Failed to fetch fresh today schedule (using cached if available):', err);
    } finally {
      setTodayLoading(false);
    }
  }, [user, updateTodayData]);

  // Initial Auth Loader with 4s hard fallback timeout
  const initAuth = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const autoLoginRequested = urlParams.get('auto_login') === '1' || window.location.hash.includes('auto_login');

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }

    setAuthTimeoutTriggered(false);

    // Safety timeout: Never leave the user stuck on loading spinner for more than 4 seconds
    const safetyTimer = setTimeout(() => {
      setAuthLoading((current) => {
        if (current) {
          setAuthTimeoutTriggered(true);
          return false;
        }
        return current;
      });
    }, 4000);

    api.me()
      .then(res => {
        clearTimeout(safetyTimer);
        updateUser(res.user);
        setAuthLoading(false);
        setSessionExpiredNotice(null);
      })
      .catch(async () => {
        clearTimeout(safetyTimer);
        // If user explicitly clicked logout, only skip auto-login if NOT explicitly requested via QR code
        if (hasExplicitlyLoggedOut && !autoLoginRequested && !tokenFromUrl) {
          updateUser(null);
          setAuthLoading(false);
          return;
        }

        // Automatic seamless login with default student demo account
        try {
          const res = await api.login({ email: 'student@pivott.app', password: 'password123' });
          setToken(res.token);
          updateUser(res.user);
        } catch {
          // If offline or login fails, retain cached user if present
          if (!safeStorage.getJSON('pivott_cached_user')) {
            updateUser(null);
          }
        } finally {
          setAuthLoading(false);
        }
      });
  }, [hasExplicitlyLoggedOut, updateUser]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Re-fetch today when user changes
  useEffect(() => {
    if (user) {
      fetchToday();
    }
  }, [user, fetchToday]);

  // App Lifecycle Management: Android/iOS Background resume & Date rollover
  useEffect(() => {
    const handleResume = () => {
      if (document.visibilityState === 'visible') {
        const currentDate = new Date().toISOString().split('T')[0];
        console.log('[Pivott Lifecycle] App resumed to foreground. Date check:', {
          last: lastActiveDateRef.current,
          current: currentDate
        });

        // Date rolled over to a new day (e.g. overnight sleep)
        if (lastActiveDateRef.current !== currentDate) {
          lastActiveDateRef.current = currentDate;
          console.log('[Pivott Lifecycle] Day rolled over. Refreshing daily schedule...');
          fetchToday();
        } else if (user) {
          // Re-validate schedule in background
          fetchToday();
        }
      }
    };

    const handleAuthExpired = () => {
      console.warn('[Pivott] Auth session expired event received.');
      clearToken();
      updateUser(null);
      setSessionExpiredNotice('Your session has expired. Please log in again to continue.');
    };

    document.addEventListener('visibilitychange', handleResume);
    window.addEventListener('focus', handleResume);
    window.addEventListener('pivott:auth-expired', handleAuthExpired);

    return () => {
      document.removeEventListener('visibilitychange', handleResume);
      window.removeEventListener('focus', handleResume);
      window.removeEventListener('pivott:auth-expired', handleAuthExpired);
    };
  }, [fetchToday, user, updateUser]);

  // Mark progress handler
  const handleMarkProgress = async (topicId: string, status: string, minutesDone: number) => {
    if (!todayData) return;
    try {
      await api.markProgress({
        date: todayData.date,
        topic_id: topicId,
        status,
        minutes_done: minutesDone
      });
      await fetchToday();
    } catch (err: any) {
      alert(err.message || 'Failed to update progress.');
    }
  };

  // Trigger Replan
  const handleTriggerReplan = async () => {
    setIsReplanning(true);
    try {
      const res = await api.replan({
        reason: todayData?.has_backlog ? 'Backlog recovery re-adjustment' : 'Manual timetable re-balancing'
      });
      setReplanData(res);
      setIsReplanModalOpen(true);
      await fetchToday();
    } catch (err: any) {
      alert(err.message || 'Failed to recalculate schedule.');
    } finally {
      setIsReplanning(false);
    }
  };

  // Open Quiz
  const handleOpenQuiz = (topicId: string, topicName: string, subjectName: string) => {
    setQuizState({
      isOpen: true,
      topicId,
      topicName,
      subjectName
    });
  };

  const handleLogout = () => {
    clearToken();
    setHasExplicitlyLoggedOut(true);
    updateUser(null);
    updateTodayData(null);
  };

  // Days to exam calculation
  const getDaysToExam = () => {
    if (!user || !user.exam_date) return 0;
    const diff = new Date(user.exam_date).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Fallback Loading Screen with 4-second Timeout Guard
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-teal-500/20">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 tracking-wider uppercase">Loading Pivott...</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Initializing syllabus engine & schedule</p>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Auth Modal
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 relative">
        <OfflineBanner />

        {sessionExpiredNotice && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-medium flex items-center space-x-2 shadow-sm max-w-md w-full animate-fade-in">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{sessionExpiredNotice}</span>
          </div>
        )}

        {authTimeoutTriggered && (
          <div className="mb-4 p-3 rounded-2xl bg-slate-800 text-slate-200 text-xs flex items-center justify-between shadow-md max-w-md w-full animate-fade-in">
            <span>Server took longer than usual to connect.</span>
            <button
              onClick={() => {
                setAuthLoading(true);
                initAuth();
              }}
              className="px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        <AuthModal
          onSuccess={(u) => {
            setHasExplicitlyLoggedOut(false);
            setSessionExpiredNotice(null);
            updateUser(u);
            fetchToday();
          }}
        />
        <InstallBanner
          isInstalled={isInstalled}
          onOpenModal={() => setIsInstallModalOpen(true)}
        />
        <InstallModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
          hasNativePrompt={hasNativePrompt}
          isIOS={isIOS}
          onNativeInstall={promptInstall}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Offline & Update Banner */}
      <OfflineBanner />

      {/* Navigation */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        daysToExam={getDaysToExam()}
        todayMinutes={todayData?.total_allocated_minutes || 0}
        maxDailyHours={user.max_daily_hours || 6.0}
        onLogout={handleLogout}
        onReOnboard={() => setIsOnboarding(true)}
        isInstalled={isInstalled}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenDoubtBot={() => handleOpenDoubtBot()}
        onOpenProfilePhoto={() => setIsProfilePhotoOpen(true)}
      />

      {/* Main Content Area Protected by Section ErrorBoundary */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 sm:pb-8">
        <ErrorBoundary level="section" onReset={() => setActiveTab('today')}>
          {isOnboarding ? (
            <div className="relative">
              <div className="mb-4 flex justify-between items-center max-w-3xl mx-auto">
                <button
                  type="button"
                  onClick={() => setIsOnboarding(false)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 hover:text-slate-900 font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <span>← Return to Today's Dashboard</span>
                </button>
              </div>
              <OnboardingWizard
                onCompleted={() => {
                  setIsOnboarding(false);
                  fetchToday();
                }}
              />
            </div>
          ) : (
            <>
              {activeTab === 'today' && (
                <TodayView
                  todayData={todayData}
                  loading={todayLoading}
                  onMarkProgress={handleMarkProgress}
                  onOpenQuiz={handleOpenQuiz}
                  onReplan={handleTriggerReplan}
                  isReplanning={isReplanning}
                  onNavigateToPYQ={() => setActiveTab('pyq')}
                  onOpenDoubtBot={(ctx) => handleOpenDoubtBot(ctx)}
                  onOpenConceptVideo={(id, name, subject) => setConceptVideoState({ isOpen: true, topicId: id, topicName: name, subjectName: subject })}
                  onNavigateToNotes={() => setActiveTab('notes')}
                />
              )}

              {activeTab === 'schedule' && (
                <ScheduleView
                  maxDailyHours={user.max_daily_hours || 6.0}
                  onOpenQuiz={handleOpenQuiz}
                  onNavigateToPYQ={() => setActiveTab('pyq')}
                  onOpenDoubtBot={(ctx) => handleOpenDoubtBot(ctx)}
                />
              )}

              {activeTab === 'notes' && (
                <ShortNotesView
                  initialExamKey={user.exam_course || user.exam_name}
                  onOpenDoubtBot={(ctx) => handleOpenDoubtBot(ctx)}
                />
              )}

              {activeTab === 'pyq' && (
                <PYQBankView
                  initialExamKey={user.exam_name}
                  onOpenDoubtBot={(ctx) => handleOpenDoubtBot(ctx)}
                />
              )}

              {activeTab === 'dashboard' && (
                <DashboardView />
              )}

              {activeTab === 'deferred' && (
                <DeferredTopics
                  onReplanCompleted={fetchToday}
                />
              )}

              {activeTab === 'history' && (
                <ReplanHistory />
              )}

              {activeTab === 'activity' && (
                <ActivityHistoryView
                  user={user}
                  onNavigateToTab={(tab) => setActiveTab(tab as any)}
                />
              )}

              {activeTab === 'self-timetable' && (
                <SelfTimetableView
                  onBackToAccount={() => setActiveTab('today')}
                />
              )}
            </>
          )}
        </ErrorBoundary>
      </main>

      {/* Floating AI Doubt Bot Launcher */}
      <DoubtBotFloating onOpen={() => handleOpenDoubtBot()} />

      {/* AI Doubt Bot Modal */}
      <DoubtBotModal
        isOpen={isDoubtBotOpen}
        onClose={() => setIsDoubtBotOpen(false)}
        initialContext={doubtBotContext}
        userExam={user?.exam_name}
      />

      {/* Re-Plan Diff Summary Modal */}
      <ReplanModal
        isOpen={isReplanModalOpen}
        onClose={() => setIsReplanModalOpen(false)}
        replanData={replanData}
      />

      {/* Interactive MCQ Quiz Modal */}
      <QuizModal
        isOpen={quizState.isOpen}
        onClose={() => setQuizState(prev => ({ ...prev, isOpen: false }))}
        topicId={quizState.topicId}
        topicName={quizState.topicName}
        subjectName={quizState.subjectName}
        onQuizCompleted={() => {
          fetchToday();
        }}
      />

      {/* Floating Install Banner for Mobile & Desktop */}
      <InstallBanner
        isInstalled={isInstalled}
        onOpenModal={() => setIsInstallModalOpen(true)}
      />

      {/* PWA Native Installation Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        hasNativePrompt={hasNativePrompt}
        isIOS={isIOS}
        onNativeInstall={promptInstall}
      />

      {/* Profile Photo Upload & Preset Avatar Modal (Feature 5) */}
      {isProfilePhotoOpen && (
        <ProfilePhotoModal
          isOpen={isProfilePhotoOpen}
          onClose={() => setIsProfilePhotoOpen(false)}
          user={user}
          onUserUpdated={(updatedUser: User) => updateUser(updatedUser)}
        />
      )}

      {/* Interactive Concept Video & Post-Video Quiz Modal (Feature 8) */}
      <ConceptVideoModal
        isOpen={conceptVideoState.isOpen}
        onClose={() => setConceptVideoState(prev => ({ ...prev, isOpen: false }))}
        topicId={conceptVideoState.topicId}
        topicName={conceptVideoState.topicName}
        subjectName={conceptVideoState.subjectName}
        onCompleted={() => fetchToday()}
      />

      {/* Android/PWA In-App Double Back Exit Toast (Feature 3) */}
      {exitToastVisible && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/90 text-white text-xs font-semibold shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-center space-x-2 animate-bounce">
          <span>Press back again to exit Pivott</span>
        </div>
      )}
    </div>
  );
}

export default App;
