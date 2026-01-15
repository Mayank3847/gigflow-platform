// ============================================
// EMERGENCY SAFE WRAPPER COMPONENT
// Add this to: src/components/SafeComponent.jsx
// ============================================

import { Component } from 'react';

class SafeComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component Error:', this.props.name || 'Unknown', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Failed to load {this.props.name || 'component'}</p>
          <button onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SafeComponent;

