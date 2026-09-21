import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Send,
  Square,
  Copy,
  Check,
  RotateCcw,
  Edit3,
  Search,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Bot,
  User as UserIcon,
  AlertCircle,
  HelpCircle,
  Clock,
  CheckCircle2,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { api, ChatSession, ChatMessage } from '../api/client';
import { MarkdownKatexRenderer } from './MarkdownKatexRenderer';

export const TARGET_EXAM_OPTIONS = [
  'NEET (UG)',
  'JEE Main/Advanced',
  'CBSE Class 12',
  'CBSE Class 10',
  'International Science Olympiad (ISO)',
  'International Maths Olympiad (IMO)',
  'English International Olympiad (EIO)',
  'General Knowledge International Olympiad (GKIO)',
  'International Computer Olympiad (ICO)',
  'International Drawing Olympiad (IDO)',
  'National Essay Olympiad (NESO)',
  'National Social Studies Olympiad (NSSO)',
  'UPSC CSE',
  'State Board',
  'CAT',
  'Banking (SBI/IBPS)',
  'SSC CGL / CHSL',
  'GATE',
  'Other / General'
];

interface DoubtSolverViewProps {
  initialExam?: string;
  initialContext?: {
    doubt?: string;
    topic?: string;
    subject?: string;
    exam?: string;
  };
  onClose?: () => void;
  isModal?: boolean;
}

