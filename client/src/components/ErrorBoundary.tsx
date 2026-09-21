import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { safeStorage } from '../utils/safeStorage';

interface Props {
  children: ReactNode;
  level?: 'root' | 'section';
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[Pivott ErrorBoundary caught an error]:', error, errorInfo);

    // Report error to backend telemetry endpoint if reachable
    try {
      fetch('/api/logs/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {
        // Silently ignore telemetry failure when offline
      });
    } catch {
      // Ignored
    }
  }

  private handleReload = () => {
    // Clean up transient hash parameters that might be causing render crashes
    window.location.reload();
  };

  private handleResetToHome = () => {
    try {
      safeStorage.removeItem('pivott_active_tab');
    } catch {}
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  private handleCopyDetails = () => {
    const details = `Error: ${this.state.error?.message || 'Unknown'}\nStack: ${this.state.error?.stack || 'None'}\nComponent: ${this.state.errorInfo?.componentStack || 'None'}`;
    navigator.clipboard.writeText(details);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public render() {
    if (this.state.hasError) {
      const isRoot = this.props.level !== 'section';

      return (
        <div
          className={`${
            isRoot
              ? 'min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4'
              : 'p-6 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-slate-100 my-4'
          } animate-fade-in font-sans`}
        >
          <div className="max-w-md w-full text-center space-y-5">
            {/* Warning Icon with Glow */}
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {this.props.fallbackTitle || 'Something went wrong'}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Pivott encountered an unexpected issue, but your study progress is safely saved.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-md shadow-teal-900/40 transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload App</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetToHome}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-all cursor-pointer active:scale-95"
              >
                <Home className="w-4 h-4 text-slate-400" />
                <span>Back to Home</span>
              </button>
            </div>

            {/* Collapsible Technical Details */}
            <div className="pt-3 border-t border-slate-800 text-left">
              <button
                type="button"
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                className="flex items-center justify-between w-full text-xs text-slate-500 hover:text-slate-400 py-1 cursor-pointer transition-colors"
              >
                <span>Diagnostic details</span>
                {this.state.showDetails ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {this.state.showDetails && (
                <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800">
                    <span className="text-red-400 truncate max-w-[220px]">
                      {this.state.error?.message || 'Unknown Error'}
                    </span>
                    <button
                      type="button"
                      onClick={this.handleCopyDetails}
                      className="inline-flex items-center space-x-1 text-slate-400 hover:text-teal-400 cursor-pointer"
                    >
                      {this.state.copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[10px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-[10px] text-slate-400 overflow-x-auto max-h-32 leading-relaxed">
                    {this.state.error?.stack || this.state.errorInfo?.componentStack || 'No stack trace available'}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
