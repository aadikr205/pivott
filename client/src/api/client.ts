import { safeStorage } from '../utils/safeStorage';

export class ApiError extends Error {
  public status: number;
  public data?: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed. Please check your internet.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Server took too long to respond. Tap to retry.') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class AuthError extends Error {
  public status: number = 401;
  constructor(message: string = 'Session expired, please log in again.') {
    super(message);
    this.name = 'AuthError';
  }
}

// Uses VITE_API_URL if deployed separately (e.g. Vercel/Netlify), otherwise falls back to relative path (unified host)
const BASE_URL = (import.meta.env?.VITE_API_URL as string) || '';
const DEFAULT_TIMEOUT_MS = 12000;

let inMemoryToken: string | null = null;

function getToken(): string | null {
  return safeStorage.getItem('pivott_token', inMemoryToken);
}

export function setToken(token: string) {
  inMemoryToken = token;
  safeStorage.setItem('pivott_token', token);
}

export function clearToken() {
  inMemoryToken = null;
  safeStorage.removeItem('pivott_token');
}

/**
 * Robust fetch request with 12s timeout, automatic retry on GET, and global 401 session expiry handling
 */
async function request<T>(endpoint: string, options: RequestInit = {}, retries = 1): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  const controller = new AbortController();
  let slowTimer: any = null;
  let timeoutTimer: any = null;

  // Notify if request takes > 2.5s (waking server / slow tunnel)
  if (typeof window !== 'undefined') {
    slowTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('pivott:slow-connection', { detail: { endpoint, slow: true } }));
    }, 2500);
  }

  // 12-second hard timeout
  timeoutTimer = setTimeout(() => {
    controller.abort();
  }, DEFAULT_TIMEOUT_MS);

  // Link caller signal if passed
  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(slowTimer);
    clearTimeout(timeoutTimer);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pivott:slow-connection', { detail: { endpoint, slow: false } }));
    }

    // Handle 401 Unauthorized / Token Expiry
    if (res.status === 401) {
      clearToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pivott:auth-expired', { detail: { endpoint, status: 401 } }));
      }
      const errJson = await res.json().catch(() => ({}));
      throw new AuthError(errJson.error || 'Your login session has expired. Please log in again.');
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'An unknown server error occurred.' }));
      throw new ApiError(errorData.error || `Request failed with status ${res.status}`, res.status, errorData);
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(slowTimer);
    clearTimeout(timeoutTimer);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pivott:slow-connection', { detail: { endpoint, slow: false } }));
    }

    if (err instanceof AuthError || err instanceof ApiError) {
      throw err;
    }

    const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
    
    // Auto-retry once for idempotent GET requests if network glitched or timed out
    if (isGet && retries > 0) {
      console.warn(`[Pivott API] Request to ${endpoint} failed (${isTimeout ? 'timeout' : err.message}). Retrying...`);
      await new Promise(r => setTimeout(r, 800));
      return request<T>(endpoint, options, retries - 1);
    }

    if (isTimeout) {
      throw new TimeoutError(`Server took too long to respond for ${endpoint}. Tap to retry.`);
    }

    throw new NetworkError(err.message || 'Network connection failed. Please check your internet or Wi-Fi.');
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
  exam_name: string;
  exam_course?: string;
  exam_date: string;
  max_daily_hours: number;
  off_days: number[];
  created_at: string;
  is_verified?: number;
  profile_photo_url?: string | null;
  notifications_enabled?: boolean | number;
  auth_provider?: string;
}

export interface TopicItem {
  topic_id: string;
  topic_name: string;
  subject_name: string;
  subject_id?: string;
  weightage: number;
  mastery_score: number;
  allocated_minutes: number;
  status: string; // 'in_progress', 'skim_only', 'done', 'missed'
  current_status?: string;
  minutes_done?: number;
}

export interface TodayScheduleResponse {
  date: string;
  planned_items: TopicItem[];
  actual_completed: Array<{ topic_id: string; minutes_done: number; status: string }>;
  total_allocated_minutes: number;
  max_daily_hours: number;
  has_backlog: boolean;
  backlog_minutes: number;
  backlog_count: number;
  backlog_items: Array<{ topic_id: string; topic_name?: string; allocated_minutes: number; missed_date: string }>;
  micro_copy: string;
}