export const DoubtSolverView: React.FC<DoubtSolverViewProps> = ({
  initialExam = 'NEET (UG)',
  initialContext,
  onClose,
  isModal = true
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>(initialExam);
  const [customExamInput, setCustomExamInput] = useState<string>('');
  const [isCustomExam, setIsCustomExam] = useState(false);

  const [inputQuery, setInputQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renamingTitle, setRenamingTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isUserScrolledUp = useRef(false);

  // Initialize selected exam from prop
  useEffect(() => {
    if (initialExam) {
      const matched = TARGET_EXAM_OPTIONS.find(
        opt => opt.toLowerCase() === initialExam.toLowerCase() || initialExam.toLowerCase().includes(opt.toLowerCase().slice(0, 4))
      );
      if (matched) {
        setSelectedExam(matched);
        setIsCustomExam(false);
      } else {
        setSelectedExam('Other / General');
        setIsCustomExam(true);
        setCustomExamInput(initialExam);
      }
    }
  }, [initialExam]);

  // Load user sessions on mount
  const loadSessions = useCallback(async () => {
    try {
      const res = await api.doubtSolver.getSessions();
      setSessions(res.sessions || []);
      return res.sessions || [];
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    loadSessions().then(loaded => {
      // If initialContext provided, start new chat with that doubt
      if (initialContext?.doubt) {
        handleNewChat(initialContext.doubt, initialContext.exam || selectedExam);
      } else if (loaded.length > 0 && !activeSessionId) {
        // Open most recent session
        selectSession(loaded[0].id);
      } else if (loaded.length === 0 && !activeSessionId) {
        handleNewChat();
      }
    });
  }, []);

  // Select active session & load messages
  const selectSession = async (sessionId: string) => {
    try {
      setActiveSessionId(sessionId);
      setErrorMessage(null);
      setStreamingText('');
      setIsStreaming(false);
      setIsThinking(false);

      const res = await api.doubtSolver.getSession(sessionId);
      setActiveSession(res.session);
      setMessages(res.messages || []);

      if (res.session.target_exam) {
        if (TARGET_EXAM_OPTIONS.includes(res.session.target_exam)) {
          setSelectedExam(res.session.target_exam);
          setIsCustomExam(false);
        } else {
          setSelectedExam('Other / General');
          setIsCustomExam(true);
          setCustomExamInput(res.session.target_exam);
        }
      }

      // Close mobile sidebar
      setIsSidebarOpen(false);
    } catch (err) {
      console.error('Failed to load session details:', err);
      setErrorMessage('Could not load chat session history.');
    }
  };

  // Start New Chat
  const handleNewChat = async (presetDoubt?: string, examOverride?: string) => {
    try {
      const currentExam = isCustomExam && customExamInput.trim() ? customExamInput.trim() : selectedExam;
      const finalExam = examOverride || currentExam || 'NEET (UG)';

      const res = await api.doubtSolver.createSession(finalExam, 'New Doubt Discussion');
      const newSession = res.session;

      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setActiveSession(newSession);
      setMessages([]);
      setStreamingText('');
      setErrorMessage(null);
      setIsSidebarOpen(false);

      if (presetDoubt) {
        setInputQuery(presetDoubt);
        // auto-send next tick
        setTimeout(() => {
          handleSendMessage(presetDoubt, newSession.id, finalExam);
        }, 100);
      } else {
        setTimeout(() => textareaRef.current?.focus(), 150);
      }
    } catch (err) {
      console.error('Failed to create new chat session:', err);
      setErrorMessage('Failed to start a new chat session.');
    }
  };

  // Rename session handlers
  const handleStartRename = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setRenamingSessionId(session.id);
    setRenamingTitle(session.title || 'Untitled Discussion');
  };

  const handleSaveRename = async (sessionId: string) => {
    const trimmed = renamingTitle.trim();
    if (!trimmed) {
      setRenamingSessionId(null);
      return;
    }
    try {
      await api.chat.renameSession(sessionId, trimmed);
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: trimmed } : s));
      if (activeSessionId === sessionId) {
        setActiveSession(prev => prev ? { ...prev, title: trimmed } : null);
      }
    } catch (err) {
      console.error('Failed to rename session:', err);
    } finally {
      setRenamingSessionId(null);
    }
  };

  // Delete session
  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat session?')) return;

    try {
      await api.doubtSolver.deleteSession(sessionId);
      const remaining = sessions.filter(s => s.id !== sessionId);
      setSessions(remaining);

      if (activeSessionId === sessionId) {
        if (remaining.length > 0) {
          selectSession(remaining[0].id);
        } else {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
      alert('Failed to delete chat session.');
    }
  };

  // Target exam change
  const handleExamChange = async (newExam: string) => {
    setSelectedExam(newExam);
    if (newExam === 'Other / General') {
      setIsCustomExam(true);
    } else {
      setIsCustomExam(false);
      if (activeSessionId) {
        try {
          const res = await api.doubtSolver.updateSession(activeSessionId, { target_exam: newExam });
          setActiveSession(res.session);
          setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, target_exam: newExam } : s));
        } catch (err) {
          console.error('Failed to update session exam:', err);
        }
      }
    }
  };

  const handleCustomExamBlur = async () => {
    const trimmed = customExamInput.trim();
    if (trimmed && activeSessionId) {
      try {
        const res = await api.doubtSolver.updateSession(activeSessionId, { target_exam: trimmed });
        setActiveSession(res.session);
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, target_exam: trimmed } : s));
      } catch (err) {
        console.error('Failed to update custom exam:', err);
      }
    }
  };

  // Smart auto-scroll
  const scrollToBottom = (force = false) => {
    if (force || !isUserScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    // If scrolled more than 100px from bottom, consider user scrolled up
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 120;
    isUserScrolledUp.current = !isAtBottom;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, isThinking]);

  // Send Message
  const handleSendMessage = async (textToSend?: string, sessionIdOverride?: string, examOverride?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputQuery).trim();
    if (!text || isStreaming) return;

    const targetSessionId = sessionIdOverride || activeSessionId;
    if (!targetSessionId) {
      await handleNewChat(text);
      return;
    }

    const currentExam = examOverride || (isCustomExam && customExamInput.trim() ? customExamInput.trim() : selectedExam);

    // Append optimistic user message
    const tempUserMsg: ChatMessage = {
      id: `user-temp-${Date.now()}`,
      session_id: targetSessionId,
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setInputQuery('');
    setErrorMessage(null);
    setIsThinking(true);
    setIsStreaming(true);
    setStreamingText('');
    isUserScrolledUp.current = false;

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let accumulated = '';

    await api.doubtSolver.streamMessage(
      targetSessionId,
      text,
      currentExam,
      {
        signal: abortController.signal,
        onChunk: (chunk) => {
          setIsThinking(false);
          accumulated += chunk;
          setStreamingText(accumulated);
        },
        onDone: (assistantMsg, newTitle) => {
          setIsStreaming(false);
          setIsThinking(false);
          setStreamingText('');
          setMessages(prev => [...prev, assistantMsg]);

          if (newTitle) {
            setActiveSession(prev => prev ? { ...prev, title: newTitle } : null);
            setSessions(prev => prev.map(s => s.id === targetSessionId ? { ...s, title: newTitle, last_preview: assistantMsg.content } : s));
          }
        },
        onError: (err) => {
          setIsStreaming(false);
          setIsThinking(false);
          console.error('Stream error:', err);
          if (accumulated.length > 0) {
            // Save whatever partial response arrived
            const partialMsg: ChatMessage = {
              id: `partial-${Date.now()}`,
              session_id: targetSessionId,
              role: 'assistant',
              content: accumulated + '\n\n*(Response interrupted — tap retry to resend)*',
              created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, partialMsg]);
          }
          setErrorMessage('Something went wrong generating this answer. Please tap retry.');
        }
      }
    );
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsThinking(false);
    if (streamingText.trim()) {
      const stoppedMsg: ChatMessage = {
        id: `stopped-${Date.now()}`,
        session_id: activeSessionId || '',
        role: 'assistant',
        content: streamingText + ' ⏹️ *(Stopped)*',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, stoppedMsg]);
      setStreamingText('');
    }
  };

  // Regenerate last assistant response
  const handleRegenerate = async () => {
    if (messages.length === 0 || isStreaming) return;
    if (!activeSessionId) return;

    // Remove last assistant message optimistically
    if (messages[messages.length - 1].role === 'assistant') {
      setMessages(prev => prev.slice(0, -1));
    }

    setErrorMessage(null);
    setIsThinking(true);
    setIsStreaming(true);
    setStreamingText('');
    isUserScrolledUp.current = false;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    let accumulated = '';

    await api.chat.regenerate(activeSessionId, {
      signal: abortController.signal,
      onChunk: (chunk) => {
        setIsThinking(false);
        accumulated += chunk;
        setStreamingText(accumulated);
      },
      onDone: (assistantMsg, newTitle) => {
        setIsStreaming(false);
        setIsThinking(false);
        setStreamingText('');
        setMessages(prev => [...prev, assistantMsg]);
        if (newTitle) {
          setActiveSession(prev => prev ? { ...prev, title: newTitle } : null);
          setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title: newTitle } : s));
        }
      },
      onError: (err) => {
        setIsStreaming(false);
        setIsThinking(false);
        console.error('Regenerate error:', err);
        setErrorMessage('Failed to regenerate response. Please tap retry.');
      }
    });
  };

  // Edit & Resend Question
  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMessageId(msg.id);
    setEditingContent(msg.content);
  };

  const handleSaveAndResend = async (msgId: string) => {
    const text = editingContent.trim();
    if (!text || isStreaming || !activeSessionId) return;

    const index = messages.findIndex(m => m.id === msgId);
    if (index === -1) return;

    setMessages(prev => prev.slice(0, index));
    setEditingMessageId(null);
    setErrorMessage(null);
    setIsThinking(true);
    setIsStreaming(true);
    setStreamingText('');
    isUserScrolledUp.current = false;

    if (!msgId.startsWith('user-temp-')) {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      let accumulated = '';

      await api.chat.editMessage(activeSessionId, msgId, text, {
        signal: abortController.signal,
        onChunk: (chunk) => {
          setIsThinking(false);
          accumulated += chunk;
          setStreamingText(accumulated);
        },
        onDone: (assistantMsg, newTitle) => {
          setIsStreaming(false);
          setIsThinking(false);
          setStreamingText('');
          const editedUserMsg: ChatMessage = {
            id: `edited-${Date.now()}`,
            session_id: activeSessionId,
            role: 'user',
            content: text,
            created_at: new Date().toISOString()
          };
          setMessages(prev => [...prev, editedUserMsg, assistantMsg]);
          if (newTitle) {
            setActiveSession(prev => prev ? { ...prev, title: newTitle } : null);
            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title: newTitle } : s));
          }
        },
        onError: (err) => {
          setIsStreaming(false);
          setIsThinking(false);
          console.error('Edit stream error:', err);
          setErrorMessage('Failed to edit and resend question.');
        }
      });
    } else {
      handleSendMessage(text);
    }
  };

  // Copy Answer
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Textarea auto-resize
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputQuery(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter sessions by search query
  const filteredSessions = sessions.filter(s =>
    (s.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.target_exam || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex h-full w-full bg-slate-900 text-slate-100 overflow-hidden font-sans ${isModal ? 'rounded-2xl border border-slate-700 shadow-2xl' : ''}`}>
      
      {/* ----------------- LEFT SIDEBAR (ChatGPT Style) ----------------- */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-950/95 backdrop-blur-xl border-r border-slate-800 flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* New Chat & Header */}
        <div className="p-3.5 border-b border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-teal-400 font-bold text-sm tracking-tight">
              <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
              <span>Study Problem Solver</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => handleNewChat()}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-semibold text-sm shadow-md shadow-teal-900/30 transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Search sessions */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 px-4">
              {searchQuery ? 'No matching chats found' : 'No previous chat sessions yet. Ask your first doubt!'}
            </div>
          ) : (
            filteredSessions.map(session => {
              const isActive = session.id === activeSessionId;
              const isRenaming = renamingSessionId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => !isRenaming && selectSession(session.id)}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                    isActive
                      ? 'bg-slate-800/90 text-white font-medium border border-teal-500/40 shadow-xs'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  {isRenaming ? (
                    <div className="flex items-center space-x-1.5 w-full py-0.5" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={renamingTitle}
                        onChange={e => setRenamingTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveRename(session.id);
                          if (e.key === 'Escape') setRenamingSessionId(null);
                        }}
                        autoFocus
                        className="flex-1 px-2 py-1 rounded bg-slate-900 border border-teal-500 text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveRename(session.id)}
                        className="p-1 rounded text-teal-400 hover:text-white hover:bg-slate-700 cursor-pointer"
                        title="Save title"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setRenamingSessionId(null)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        className="flex items-center space-x-2.5 overflow-hidden pr-2 flex-1"
                        onDoubleClick={e => handleStartRename(e, session)}
                        title="Double-click to rename"
                      >
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                        <div className="truncate">
                          <div className="truncate font-medium">{session.title || 'Untitled Discussion'}</div>
                          <div className="text-[10px] text-slate-500 flex items-center space-x-1.5 mt-0.5">
                            <span className="px-1 py-0.2 rounded bg-slate-800 text-teal-400 font-mono text-[9px] border border-slate-700/60">
                              {session.target_exam || 'General'}
                            </span>
                            <span>•</span>
                            <span>{session.message_count || 0} msgs</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={e => handleStartRename(e, session)}
                          className="p-1 rounded-md text-slate-400 hover:text-teal-300 hover:bg-slate-800/80 transition-colors cursor-pointer"
                          title="Rename chat"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => handleDeleteSession(e, session.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <Bot className="w-3.5 h-3.5 text-teal-400" />
            <span>AI Problem Solver Active</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-950/60 text-teal-300 border border-teal-800/60 font-medium">
            ChatGPT Grade
          </span>
        </div>
      </div>

      {/* Backdrop for mobile drawer */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* ----------------- RIGHT MAIN CHAT PANE ----------------- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900">
        
        {/* TOP BAR: Exam Selector & Controls */}
        <div className="h-16 border-b border-slate-800 bg-slate-950/80 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              title="Open Chat History"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Target Exam Selector (CORE SPECIFICATION 2.1) */}
            <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs shadow-xs">
              <span className="text-slate-400 hidden sm:inline font-medium">Solving doubts for:</span>
              <div className="relative inline-block">
                <select
                  value={selectedExam}
                  onChange={e => handleExamChange(e.target.value)}
                  className="bg-transparent text-teal-300 font-semibold cursor-pointer focus:outline-none pr-5 appearance-none text-xs sm:text-sm"
                >
                  {TARGET_EXAM_OPTIONS.map(opt => (
                    <option key={opt} value={opt} className="bg-slate-900 text-slate-200">
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-teal-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Free text input if 'Other / General' selected */}
              {isCustomExam && (
                <input
                  type="text"
                  placeholder="Type exam name..."
                  value={customExamInput}
                  onChange={e => setCustomExamInput(e.target.value)}
                  onBlur={handleCustomExamBlur}
                  className="ml-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-600 text-xs text-white focus:outline-none focus:border-teal-400 w-32"
                />
              )}
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2">
            <span className="hidden lg:inline text-[11px] text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
              {activeSession?.title || 'Chat'}
            </span>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* ERROR BANNER */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={handleRegenerate}
              className="px-3 py-1 rounded-lg bg-red-800 hover:bg-red-700 text-white font-medium transition-colors cursor-pointer text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* CHAT MESSAGES SCROLL VIEW */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800"
        >
          {messages.length === 0 && !isThinking && !isStreaming ? (
            /* EMPTY HERO STATE (ChatGPT Style) */
            <div className="max-w-xl mx-auto my-auto text-center py-10 px-4 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 mx-auto flex items-center justify-center text-white shadow-xl shadow-teal-500/20">
                <GraduationCap className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  What academic problem can I solve for you today?
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  ChatGPT-grade academic problem solver for <span className="text-teal-400 font-semibold">{isCustomExam && customExamInput ? customExamInput : selectedExam}</span> — math, science, humanities, code & numericals.
                </p>
              </div>

              {/* Starter Prompt Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-2">
                {[
                  `What is the SI unit of force?`,
                  `State and derive Snell's Law with ray diagram`,
                  `Write a Python function to check if a string is a palindrome`,
                  `A 2 kg ball moving at 4 m/s collides elastically with a 1 kg stationary ball. Find final velocities.`,
                  `How does the nephron filter blood in human kidneys?`,
                  `Explain the causes of the French Revolution in 5 key points`
                ].map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(promptText)}
                    className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-teal-500/60 text-xs text-slate-300 hover:text-white transition-all text-left shadow-xs cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="line-clamp-2">{promptText}</span>
                      <Sparkles className="w-3.5 h-3.5 text-teal-400/50 group-hover:text-teal-400 shrink-0 ml-1.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* CONVERSATION MESSAGE BUBBLES */
            messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isLastAssistant = !isUser && idx === messages.length - 1;

              return (
                <div
                  key={msg.id || idx}
                  className={`flex items-start space-x-3 max-w-3xl ${
                    isUser ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-xs font-bold ${
                      isUser
                        ? 'bg-gradient-to-tr from-teal-500 to-teal-700 text-white'
                        : 'bg-slate-800 border border-slate-700 text-teal-400'
                    }`}
                  >
                    {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Bubble Content */}
                  <div className="flex-1 overflow-hidden space-y-1.5">
                    {/* Header name / timestamp */}
                    <div className={`flex items-center space-x-2 text-[11px] text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span>{isUser ? 'You' : `Study Problem Solver (${activeSession?.target_exam || selectedExam})`}</span>
                    </div>

                    {/* Edit mode for user message */}
                    {editingMessageId === msg.id ? (
                      <div className="p-3 rounded-2xl bg-slate-800 border border-teal-500 space-y-2">
                        <textarea
                          value={editingContent}
                          onChange={e => setEditingContent(e.target.value)}
                          className="w-full bg-slate-900 text-sm text-white p-2 rounded-lg border border-slate-700 focus:outline-none"
                          rows={3}
                        />
                        <div className="flex justify-end space-x-2 text-xs">
                          <button
                            onClick={() => setEditingMessageId(null)}
                            className="px-3 py-1 rounded bg-slate-700 text-slate-300 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveAndResend(msg.id)}
                            className="px-3 py-1 rounded bg-teal-600 text-white font-medium hover:bg-teal-500"
                          >
                            Save & Resend
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-md ${
                          isUser
                            ? 'bg-gradient-to-br from-teal-950/70 to-slate-900 border border-teal-600/50 text-slate-100'
                            : 'bg-white text-slate-800 border border-slate-200'
                        }`}
                      >
                        {isUser ? (
                          <div className="text-sm sm:text-[14.5px] leading-relaxed whitespace-pre-wrap font-normal">
                            {msg.content}
                          </div>
                        ) : (
                          <MarkdownKatexRenderer content={msg.content} />
                        )}
                      </div>
                    )}

                    {/* Assistant Action Buttons: Copy, Regenerate, Edit */}
                    <div className={`flex items-center space-x-2 text-xs text-slate-400 pt-0.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser ? (
                        <>
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="flex items-center space-x-1 px-2 py-0.5 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer text-[11px]"
                            title="Copy Answer"
                          >
                            {copiedMessageId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-teal-400" />
                                <span className="text-teal-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {isLastAssistant && !isStreaming && (
                            <button
                              onClick={handleRegenerate}
                              className="flex items-center space-x-1 px-2 py-0.5 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer text-[11px]"
                              title="Regenerate answer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Regenerate</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(msg)}
                          className="flex items-center space-x-1 px-2 py-0.5 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer text-[11px]"
                          title="Edit question"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* ACTIVE STREAMING ASSISTANT BUBBLE */}
          {isStreaming && (
            <div className="flex items-start space-x-3 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-teal-400 flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="text-[11px] text-slate-500">
                  <span>Study Problem Solver ({activeSession?.target_exam || selectedExam})</span>
                </div>

                <div className="rounded-2xl px-4 py-3 bg-white text-slate-800 border border-slate-200 shadow-md">
                  {isThinking && !streamingText ? (
                    <div className="flex items-center space-x-2 py-2 text-slate-500 text-xs">
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="ml-1 text-slate-600 font-medium">Analyzing question & retrieving syllabus formulas...</span>
                    </div>
                  ) : (
                    <MarkdownKatexRenderer content={streamingText} isStreaming={true} />
                  )}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ----------------- BOTTOM INPUT BAR ----------------- */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800/90">
          <div className="max-w-3xl mx-auto space-y-2">
            
            {/* Stop Generation Button when streaming */}
            {isStreaming && (
              <div className="flex justify-center">
                <button
                  onClick={handleStopGeneration}
                  className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-200 shadow-md transition-all cursor-pointer"
                >
                  <Square className="w-3 h-3 text-red-400 fill-red-400" />
                  <span>Stop generating</span>
                </button>
              </div>
            )}

            <div className="relative flex items-end bg-slate-900 border border-slate-700/80 rounded-2xl shadow-inner focus-within:border-teal-500/80 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all p-1.5">
              
              <textarea
                ref={textareaRef}
                value={inputQuery}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder={`Ask any academic question, derivation or numerical for ${isCustomExam && customExamInput ? customExamInput : selectedExam}... (Shift + Enter for new line)`}
                rows={1}
                className="w-full bg-transparent px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-44 leading-relaxed"
              />

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputQuery.trim() || isStreaming}
                className={`p-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
                  inputQuery.trim() && !isStreaming
                    ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-900/40'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
                title="Send doubt (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Input Info & Character Limit */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>
                Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400 text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400 text-[10px]">Shift + Enter</kbd> for new line
              </span>
              <span className={inputQuery.length > 1500 ? 'text-amber-400 font-semibold' : ''}>
                {inputQuery.length > 0 && `${inputQuery.length} chars`}
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
