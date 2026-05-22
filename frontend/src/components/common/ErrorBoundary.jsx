import React from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showStack: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an uncaught exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showStack: false
    });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Premium glassmorphic error fallback
      return (
        <div className="flex items-center justify-center min-h-[450px] p-6 animate-fade-in">
          <div className="w-full max-w-xl bg-white/70 dark:bg-darkbg-800/40 backdrop-blur-md border border-warm-200/50 dark:border-darkbg-700/50 rounded-2xl p-6 md:p-8 shadow-premium dark:shadow-premium-dark text-center space-y-6">
            
            {/* Warning Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center mx-auto border border-rose-100/10 animate-pulse">
              <AlertTriangle className="w-7 h-7" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-gray-800 dark:text-white">
                Unexpected glitch in CollabFlow
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 max-w-md mx-auto leading-relaxed">
                An unhandled rendering exception occurred in this panel. Don't worry — the rest of the application is still working.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white shadow-premium active:scale-[0.98] transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Section
              </button>
              
              <a
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 dark:bg-darkbg-700 dark:hover:bg-darkbg-600 dark:text-gray-200 dark:border-gray-800 transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                Go to Dashboard
              </a>
            </div>

            {/* Collapsible Error stack accordion for devs */}
            {this.state.error && (
              <div className="border-t border-gray-100 dark:border-gray-800/60 pt-4 text-left">
                <button
                  onClick={() => this.setState({ showStack: !this.state.showStack })}
                  className="flex items-center justify-between w-full text-[11px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <span>Technical details</span>
                  {this.state.showStack ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                
                {this.state.showStack && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-darkbg-900/40 border border-gray-100 dark:border-gray-800 rounded-xl max-h-40 overflow-y-auto text-[10px] font-mono text-rose-600 dark:text-rose-400 whitespace-pre-wrap leading-normal">
                    <p className="font-bold">{this.state.error.toString()}</p>
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
