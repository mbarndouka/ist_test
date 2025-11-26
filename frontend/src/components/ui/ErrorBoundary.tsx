// ADDED: New file for Error Boundary (Point 5)
import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-[#111]">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">Something went wrong.</h1>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#111] text-white rounded-md hover:bg-[#333] transition-colors"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}