// src/components/Layout.jsx
import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import AlarmModal from './AlarmModal'

const navItems = [
  { to: '/',           icon: '🏠', label: 'Dashboard' },
  { to: '/medicines',  icon: '💊', label: 'My Medicines',     badge: '5' },
  { to: '/scan',       icon: '📋', label: 'Prescription Scan' },
  { to: '/medfriend',  icon: '👨‍👩‍👦', label: 'MedFriend',        badge: '2', badgeColor: '#10b981' },
    { to: '/medicare',   icon: '🏥', label: 'Medicare' },
]

export default function Layout() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [alarmOpen, setAlarmOpen]     = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('👋 Logged out successfully')
    navigate('/login')
  }

  const initials = (profile?.name || user?.displayName || 'U').charAt(0).toUpperCase()
  const displayName = profile?.name || user?.displayName || 'Patient'
  const conditions  = profile?.conditions?.join(' · ') || '🏥 Patient'

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg-dark)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:99 }}
        />
      )}

      {/* SIDEBAR */}
      <aside style={{
        width:260, minHeight:'100vh',
        background:'var(--bg-sidebar)', borderRight:'1px solid var(--border)',
        display:'flex', flexDirection:'column',
        position:'fixed', top:0, left:0, zIndex:100,
        transform: sidebarOpen ? 'translateX(0)' : window.innerWidth < 768 ? 'translateX(-100%)' : 'translateX(0)',
        transition:'transform 0.3s'
      }}>
        {/* Logo */}
        <div style={{ padding:'24px 20px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,#0ea5e9,#06b6d4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>💊</div>
          <span style={{ fontFamily:'Sora',fontSize:18,fontWeight:700,color:'var(--primary)' }}>MedRemind</span>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'16px 12px', overflowY:'auto' }}>
          <div style={{ fontSize:10,fontWeight:600,color:'var(--text-muted)',letterSpacing:'1.2px',textTransform:'uppercase',padding:'8px 12px 6px',marginTop:8 }}>Main</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:12,
                padding:'11px 14px', borderRadius:12, marginBottom:3,
                cursor:'pointer', transition:'all 0.2s',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                background: isActive ? 'linear-gradient(135deg,rgba(14,165,233,0.15),rgba(6,182,212,0.08))' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(14,165,233,0.2)' : 'transparent'}`,
                textDecoration:'none', fontSize:14, fontWeight:500,
              })}
            >
              <span style={{ width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8,fontSize:16 }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {item.badge && (
                <span style={{ background: item.badgeColor || '#ef4444', color:'#fff', fontSize:10, fontWeight:700, borderRadius:50, padding:'2px 7px' }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

          <div style={{ fontSize:10,fontWeight:600,color:'var(--text-muted)',letterSpacing:'1.2px',textTransform:'uppercase',padding:'8px 12px 6px',marginTop:8 }}>Actions</div>

          <div
            onClick={() => setAlarmOpen(true)}
            style={{ display:'flex',alignItems:'center',gap:12,padding:'11px 14px',borderRadius:12,marginBottom:3,cursor:'pointer',color:'var(--text-muted)',fontSize:14,fontWeight:500,border:'1px solid transparent',transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background='var(--glass)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            <span style={{ width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8,fontSize:16 }}>🔔</span>
            Test Alarm
          </div>

          <div
            onClick={handleLogout}
            style={{ display:'flex',alignItems:'center',gap:12,padding:'11px 14px',borderRadius:12,marginBottom:3,cursor:'pointer',color:'var(--text-muted)',fontSize:14,fontWeight:500,border:'1px solid transparent',transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background='var(--glass)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            <span style={{ width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8,fontSize:16 }}>🚪</span>
            Logout
          </div>
        </nav>

        {/* User pill */}
        <div style={{ padding:'16px 12px', borderTop:'1px solid var(--border)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:12,background:'var(--glass)',border:'1px solid var(--border)' }}>
            <div style={{ width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#0ea5e9,#06b6d4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#fff',flexShrink:0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize:13,fontWeight:500,color:'var(--text)' }}>{displayName}</div>
              <div style={{ fontSize:11,color:'var(--text-muted)' }}>{conditions}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: window.innerWidth >= 768 ? 260 : 0, flex:1, padding:28, minHeight:'100vh' }}>
        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          style={{ display: window.innerWidth < 768 ? 'flex' : 'none', alignItems:'center',justifyContent:'center',width:38,height:38,borderRadius:10,background:'var(--glass)',border:'1px solid var(--border)',color:'var(--text)',cursor:'pointer',fontSize:16,marginBottom:16 }}
        >☰</button>
        <Outlet />
      </main>

      <AlarmModal
        open={alarmOpen}
        onClose={() => setAlarmOpen(false)}
        medicine={{ name:'Metformin 500mg', detail:'1 tablet after breakfast · 🩸 Diabetes' }}
      />
    </div>
  )
}
