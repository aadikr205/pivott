import { useEffect, useRef, useState, useCallback } from 'react';

interface NavigationStackProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  openModals: {
    name: string;
    close: () => void;
  }[];
  rootTab?: string;
}

export function useNavigationStack({
  activeTab,
  setActiveTab,
  openModals,
  rootTab = 'today'
}: NavigationStackProps) {
  const [exitToastVisible, setExitToastVisible] = useState(false);
  const lastBackPressRef = useRef<number>(0);
  const tabHistoryRef = useRef<string[]>([rootTab]);
  const isNavigatingBackRef = useRef<boolean>(false);
  const exitToastTimerRef = useRef<any>(null);

  // Keep tab history up to date
  useEffect(() => {
    const history = tabHistoryRef.current;
    if (history[history.length - 1] !== activeTab) {
      if (!isNavigatingBackRef.current) {
        history.push(activeTab);
        // Push history state to browser
        try {
          window.history.pushState({ pivottTab: activeTab }, '', window.location.href);
        } catch (e) {}
      }
      isNavigatingBackRef.current = false;
    }
  }, [activeTab]);

  // Handle back button / popstate
  useEffect(() => {
    // Push initial baseline state so the very first back press triggers popstate
    try {
      if (!window.history.state?.pivottInitial) {
        window.history.replaceState({ pivottInitial: true, pivottTab: rootTab }, '', window.location.href);
        window.history.pushState({ pivottTab: activeTab }, '', window.location.href);
      }
    } catch (e) {}

    const handlePopState = (event: PopStateEvent) => {
      // 1. If any modal is currently open, close the topmost modal first
      if (openModals.length > 0) {
        const topModal = openModals[openModals.length - 1];
        topModal.close();
        // Keep history stack intact by pushing back the current tab state
        try {
          window.history.pushState({ pivottTab: activeTab }, '', window.location.href);
        } catch (e) {}
        return;
      }

      // 2. If we are on a secondary screen and have history, go back to previous tab
      const history = tabHistoryRef.current;
      if (history.length > 1) {
        history.pop(); // remove current
        const prevTab = history[history.length - 1] || rootTab;
        isNavigatingBackRef.current = true;
        setActiveTab(prevTab);
        return;
      }

      // 3. We are at root screen ('today') with no open modals -> Double back to exit
      const now = Date.now();
      if (now - lastBackPressRef.current < 2500) {
        // User confirmed exit within 2.5s — let browser exit / back
        setExitToastVisible(false);
        return;
      }

      // First back press at root: Intercept, show toast, and restore state
      lastBackPressRef.current = now;
      setExitToastVisible(true);
      if (exitToastTimerRef.current) clearTimeout(exitToastTimerRef.current);
      exitToastTimerRef.current = setTimeout(() => {
        setExitToastVisible(false);
      }, 2500);

      try {
        window.history.pushState({ pivottTab: rootTab }, '', window.location.href);
      } catch (e) {}
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (exitToastTimerRef.current) clearTimeout(exitToastTimerRef.current);
    };
  }, [openModals, activeTab, setActiveTab, rootTab]);

  return {
    exitToastVisible
  };
}
