// src/main.jsx - FINAL FIXED VERSION
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App.jsx';
import './index.css';

// ============================================
// ERROR BOUNDARY COMPONENT
// ============================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 ERROR BOUNDARY CAUGHT:', {
      message: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
    
    this.setState(prev => ({ 
      error, 
      errorInfo,
      errorCount: prev.errorCount + 1
    }));

    // Log Redux state when error occurs
    try {
      const state = store.getState();
      console.error('Redux State at Error:', {
        auth: state.auth,
        gigs: state.gigs,
        bids: state.bids,
        notifications: state.notifications
      });
    } catch (e) {
      console.error('Could not get Redux state:', e);
    }
  }

  handleReset = () => {
    // Clear error state
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Reload page
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          padding: '20px'
        }}>
          <div style={{ 
            maxWidth: '600px', 
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            padding: '40px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{ 
                color: '#dc2626', 
                fontSize: '32px', 
                marginBottom: '10px',
                fontWeight: 'bold'
              }}>
                ⚠️ Something Went Wrong
              </h1>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                The application encountered an error
              </p>
            </div>

            <details style={{ 
              marginBottom: '30px',
              backgroundColor: '#f3f4f6',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: 'bold',
                color: '#374151',
                marginBottom: '10px'
              }}>
                🔍 Click to see error details
              </summary>
              <div style={{ 
                marginTop: '15px',
                fontSize: '13px',
                fontFamily: 'monospace'
              }}>
                <div style={{ 
                  marginBottom: '10px',
                  padding: '10px',
                  backgroundColor: '#fee2e2',
                  borderLeft: '4px solid #dc2626',
                  borderRadius: '4px'
                }}>
                  <strong>Error:</strong><br/>
                  {this.state.error?.toString()}
                </div>
                
                {this.state.error?.stack && (
                  <pre style={{ 
                    overflow: 'auto',
                    padding: '10px',
                    backgroundColor: '#1f2937',
                    color: '#f3f4f6',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}>
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            </details>

            <div style={{ 
              display: 'flex', 
              gap: '15px',
              justifyContent: 'center'
            }}>
              <button 
                onClick={this.handleReset}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 2px 4px rgba(37,99,235,0.3)'
                }}
              >
                🔄 Reset & Reload
              </button>

              <button 
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                ↻ Just Reload
              </button>
            </div>

            <div style={{
              marginTop: '30px',
              padding: '15px',
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              border: '1px solid #fbbf24'
            }}>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                color: '#92400e',
                textAlign: 'center'
              }}>
                💡 If this keeps happening, try clearing your browser cache
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================
// EXPOSE STORE TO WINDOW (for debugging)
// ============================================
if (typeof window !== 'undefined') {
  window.store = store;
  console.log('✅ Redux store exposed on window.store');
}

// ============================================
// RENDER APP
// ============================================
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);