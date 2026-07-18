import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error", error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#ff4c4c', background: '#0d1117', height: '100vh', fontFamily: 'monospace' }}>
          <h2>Something went wrong in React.</h2>
          <pre style={{ background: '#21262d', padding: '20px', borderRadius: '8px', overflow: 'auto' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.info && this.state.info.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
