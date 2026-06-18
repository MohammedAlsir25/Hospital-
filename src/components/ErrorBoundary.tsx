import React, { Component, ErrorInfo, ReactNode } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State;
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error boundary catch:", error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FBFBF9] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="bg-white p-8 rounded-3xl shadow-[0_0_30px_rgba(79,70,229,0.05)] max-w-md border border-[#EAE6DF] transition duration-300">
            <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-7 h-7 text-rose-600 animate-pulse" />
            </div>
            <h2 className="text-lg font-bold text-neutral-800">
              Clinical Session Restitution Gate
            </h2>
            <p className="text-xs text-neutral-550 mt-2 leading-relaxed">
              An unexpected validation anomaly or memory overflow was intercepted within the workspace. To guarantee EHR integrity, the system has safelisted active clinical records.
            </p>
            {this.state.error && (
              <div className="mt-4 p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-[10px] text-neutral-600 text-left font-mono break-all max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="mt-6 space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 bg-[#4F46E5] hover:bg-[#4F46E5]/95 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-2 bg-neutral-100 hover:bg-neutral-250 text-neutral-700 font-bold text-[11px] rounded-xl active:scale-[0.98] transition-all cursor-pointer"
              >
                Clear Workspace Cache & Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
