import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '8px',
          background: '#1e293b',
          color: '#f1f5f9',
          fontSize: '14px',
        },
        success: {
          iconTheme: { primary: '#22c55e', secondary: '#f0fdf4' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#fef2f2' },
        },
      }}
    />
    <App />
  </React.StrictMode>,
);
