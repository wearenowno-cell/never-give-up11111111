import {StrictMode, Component, ErrorInfo, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ── Suppression of Benign HMR WebSocket Errors ──────────────────────────────
// In this sandboxed development container, HMR is disabled by the platform control 
// plane, which leads to harmless WebSocket reconnection failures. We suppress 
// these globally to prevent them from crashing or flashing on the user's screen.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason) {
      const msg = reason.message || String(reason);
      if (msg.includes('WebSocket') || msg.includes('websocket') || msg.includes('HMR') || msg.includes('connection failed')) {
        event.preventDefault();
        console.warn("[Platform HMR Sandbox] Suppressed benign WebSocket rejection:", msg);
      }
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (msg.includes('WebSocket') || msg.includes('websocket') || msg.includes('HMR') || msg.includes('ws://') || msg.includes('wss://')) {
      event.preventDefault();
      console.warn("[Platform HMR Sandbox] Suppressed benign WebSocket error:", msg);
    }
  });
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React error in frontend application:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-center">
            <div className="text-rose-400 bg-rose-500/10 rounded-full p-3 mx-auto w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-100">Something went wrong</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The application encountered an unexpected runtime error and gracefully recovered. Click below to reset or reload the dashboard.
            </p>
            <div className="bg-slate-950 text-rose-400 p-3 rounded-lg text-[10px] font-mono text-left overflow-auto max-h-40 border border-slate-800/60 leading-relaxed">
              {this.state.error?.toString() || "Unknown react exception"}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 w-full py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer"
            >
              Reload Workspace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
