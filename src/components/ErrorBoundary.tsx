import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RefreshCw, Radio, Home } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught streaming crash error within bounds:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Attempt reload
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-2xl border border-rose-500/10 bg-[#121215] p-8 text-center select-none shadow-xl relative overflow-hidden" id="error-boundary-ui">
          {/* Subtle grid mesh decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.02]" />
          
          <div className="relative z-10 max-w-md mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-5 border border-rose-500/20 animate-pulse">
              <AlertOctagon className="h-6 w-6" />
            </div>
            
            <h3 className="text-lg font-sans font-extrabold text-white tracking-tight">
              Player Live Stream Decryption Crash
            </h3>
            
            <p className="mt-2 text-xs text-slate-400 font-medium leading-relaxed">
              An unexpected failure occurred while trying to load, compile, or render the HLS media container. This is frequently triggered by corrupt stream manifests, network dropouts, or mixed-content (HTTP vs HTTPS) CORS policies.
            </p>

            {this.state.error && (
              <div className="mt-4 rounded-lg bg-black/40 border border-white/5 p-3 text-left">
                <span className="text-[9px] font-bold text-rose-450 uppercase font-mono tracking-widest block mb-1">
                  Debug Stack Signature
                </span>
                <p className="text-[10px] font-mono text-slate-400 break-words leading-tight select-text max-h-20 overflow-y-auto">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-4.5 py-2 text-xs font-bold text-white shadow-lg hover:bg-teal-500 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Re-Initialize Player</span>
              </button>
              
              <button
                type="button"
                onClick={() => { window.location.href = "/"; }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-4.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Portal Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
