import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Separate interface to help TypeScript compiler
interface InternalProps extends ErrorBoundaryProps {
  t: (key: string) => string;
}

class ErrorBoundaryInternal extends Component<InternalProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>{this.props.t('error.boundary.title')}</h1>
          <p>{this.props.t('error.boundary.message')}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
    const { t } = useTranslation();
    return <ErrorBoundaryInternal t={t}>{children}</ErrorBoundaryInternal>;
}