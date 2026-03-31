// src/pages/RegisterPage.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const CONDITIONS = [
  { key:'Diabetes',    emoji:'🩸', cls:'sel-diabetes' },
  { key:'Hypertension',emoji:'❤️', cls:'sel-hypertension' },
  { key:'Asthma',      emoji:'🌬️', cls:'sel-asthma' },
  { key:'Heart Disease',emoji:'💓',cls:'sel-heart' },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]         = useState({ name:'', email:'', age:'', gender:'', password:'' })
  const [conditions, setConds]  = useState([])
  const [loading, setLoading]   = useState(false)

  const toggleCond = (key) => {
    setConds(prev => prev.includes(key) ? prev.filter(c=>c!==key) : [...prev, key])
  }

  const handle = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { toast.error('Please fill in required fields'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, {
        age: form.age, gender: form.gender, conditions
      })
      toast.success('🎉 Account created! Welcome to MedRemind')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-dark)',position:'relative',overflow:'hidden',padding:'24px 0' }}>
      <div style={{ position:'absolute',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(14,165,233,0.1) 0%,transparent 70%)',top:-100,right:-100,pointerEvents:'none' }}/>

      <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:24,padding:'48px 40px',width:'100%',maxWidth:480,boxShadow:'var(--glow)',position:'relative',zIndex:1 }} className="fade-up">
        <div style={{ display:'inline-flex',alignItems:'center',gap:10,background:'linear-gradient(135deg,rgba(14,165,233,0.15),rgba(6,182,212,0.1))',border:'1px solid var(--border)',borderRadius:50,padding:'8px 20px 8px 12px',marginBottom:28 }}>
          <div style={{ width:36,height:36,background:'linear-gradient(135deg,#0ea5e9,#06b6d4)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>💊</div>
          <span style={{ fontFamily:'Sora',fontSize:20,fontWeight:700,color:'var(--primary)' }}>MedRemind</span>
        </div>

        <h2 style={{ fontFamily:'Sora',fontSize:28,fontWeight:700,color:'#fff',marginBottom:6 }}>Create Profile</h2>
        <p style={{ color:'var(--text-muted)',fontSize:14,marginBottom:32 }}>Set up your patient account</p>

        <form onSubmit={handle}>
          <div className="mb-3">
            <label className="form-label">Full Name *</label>
            <input type="text" className="form-control" placeholder="John Doe"
              value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="form-label">Email *</label>
            <input type="email" className="form-control" placeholder="patient@email.com"
              value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="form-label">Age & Gender</label>
            <div style={{ display:'flex',gap:10 }}>
              <input type="number" className="form-control" placeholder="Age" style={{ width:100 }}
                value={form.age} onChange={e => setForm({...form, age:e.target.value})} />
              <select className="form-select"
                value={form.gender} onChange={e => setForm({...form, gender:e.target.value})}>
                <option value="">Gender</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Medical Conditions</label>
            <div>
              {CONDITIONS.map(c => (
                <span
                  key={c.key}
                  className={`disease-tag ${conditions.includes(c.key) ? 'active' : ''}`}
                  onClick={() => toggleCond(c.key)}
                >
                  {c.emoji} {c.key}
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label">Password *</label>
            <input type="password" className="form-control" placeholder="Create a strong password"
              value={form.password} onChange={e => setForm({...form, password:e.target.value})} />
          </div>
          <button type="submit" className="btn-primary-custom" style={{ width:'100%',justifyContent:'center' }} disabled={loading}>
            {loading ? '⏳ Creating account...' : '👤 Create Account'}
          </button>
        </form>

        <p style={{ textAlign:'center',marginTop:20,fontSize:13,color:'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color:'var(--primary)',textDecoration:'none',fontWeight:500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
