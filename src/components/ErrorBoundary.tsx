import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--color-surface-bg)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-sans)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '1.5rem',
            borderRadius: '50%',
            marginBottom: '1.5rem',
            color: 'var(--color-error)'
          }}>
            <AlertTriangle size={48} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', marginBottom: '2rem', lineHeight: 1.6 }}>
            An unexpected error occurred. This could be due to a local database sync issue or offline state.
          </p>
          {this.state.error && (
            <pre style={{
              background: 'var(--color-code-bg)',
              border: '1px solid var(--color-border)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              maxWidth: '600px',
              overflowX: 'auto',
              fontSize: '0.85rem',
              marginBottom: '2rem',
              color: 'var(--color-error)',
              textAlign: 'left',
              width: '100%'
            }}>
              {this.state.error.toString()}
            </pre>
          )}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="primary" icon={RefreshCw} onClick={this.handleReset}>
              Reload Application
            </Button>
            <Button variant="secondary" icon={Home} onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}>
              Go to Homepage
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
