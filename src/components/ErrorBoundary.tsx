import { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // In production you would send to an error tracking service here
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground text-sm mb-6">
              An unexpected error occurred. Please try refreshing the page or go back to the homepage.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-muted rounded-lg p-4 text-left mb-6 text-xs font-mono text-destructive overflow-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={() => { this.setState({ hasError: false, error: null, errorInfo: null }); window.location.reload(); }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              <Button variant="outline" onClick={() => { window.location.href = "/"; }}>
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
