import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: '#191d36',
          color: '#e2e6f3',
          border: '1px solid rgba(99,114,245,0.2)',
          borderRadius: '12px',
          fontSize: '14px',
          fontFamily: 'Outfit, sans-serif',
        },
        success: {
          iconTheme: { primary: '#06d6c7', secondary: '#0d0f1a' },
        },
        error: {
          iconTheme: { primary: '#ff4d6d', secondary: '#0d0f1a' },
        },
      }}
    />
  </React.StrictMode>,
)
