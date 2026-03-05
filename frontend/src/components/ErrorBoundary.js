import React from 'react';

export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#FAFAF8',
          color: '#333',
        }}>
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>Oscars Pizzeria</h1>
          <p style={{ marginBottom: 24, textAlign: 'center' }}>
            Noe gikk galt. Prøv å laste siden på nytt.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1a1a1a',
              color: 'white',
              border: 'none',
              borderRadius: 24,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Last inn på nytt
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
