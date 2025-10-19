'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import ErrorFallback from './ErrorFallback';

interface AppErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
  fallback?: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  // 全体エラーのログ出力とフェイルセーフ表示を担う
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled application error', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorFallback
          onRetry={this.handleReset}
          supportContent={
            <p className="text-xs text-red-100">
              それでも解決しない場合はブラウザを再読み込みし、再度アクセスしてください。
            </p>
          }
        />
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