export interface ReplanResponse {
  message: string;
  replan_id: string;
  summary_text: string;
  micro_copy: string;
  diff_summary: {
    totalAvailableDays: number;
    studyDays: number;
    bufferDays: number;
    remainingCapacityMinutes: number;
    totalWorkloadMinutes: number;
    keptCount: number;
    compressedCount: number;
    deferredCount: number;
    maxDailyHours: number;
    isDeficit: boolean;
  };
  deferred_topics: any[];
  compressed_topics: string[];
  schedule_days_count: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface DashboardResponse {
  summary: {
    exam_name: string;
    exam_date: string;
    days_to_exam: number;
    max_daily_hours: number;
    total_topics: number;
    done_topics: number;
    deferred_topics: number;
    skim_topics: number;
    overall_mastery: number;
    hours_completed: number;
    hours_planned: number;
    current_backlog_minutes: number;
  };
  charts: {
    daily_completion: Array<{
      date: string;
      completion_percent: number;
      planned_minutes: number;
      done_minutes: number;
      is_today: boolean;
    }>;
    backlog_trend: Array<{
      date: string;
      backlog_minutes: number;
      backlog_hours: number;
      missed_topics: number;
    }>;
    quiz_score_trend: Array<{
      date: string;
      subject: string;
      topic: string;
      score: number;
    }>;
    burndown: Array<{
      date: string;
      actual_remaining_minutes: number | null;
      actual_remaining_hours: number | null;
      ideal_remaining_hours: number;
    }>;
    subject_mastery: Array<{
      subject_id: string;
      subject_name: string;
      total_topics: number;
      done_topics: number;
      deferred_topics: number;
      skim_topics: number;
      completion_percent: number;
      avg_mastery_score: number;
    }>;
  };
}

export interface PYQQuestion {
  id: string;
  exam_key: string;
  subject: string;
  topic: string;
  year: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  weightage: number;
  difficulty: string;
  frequency_score: string;
  type?: 'mcq' | 'numerical';
  correct_numeric_answer?: number | null;
  tolerance?: number;
}

export interface PYQStatsResponse {
  total_pyqs: number;
  by_exam: Array<{ exam_key: string; count: number }>;
  by_year: Array<{ year: number; count: number }>;
  top_repeated_topics: Array<{
    topic: string;
    subject: string;
    exam_key: string;
    weightage: number;
    frequency_score: string;
    question_count: number;
  }>;
}

export interface DoubtSolutionResponse {
  doubt: string;
  topic?: string;
  subject?: string;
  exam?: string;
  formatted_reply: string;
  concept_summary?: string;
  formula_or_rule?: string;
  steps?: string[];
  pro_tip?: string;
  is_direct_answer?: boolean;
  search_grounding?: {
    chapter_title?: string | null;
    subject?: string | null;
    matched_pyq?: string | null;
  };
  follow_up_suggestions?: string[];
}

export interface RevisionSuggestionsResponse {
  exam_name: string;
  exam_date: string;
  days_to_exam: number;
  revision_topics: Array<{
    rank: number;
    topic_id: string;
    topic_name: string;
    subject_name?: string;
    weightage: number;
    mastery_score: number;
    priority: string;
    recommended_action: string;
    recommended_minutes: number;
  }>;
}

export const api = {
  // Auth - Native Social Sign-In
  loginWithGoogle: (data: { credential: string }) =>
    request<{ token: string; user: User }>('/auth/google', { method: 'POST', body: JSON.stringify(data) }),
  loginWithApple: (data: { id_token: string; user?: any }) =>
    request<{ token: string; user: User }>('/auth/apple', { method: 'POST', body: JSON.stringify(data) }),

  // Legacy/Fallback Auth
  signup: (data: any) => request<{ token: string; user: User }>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request<{ user: User }>('/auth/me'),
  uploadProfilePhoto: (data: { photo_base64: string }) =>
    request<{ success: boolean; profile_photo_url: string; user: User }>('/auth/profile-photo', { method: 'POST', body: JSON.stringify(data) }),
  setDefaultAvatar: (data: { avatar_id: string }) =>
    request<{ success: boolean; profile_photo_url: string; user: User }>('/auth/default-avatar', { method: 'POST', body: JSON.stringify(data) }),
  forgotPasswordSendOtp: (data: { email: string }) =>
    request<{ success: boolean; message: string; email: string; dev_otp?: string }>('/auth/forgot-password/send-otp', { method: 'POST', body: JSON.stringify(data) }),
  forgotPasswordVerifyAndReset: (data: { email: string; otp: string; new_password: string; confirm_password?: string }) =>
    request<{ success: boolean; message: string }>('/auth/forgot-password/verify-and-reset', { method: 'POST', body: JSON.stringify(data) }),
  changePassword: (
    dataOrCurrent: { current_password: string; new_password: string; confirm_password?: string } | string,
    newPassword?: string,
    confirmPassword?: string
  ) => {
    const payload = typeof dataOrCurrent === 'string'
      ? { current_password: dataOrCurrent, new_password: newPassword!, confirm_password: confirmPassword }
      : dataOrCurrent;
    return request<{ success: boolean; message: string }>('/auth/change-password', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateNotificationPreference: (enabled: boolean) =>
    request<{ success: boolean; notifications_enabled: boolean; user: User }>('/auth/notifications-preference', { method: 'PUT', body: JSON.stringify({ enabled }) }),

  // Onboarding
  getPresets: () => request<{ presets: Record<string, any> }>('/onboarding/presets'),
  setupOnboarding: (data: any) => request<any>('/onboarding/setup', { method: 'POST', body: JSON.stringify(data) }),

  // Schedule
  getTodaySchedule: (date?: string) => request<TodayScheduleResponse>(`/schedule/today${date ? `?date=${date}` : ''}`),
  getAllSchedule: () => request<{ days: any[] }>('/schedule/all'),
  markProgress: (data: { date: string; topic_id: string; minutes_done: number; status: string }) =>
    request<any>('/schedule/mark-progress', { method: 'POST', body: JSON.stringify(data) }),
  replan: (data?: { today?: string; reason?: string }) =>
    request<ReplanResponse>('/schedule/replan', { method: 'POST', body: JSON.stringify(data || {}) }),
  getReplanHistory: () => request<{ history: any[] }>('/schedule/replan-history'),
  getRevisionSuggestions: () => request<RevisionSuggestionsResponse>('/schedule/revision-suggestions'),

  // Topics
  getDeferredTopics: () => request<{ deferred_topics: any[] }>('/topics/deferred'),
  reincludeTopic: (topicId: string) => request<any>(`/topics/${topicId}/reinclude`, { method: 'POST' }),
  updateTopic: (topicId: string, data: any) => request<any>(`/topics/${topicId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Quiz
  generateQuiz: (data: { topic_id?: string; topic_name?: string; subject_name?: string }) =>
    request<{ topic_id?: string; topic_name: string; subject_name: string; questions: QuizQuestion[] }>(
      '/ai/generate-quiz',
      { method: 'POST', body: JSON.stringify(data) }
    ),
  submitQuiz: (data: { topic_id: string; score: number; total_questions: number; time_taken_seconds: number; questions: any[] }) =>
    request<any>('/quiz/submit', { method: 'POST', body: JSON.stringify(data) }),
  getQuizHistory: () => request<{ history: any[] }>('/quiz/history'),

  // PYQ Bank (10 Years Important Questions)
  getPYQs: (params: { exam_key?: string; subject?: string; topic?: string; year?: number; difficulty?: string; search?: string; limit?: number } = {}) => {
    const queryParts: string[] = [];
    if (params.exam_key) queryParts.push(`exam_key=${encodeURIComponent(params.exam_key)}`);
    if (params.subject) queryParts.push(`subject=${encodeURIComponent(params.subject)}`);
    if (params.topic) queryParts.push(`topic=${encodeURIComponent(params.topic)}`);
    if (params.year) queryParts.push(`year=${encodeURIComponent(params.year)}`);
    if (params.difficulty) queryParts.push(`difficulty=${encodeURIComponent(params.difficulty)}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.limit) queryParts.push(`limit=${encodeURIComponent(params.limit)}`);
    const qs = queryParts.length ? `?${queryParts.join('&')}` : '';
    return request<{ count: number; questions: PYQQuestion[] }>(`/pyq/questions${qs}`);
  },
  getPYQStats: () => request<PYQStatsResponse>('/pyq/stats'),
  submitPYQPractice: (data: { question_id: string; selected_index: number; selected_option?: string }) =>
    request<{ is_correct: boolean; correct_index: number; explanation: string; frequency_score: string; year: number }>(
      '/pyq/submit-practice',
      { method: 'POST', body: JSON.stringify(data) }
    ),
  checkPyqAnswer: (data: { question_id: string; answer?: number | string; selected_index?: number; selected_option?: string }) =>
    request<{ is_correct: boolean; correct_answer?: number; correct_index?: number; tolerance?: number; difference?: number; explanation: string; frequency_score: string; year: number }>(
      '/pyq/check-answer',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  // Activity History (Immutable)
  getActivityHistory: (params: { type?: string; start_date?: string; end_date?: string; limit?: number; offset?: number } = {}) => {
    const queryParts: string[] = [];
    if (params.type) queryParts.push(`type=${encodeURIComponent(params.type)}`);
    if (params.start_date) queryParts.push(`start_date=${encodeURIComponent(params.start_date)}`);
    if (params.end_date) queryParts.push(`end_date=${encodeURIComponent(params.end_date)}`);
    if (params.limit) queryParts.push(`limit=${encodeURIComponent(params.limit)}`);
    if (params.offset) queryParts.push(`offset=${encodeURIComponent(params.offset)}`);
    const qs = queryParts.length ? `?${queryParts.join('&')}` : '';
    return request<{ count: number; total: number; logs: ActivityLog[] }>(`/activity/history${qs}`);
  },

  // Concept Videos
  getTopicVideo: (topicId: string) => request<ConceptVideoData>(`/topics/${topicId}/concept-video`),
  completeTopicVideo: (topicId: string) => request<any>(`/topics/${topicId}/complete-video`, { method: 'POST' }),

  // AI Doubt Solver Bot
  solveDoubt: (data: { doubt: string; exam_name?: string; subject_name?: string; topic_name?: string; conversation_history?: any[] }) =>
    request<DoubtSolutionResponse>('/ai/solve-doubt', { method: 'POST', body: JSON.stringify(data) }),

  // Progress
  getDashboard: () => request<DashboardResponse>('/progress/dashboard'),

  // AI Helpers
  suggestWeightage: (data: { subject_name: string; topic_name: string }) =>
    request<{ weightage: number; reason: string }>('/ai/suggest-weightage', { method: 'POST', body: JSON.stringify(data) }),

  // Short Notes (Full Chapters by Target Exam/Course)
  getShortNotes: (params: { search?: string; exam?: string; subject?: string } = {}) => {
    const queryParts: string[] = [];
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.exam) queryParts.push(`exam=${encodeURIComponent(params.exam)}`);
    if (params.subject) queryParts.push(`subject=${encodeURIComponent(params.subject)}`);
    const qs = queryParts.length ? `?${queryParts.join('&')}` : '';
    return request<{ success: boolean; count: number; total: number; notes: ChapterNote[] }>(`/notes${qs}`);
  },
  getShortNoteExams: () => request<{ success: boolean; exams: ExamOption[] }>('/notes/exams'),
  getShortNoteById: (id: string) => request<{ success: boolean; note: ChapterNote }>(`/notes/${encodeURIComponent(id)}`),

  // Study Problem Solver / Doubt Solver (ChatGPT-Style Multi-Turn Chat)
  chat: {
    getSessions: () => request<{ sessions: ChatSession[] }>('/chat/sessions'),
    createSession: (target_exam?: string, title?: string) =>
      request<{ session: ChatSession }>('/chat/sessions', {
        method: 'POST',
        body: JSON.stringify({ target_exam, title })
      }),
    getSession: (id: string) => request<{ session: ChatSession; messages: ChatMessage[] }>(`/chat/sessions/${id}`),
    updateSession: (id: string, updates: { target_exam?: string; title?: string }) =>
      request<{ session: ChatSession }>(`/chat/sessions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      }),
    renameSession: (id: string, title: string) =>
      request<{ session: ChatSession }>(`/chat/sessions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title })
      }),
    deleteSession: (id: string) => request<{ success: boolean; id: string }>(`/chat/sessions/${id}`, { method: 'DELETE' }),

