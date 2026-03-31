// src/components/AlarmModal.jsx
import React, { useEffect } from 'react'

export default function AlarmModal({ open, onClose, onTaken, onSkip, onLater, medicine }) {
  useEffect(() => {
    if (open) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const osc = ctx.createOscillator()
        osc.connect(ctx.destination)
        osc.frequency.value = 880
        osc.start(); osc.stop(ctx.currentTime + 0.3)
      } catch (_) {}
    }
  }, [open])

  if (!open) return null

  const confirm = (action) => {
    // ✅ Now calls the correct prop function from Dashboard
    if (action === 'taken' && onTaken) onTaken()
    if (action === 'skip'  && onSkip)  onSkip()
    if (action === 'later' && onLater) onLater()
  }

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(6px)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:24,padding:'40px 36px',textAlign:'center',maxWidth:380,width:'90%',boxShadow:'0 0 60px rgba(14,165,233,0.25)',animation:'fadeUp 0.3s ease' }}>
        <div style={{ width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,#0ea5e9,#06b6d4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,margin:'0 auto 16px',animation:'pulse 1.5s infinite' }}>
          💊
        </div>
        <h4 style={{ fontFamily:'Sora',fontSize:20,fontWeight:700,color:'#fff',marginBottom:6 }}>
          {medicine?.name || 'Medicine Reminder'}
        </h4>
        <p style={{ fontSize:13,color:'var(--text-muted)',marginBottom:24 }}>
          {medicine?.detail || 'Time to take your medicine'}
        </p>
        <div style={{ display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap' }}>
          <button className="btn-taken" style={{ padding:'10px 20px' }} onClick={() => confirm('taken')}>✅ Taken</button>
          <button className="btn-later" style={{ padding:'10px 20px' }} onClick={() => confirm('later')}>⏰ Later</button>
          <button className="btn-skip"  style={{ padding:'10px 20px' }} onClick={() => confirm('skip')}>❌ Skip</button>
        </div>
        <p style={{ fontSize:11,color:'var(--text-muted)',marginTop:18 }}>
          Caregiver notified if no response in 5 mins
        </p>
      </div>
    </div>
  )
}