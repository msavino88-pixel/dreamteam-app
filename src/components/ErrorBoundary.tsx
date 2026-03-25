import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] React crashed:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'Inter, system-ui, sans-serif',
          background: '#F4F5F8',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '28px',
            padding: '2.5rem',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0px 8px 24px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Qualcosa è andato storto
            </h2>
            <p style={{ color: '#8B8D98', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {this.state.error?.message || 'Errore sconosciuto'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              style={{
                background: '#D4FF33',
                color: '#1A1B1E',
                border: 'none',
                borderRadius: '16px',
                padding: '0.75rem 2rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Torna alla Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
