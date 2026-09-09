import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
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
    console.error('Uncaught ZLab runtime error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#131313] text-[#e5e2e1] p-6 text-center font-sans">
          <div className="w-14 h-14 rounded-2xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 flex items-center justify-center mb-4 text-[#ffb4ab]">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold mb-2">Something went wrong in the workspace</h1>
          <p className="text-xs text-[#89919e] max-w-md mb-6 leading-relaxed">
            {this.state.error?.message ||
              'An unexpected rendering error occurred. Your design data is safely stored in local state.'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#9fcaff] text-[#003259] rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-[#0d99ff] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload Studio
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="px-4 py-2 bg-[#201f1f] text-[#e5e2e1] border border-[#353534] rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-[#2a2a2a] transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
