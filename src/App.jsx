// src/App.jsx
import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage        from './pages/LoginPage'
import RegisterPage     from './pages/RegisterPage'
import Layout           from './components/Layout'
import Dashboard        from './pages/Dashboard'
import Medicines        from './pages/Medicines'
import PrescriptionScan from './pages/PrescriptionScan'
import MedFriend        from './pages/MedFriend'
import Medicare         from './pages/Medicare'

// ✅ VAPID public key - replace after generating keys
const VAPID_PUBLIC_KEY = "BGQefeE6GanigTUIu9Ii4gJnq3onQZ9eHjXtQdgw9k9pqCqkhm6qc4yIPHHOI_mnR2ihxJryvEe7BT53y91G0IQ="

async function subscribeToPush() {
  try {
    const reg = await navigator.serviceWorker.ready
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY,
    })
    await fetch("https://medreminder-backends.onrender.com/api/save-subscription", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    })
    console.log("Push subscription saved!")
  } catch (err) {
    console.log("Push subscription failed:", err)
  }
}

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {

  // ✅ Ask notification permission when app loads
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          subscribeToPush()
        }
      })
    }
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#e2e8f0',
              border: '1px solid rgba(14,165,233,0.2)',
              borderRadius: '12px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '13px'
            }
          }}
        />
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index             element={<Dashboard />} />
            <Route path="medicines"  element={<Medicines />} />
            <Route path="scan"       element={<PrescriptionScan />} />
            <Route path="medfriend"  element={<MedFriend />} />
            <Route path="medicare"   element={<Medicare />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}