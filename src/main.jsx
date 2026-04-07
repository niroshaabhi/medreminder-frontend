// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

// ✅ STEP 1: Clear old broken service worker cache FIRST
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((reg) => reg.unregister())
    console.log('🧹 Old SW cleared')
  })
}

// ✅ STEP 2: Mount React App
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// ✅ STEP 3: Register NEW service worker after app loads
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('✅ SW registered:', reg))
      .catch((err) => console.error('❌ SW failed:', err))
  })
}