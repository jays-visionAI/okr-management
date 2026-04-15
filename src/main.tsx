import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { useMockServiceWorker } from './hooks/useMockServiceWorker';

// Wrapper component that handles MSW initialization
function AppWrapper() {
  const { isReady, error } = useMockServiceWorker();

  if (!isReady) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading application...</p>
      </div>
    );
  }

  if (error) {
    console.warn('[App] MSW initialization warning:', error);
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);