    streamMessage: async (
      sessionId: string,
      content: string,
      target_exam: string,
      callbacks: {
        onChunk: (text: string) => void;
        onDone: (message: ChatMessage, title?: string) => void;
        onError: (err: string) => void;
        signal?: AbortSignal;
      }
    ) => {
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      try {
        const response = await fetch(`${BASE_URL}/chat/sessions/${sessionId}/message`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ content, target_exam }),
          signal: callbacks.signal
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error('No readable stream available');

        let buffer = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === 'error' || parsed.error) {
                callbacks.onError(parsed.error || 'Stream error');
                return;
              }
              if (parsed.type === 'chunk' || parsed.chunk || parsed.text) {
                callbacks.onChunk(parsed.text || parsed.chunk || '');
              }
              if (parsed.type === 'done' || parsed.done) {
                callbacks.onDone(parsed.message, parsed.title);
                return;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e, dataStr);
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        callbacks.onError(err.message || 'Stream connection error');
      }
    },

    editMessage: async (
      sessionId: string,
      messageId: string,
      content: string,
      callbacks: {
        onChunk: (text: string) => void;
        onDone: (message: ChatMessage, title?: string) => void;
        onError: (err: string) => void;
        signal?: AbortSignal;
      }
    ) => {
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      try {
        const response = await fetch(`${BASE_URL}/chat/sessions/${sessionId}/messages/${messageId}/edit`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ content }),
          signal: callbacks.signal
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error('No readable stream available');

        let buffer = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === 'error' || parsed.error) {
                callbacks.onError(parsed.error || 'Stream error');
                return;
              }
              if (parsed.type === 'chunk' || parsed.chunk || parsed.text) {
                callbacks.onChunk(parsed.text || parsed.chunk || '');
              }
              if (parsed.type === 'done' || parsed.done) {
                callbacks.onDone(parsed.message, parsed.title);
                return;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e, dataStr);
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        callbacks.onError(err.message || 'Stream connection error');
      }
    },

    regenerate: async (
      sessionId: string,
      callbacks: {
        onChunk: (text: string) => void;
        onDone: (message: ChatMessage, title?: string) => void;
        onError: (err: string) => void;
        signal?: AbortSignal;
      }
    ) => {
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      try {
        const response = await fetch(`${BASE_URL}/chat/sessions/${sessionId}/regenerate`, {
          method: 'POST',
          headers,
          signal: callbacks.signal
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error('No readable stream available');

        let buffer = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === 'error' || parsed.error) {
                callbacks.onError(parsed.error || 'Stream error');
                return;
              }
              if (parsed.type === 'chunk' || parsed.chunk || parsed.text) {
                callbacks.onChunk(parsed.text || parsed.chunk || '');
              }
              if (parsed.type === 'done' || parsed.done) {
                callbacks.onDone(parsed.message, parsed.title);
                return;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e, dataStr);
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        callbacks.onError(err.message || 'Stream connection error');
      }
    }
  },

  // Doubt Solver (backwards-compatible alias to chat)
  doubtSolver: {
    getSessions: () => request<{ sessions: ChatSession[] }>('/chat/sessions'),
    createSession: (target_exam: string, title?: string) =>
      request<{ session: ChatSession }>('/chat/sessions', {
        method: 'POST',
        body: JSON.stringify({ target_exam, title })
      }),
    getSession: (id: string) => request<{ session: ChatSession; messages: ChatMessage[] }>(`/chat/sessions/${id}`),
    updateSession: (id: string, updates: { target_exam?: string; title?: string }) =>
      request<{ session: ChatSession }>(`/chat/sessions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      }),
    deleteSession: (id: string) => request<{ success: boolean; id: string }>(`/chat/sessions/${id}`, { method: 'DELETE' }),

    streamMessage: (
      sessionId: string,
      content: string,
      target_exam: string,
      callbacks: {
        onChunk: (text: string) => void;
        onDone: (message: ChatMessage, title?: string) => void;
        onError: (err: string) => void;
        signal?: AbortSignal;
      }
    ) => {
      // Delegate to chat.streamMessage
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      return (async () => {
        try {
          const response = await fetch(`${BASE_URL}/chat/sessions/${sessionId}/message`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ content, target_exam }),
            signal: callbacks.signal
          });

          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          if (!reader) throw new Error('No readable stream available');

          let buffer = '';
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;
              const dataStr = trimmed.slice(6);
              if (dataStr === '[DONE]') continue;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.type === 'error' || parsed.error) {
                  callbacks.onError(parsed.error || 'Stream error');
                  return;
                }
                if (parsed.type === 'chunk' || parsed.chunk || parsed.text) {
                  callbacks.onChunk(parsed.text || parsed.chunk || '');
                }
                if (parsed.type === 'done' || parsed.done) {
                  callbacks.onDone(parsed.message, parsed.title);
                  return;
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e, dataStr);
              }
            }
          }
        } catch (err: any) {
          if (err.name === 'AbortError') return;
          callbacks.onError(err.message || 'Stream connection error');
        }
      })();
    }
  },

  // Self Timetable (General School Self-Study)
  selfTimetable: {
    getEntries: () => request<SelfTimetableEntry[]>('/self-timetable/entries'),
    addEntry: (data: { class_level: number; subject: string; chapter_topic_name: string; daily_minutes?: number }) =>
      request<SelfTimetableEntry>('/self-timetable/entries', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: 'not_started' | 'in_progress' | 'done' | 'deferred') =>
      request<{ success: boolean; id: string; status: string }>(`/self-timetable/entries/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    deleteEntry: (id: string) =>
      request<{ success: boolean; id: string }>(`/self-timetable/entries/${id}`, { method: 'DELETE' }),
    submitQuiz: (id: string, data: { score: number; total_questions: number }) =>
      request<{ success: boolean; attempt_id: string; score: number; total_questions: number; passed: boolean; entry_status: string }>(
        `/self-timetable/entries/${id}/quiz/submit`,
        { method: 'POST', body: JSON.stringify(data) }
      ),
    getAnalytics: () => request<SelfTimetableAnalytics>('/self-timetable/analytics'),
    replan: (data: { target_days?: number; daily_budget_minutes?: number } = {}) =>
      request<{ success: boolean; summary_text: string; deferred_count: number; kept_count: number }>('/self-timetable/replan', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    getCurriculum: (classLevel: number, subject: string) =>
      request<{ class: number; subject: string; chapters: string[]; available_subjects: string[] }>(
        `/self-timetable/curriculum?class=${classLevel}&subject=${encodeURIComponent(subject)}`
      )
  },

  // Smart Study Reminders & Deadline Notifications
  notifications: {
    getAlerts: () => request<NotificationResponse>('/notifications/alerts'),
    ackAlert: (alertId: string) =>
      request<{ success: boolean; acknowledged_id: string }>('/notifications/ack', {
        method: 'POST',
        body: JSON.stringify({ alert_id: alertId })
      })
  }
};

export interface NotificationAlert {
  id: string;
  type: 'urgent_deadline' | 'delay_alert' | 'approaching_deadline' | 'daily_reminder' | 'celebration';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  message: string;
  action_label?: string;
  action_tab?: string;
  created_at: string;
}

export interface NotificationResponse {
  success: boolean;
  current_time: string;
  remaining_hours: number;
  remaining_minutes: number;
  pending_tasks_count: number;
  alerts_count: number;
  critical_count: number;
  alerts: NotificationAlert[];
  notifications_enabled?: number;
}

export interface SelfTimetableEntry {
  id: string;
  user_id: string;
  class_level: number;
  subject: string;
  chapter_topic_name: string;
  daily_minutes: number;
  content_text: string;
  concept_map_mermaid?: string;
  key_points: string[];
  video_url?: string;
  video_style: 'cartoon' | 'standard';
  video_slides: ConceptVideoSlide[];
  quiz_questions: QuizQuestion[];
  status: 'not_started' | 'in_progress' | 'done' | 'deferred';
  is_verified: number;
  verification_source?: string;
  created_at: string;
}

export interface SelfTimetableAnalytics {
  summary: {
    totalChapters: number;
    completedChapters: number;
    inProgressChapters: number;
    deferredChapters: number;
    notStartedChapters: number;
    completionRate: number;
  };
  quizScoreTrend: Array<{
    id: string;
    topic: string;
    subject: string;
    score: number;
    total: number;
    percentage: number;
    date: string;
  }>;
  subjectStats: Record<string, { total: number; done: number }>;
  dailyTrend: Array<{
    date: string;
    dayName: string;
    chaptersAdded: number;
    quizzesTaken: number;
  }>;
}

export interface ChatSession {
  id: string;
  user_id: string;
  target_exam: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_preview?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChapterFormula {
  name: string;
  formula: string;
  unit?: string;
}

export interface ChapterNote {
  id: string;
  chapter_title: string;
  subject: string;
  class_level: string;
  applicable_exams: string[];
  read_time: string;
  high_yield: boolean;
  summary: string;
  key_takeaways: string[];
  formulas_and_laws: ChapterFormula[];
  exam_traps_and_tips: string[];
  concept_map_mermaid?: string;
  mnemonic?: string;
  real_life_example?: string;
  common_mistakes?: string[];
  key_points?: string[];
}

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  title: string;
  details: any;
  created_at: string;
}

export interface ConceptVideoSlide {
  title: string;
  bullet_points: string[];
  equation_or_rule?: string;
  narration_script: string;
  diagram_mermaid?: string;
}

export interface ConceptVideoData {
  topic_id: string;
  title: string;
  subject_name?: string;
  slides: ConceptVideoSlide[];
  quiz: QuizQuestion[];
  duration_seconds: number;
  video_style?: 'cartoon' | 'standard';
}

export interface ExamOption {
  id: string;
  label: string;
  description: string;
  notesCount?: number;
}


