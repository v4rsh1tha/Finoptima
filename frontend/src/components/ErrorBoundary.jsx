import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.emoji}>&#9888;&#65039;</div>
            <h1 style={styles.heading}>Something went wrong</h1>
            <p style={styles.subtext}>
              This page ran into an issue. The rest of the app is fine.
            </p>
            <div style={styles.buttons}>
              <button style={styles.primaryBtn} onClick={this.handleGoHome}>
                Go Home
              </button>
              <button style={styles.outlineBtn} onClick={this.handleRetry}>
                Try Again
              </button>
            </div>
            {this.state.error && (
              <p style={styles.errorDetail}>
                {this.state.error.toString()}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#FAFCFB',
    padding: 24,
  },
  card: {
    textAlign: 'center',
    maxWidth: 480,
    width: '100%',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  heading: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    fontSize: 24,
    color: '#1A1A2E',
    margin: '0 0 8px',
  },
  subtext: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: 16,
    color: '#6A6B6B',
    margin: '0 0 32px',
    lineHeight: 1.5,
  },
  buttons: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 24,
  },
  primaryBtn: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    fontSize: 15,
    backgroundColor: '#1C5BC0',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px 28px',
    cursor: 'pointer',
  },
  outlineBtn: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    fontSize: 15,
    backgroundColor: 'transparent',
    color: '#1C5BC0',
    border: '2px solid #1C5BC0',
    borderRadius: 8,
    padding: '12px 28px',
    cursor: 'pointer',
  },
  errorDetail: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    color: '#9A9A9A',
    margin: 0,
    wordBreak: 'break-word',
  },
};

export default ErrorBoundary;
