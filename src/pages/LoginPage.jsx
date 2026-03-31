// src/pages/LoginPage.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('🎉 Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-dark)',position:'relative',overflow:'hidden' }}>
      {/* Glow blobs */}
      <div style={{ position:'absolute',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(14,165,233,0.1) 0%,transparent 70%)',top:-100,left:-100,pointerEvents:'none' }}/>
      <div style={{ position:'absolute',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 70%)',bottom:-80,right:-80,pointerEvents:'none' }}/>

      <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:24,padding:'48px 40px',width:'100%',maxWidth:440,boxShadow:'var(--glow)',position:'relative',zIndex:1 }} className="fade-up">
        {/* Logo */}
        <div style={{ display:'inline-flex',alignItems:'center',gap:10,background:'linear-gradient(135deg,rgba(14,165,233,0.15),rgba(6,182,212,0.1))',border:'1px solid var(--border)',borderRadius:50,padding:'8px 20px 8px 12px',marginBottom:28 }}>
          <div style={{ width:36,height:36,background:'linear-gradient(135deg,#0ea5e9,#06b6d4)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>💊</div>
          <span style={{ fontFamily:'Sora',fontSize:20,fontWeight:700,color:'var(--primary)' }}>MedRemind</span>
        </div>

        <h2 style={{ fontFamily:'Sora',fontSize:28,fontWeight:700,color:'#fff',marginBottom:6 }}>Welcome back</h2>
        <p style={{ color:'var(--text-muted)',fontSize:14,marginBottom:32 }}>Smart medicine reminders for better health</p>

        <form onSubmit={handle}>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" placeholder="patient@email.com"
              value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
          </div>
          <div className="mb-4">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password:e.target.value})} />
          </div>
          <button type="submit" className="btn-primary-custom" style={{ width:'100%',justifyContent:'center' }} disabled={loading}>
            {loading ? '⏳ Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign:'center',marginTop:20,fontSize:13,color:'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color:'var(--primary)',textDecoration:'none',fontWeight:500 }}>Create one</Link>
        </p>

        {/* Demo hint */}
        <div style={{ marginTop:20,padding:'10px 14px',background:'rgba(14,165,233,0.05)',border:'1px solid rgba(14,165,233,0.15)',borderRadius:12,textAlign:'center' }}>
          <p style={{ fontSize:11,color:'var(--text-muted)',margin:0 }}>
            💡 Demo: Register first, then login with your credentials
          </p>
        </div>
      </div>
    </div>
  )
}
