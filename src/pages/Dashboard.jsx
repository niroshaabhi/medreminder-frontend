import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import AlarmModal from '../components/AlarmModal'
import toast from 'react-hot-toast'
import axios from 'axios'

import API_BASE from '../config';
const API = API_BASE;

function getMedEmoji(name = '') {
  const n = name.toLowerCase()
  if (n.includes('inhaler') || n.includes('salbutamol')) return '🌬️'
  if (n.includes('insulin'))                              return '💉'
  if (n.includes('aspirin') || n.includes('heart'))      return '💓'
  if (n.includes('metformin') || n.includes('diabetes')) return '🩸'
  return '💊'
}

function getMedColor(index) {
  const colors = [
    'rgba(14,165,233,0.12)',
    'rgba(239,68,68,0.12)',
    'rgba(16,185,129,0.12)',
    'rgba(236,72,153,0.12)',
    'rgba(245,158,11,0.12)',
    'rgba(139,92,246,0.12)',
  ]
  return colors[index % colors.length]
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [alarm, setAlarm]     = useState(null)
  const [meds, setMeds]       = useState([])
  const [loading, setLoading] = useState(true)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const firstName = (profile?.name || user?.displayName || 'Patient').split(' ')[0]
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })

  const takenCount   = meds.filter(m => m.status === 'taken').length
  const pendingCount = meds.filter(m => m.status === 'pending').length

  const saveStatuses = (updatedMeds, uid) => {
    const key = `med_status_${uid}_${getTodayKey()}`
    const statusMap = Object.fromEntries(updatedMeds.map(m => [m.id, m.status]))
    localStorage.setItem(key, JSON.stringify(statusMap))
  }

  const getSavedStatuses = (uid) => {
    const key = `med_status_${uid}_${getTodayKey()}`
    try {
      return JSON.parse(localStorage.getItem(key) || '{}')
    } catch {
      return {}
    }
  }

  const getStoredCaregivers = () => {
    if (!user) return []
    try {
      return JSON.parse(localStorage.getItem(`caregivers_${user.uid}`) || '[]')
    } catch { return [] }
  }

  useEffect(() => {
    if (!user) return
    const fetchMeds = async () => {
      try {
        setLoading(true)
        const token = await user.getIdToken()
        const res = await axios.get(`${API}/medicines/${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        const savedStatuses = getSavedStatuses(user.uid)

        const fetched = (res.data.medicines || []).map((med, i) => ({
          id:     med.id,
          name:   med.name || 'Unknown Medicine',
          detail: `${med.condition ? `${med.condition} · ` : ''}${med.dosage || ''}`.trim(),
          time:   med.times?.[0] || '—',
          emoji:  getMedEmoji(med.name || ''),
          status: savedStatuses[med.id] || 'pending',
          mode:   med.mode || 'flex',
          color:  getMedColor(i),
        }))
        setMeds(fetched)
      } catch (err) {
        console.error(err)
        toast.error('Could not load medicines')
        setMeds([])
      } finally {
        setLoading(false)
      }
    }
    fetchMeds()
  }, [user])

  useEffect(() => {
    if (meds.length === 0) return
    const pending = meds.find(m => m.status === 'pending')
    if (pending) {
      const t = setTimeout(() => setAlarm(pending), 2500)
      return () => clearTimeout(t)
    }
  }, [meds])

  const notifyCaregivers = async (endpoint, medicineName, token) => {
    const caregivers = getStoredCaregivers()
    if (caregivers.length === 0) return
    try {
      await axios.post(`${API}/notify/${endpoint}`, {
        caregivers:   caregivers,
        patientName:  firstName,
        medicineName: medicineName,
      }, { headers: { Authorization: `Bearer ${token}` } })
    } catch (err) {
      console.error(`Failed to notify caregivers (${endpoint}):`, err)
    }
  }

  const markTaken = async (id) => {
    // ✅ Find medicine BEFORE clearing alarm
    const takenMed = meds.find(m => m.id === id)

    setMeds(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, status: 'taken' } : m)
      saveStatuses(updated, user.uid)
      return updated
    })
    toast.success('✅ Medicine marked as taken!')
    setAlarm(null)

    try {
      const token = await user.getIdToken()

      await axios.post(`${API}/medicines/${user.uid}/${id}/confirm`,
        { action: 'taken' },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (takenMed) {
        await notifyCaregivers('taken', takenMed.name || 'a medicine', token)
      }

    } catch (err) {
      console.error(err)
    }
  }

  const markSkip = async (id) => {
    // ✅ Find medicine BEFORE clearing alarm
    const skippedMed = meds.find(m => m.id === id)

    setMeds(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, status: 'skipped' } : m)
      saveStatuses(updated, user.uid)
      return updated
    })
    toast.error('⏭️ Medicine skipped.')
    setAlarm(null)

    try {
      const token = await user.getIdToken()

      await axios.post(`${API}/medicines/${user.uid}/${id}/confirm`,
        { action: 'skip' },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (skippedMed) {
        await notifyCaregivers('missed', skippedMed.name || 'a medicine', token)
        toast('🚨 Caregivers notified about skipped medicine!', { icon: '📨' })
      }

    } catch (err) {
      console.error(err)
    }
  }

  const markLater = async (id) => {
    // ✅ Find medicine BEFORE clearing alarm
    const laterMed = meds.find(m => m.id === id)

    toast('⏰ Reminder snoozed for 30 minutes.', { icon: '🔔' })
    setAlarm(null)

    try {
      const token = await user.getIdToken()

      await axios.post(`${API}/medicines/${user.uid}/${id}/confirm`,
        { action: 'later' },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (laterMed) {
        await notifyCaregivers('missed', laterMed.name || 'a medicine', token)
        toast('📨 Caregivers notified — snoozed reminder!', { icon: '⏰' })
      }

    } catch (err) {
      console.error('markLater error:', err)
      toast.error('Failed to notify caregivers')
    }

    // ✅ Re-trigger alarm after 30 minutes
    if (laterMed) {
      setTimeout(() => setAlarm(laterMed), 30 * 60 * 1000)
    }
  }

  return (
    <div className="fade-up">
      <div style={{ fontFamily:'Sora', fontSize:26, fontWeight:700, color:'#fff', marginBottom:4 }}>
        {greeting}, {firstName} 👋
      </div>
      <div style={{ fontSize:14, color:'var(--text-muted)', marginBottom:28 }}>
        Here's your health overview for today
      </div>

      <div className="row g-3 mb-4">
        {[
          { icon:'💊', val:meds.length,  label:"Today's Medicines",  sub:`✅ ${takenCount} taken`,  subColor:'var(--accent2)', bg:'rgba(14,165,233,0.12)' },
          { icon:'📊', val:meds.length > 0 ? `${Math.round((takenCount/meds.length)*100)}%` : '—', label:"Today's Adherence", sub: takenCount > 0 ? '📈 On track' : '⏳ Pending', subColor:'var(--accent2)', bg:'rgba(16,185,129,0.12)' },
          { icon:'⏰', val:pendingCount,  label:'Pending Today', sub: meds.find(m => m.status==='pending') ? `⏰ Next: ${meds.find(m=>m.status==='pending').time}` : '✅ All done!', subColor:'var(--accent)', bg:'rgba(245,158,11,0.12)' },
          { icon:'👨‍👩‍👦', val:'2', label:'Caregivers Active', sub:'🟢 Online', subColor:'var(--accent2)', bg:'rgba(236,72,153,0.12)' },
        ].map((s, i) => (
          <div key={i} className="col-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ background:s.bg }}>{s.icon}</div>
              <div className="stat-value">{s.val}</div>
              <div className="stat-label">{s.label}</div>
              <div style={{ fontSize:12, color:s.subColor, marginTop:8 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        
        <div className="col-lg-8">
          <div className="card-custom">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
              <h6 style={{ fontFamily:'Sora', fontWeight:600, color:'#fff', margin:0 }}>Today's Schedule</h6>
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>{dateStr}</span>
            </div>

            {loading && (
              <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontSize:14 }}>
                ⏳ Loading your medicines...
              </div>
            )}

            {!loading && meds.length === 0 && (
              <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>
                <div style={{ fontSize:36, marginBottom:10 }}>💊</div>
                <div style={{ fontSize:14, fontWeight:600, color:'#fff', marginBottom:6 }}>No medicines added yet</div>
                <div style={{ fontSize:12 }}>Add medicines manually or scan a prescription to get started.</div>
              </div>
            )}

            {!loading && meds.length > 0 && (
              <div style={{ overflowX:'auto', marginTop:8 }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid var(--border)' }}>
                      {['', 'Medicine', 'Details', 'Time', 'Status'].map(h => (
                        <th key={h} style={{ padding:'8px 12px', textAlign:'left', color:'var(--text-muted)', fontWeight:600, fontSize:11, whiteSpace:'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {meds.map(med => (
                      <tr key={med.id}
                        style={{ borderBottom:'1px solid var(--border)', borderLeft: med.status === 'pending' ? '3px solid rgba(245,158,11,0.6)' : med.status === 'skipped' ? '3px solid rgba(239,68,68,0.6)' : '3px solid transparent', transition:'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'10px 12px' }}>
                          <div style={{ width:34, height:34, borderRadius:10, background:med.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
                            {med.emoji}
                          </div>
                        </td>
                        <td style={{ padding:'10px 12px' }}>
                          <span style={{ fontFamily:'Sora', fontWeight:600, color:'#fff', fontSize:13 }}>{med.name}</span>
                        </td>
                        <td style={{ padding:'10px 12px', color:'var(--text-muted)', fontSize:12 }}>{med.detail || '—'}</td>
                        <td style={{ padding:'10px 12px' }}>
                          <span className="time-badge">{med.time}</span>
                        </td>
                        <td style={{ padding:'10px 12px' }}>
                          {med.status === 'taken'
                            ? <span className="mode-ok">✅ Taken</span>
                            : med.status === 'skipped'
                            ? <span style={{ fontSize:12, color:'#ef4444', fontWeight:600 }}>⏭️ Skipped</span>
                            : <button className="btn-taken" style={{ fontSize:11, padding:'4px 10px' }}
                                onClick={() => setAlarm(med)}>⏰ Take Now</button>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && meds.length > 0 && (
              <div style={{ textAlign:'center', marginTop:14 }}>
                <button className="btn-primary-custom" onClick={() => setAlarm(meds.find(m => m.status==='pending') || meds[0])}>
                  🔔 Test Alarm
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card-custom mb-3">
            <h6 style={{ fontFamily:'Sora', fontWeight:600, color:'#fff', marginBottom:18 }}>Adherence</h6>
            <div style={{ display:'flex', alignItems:'center', gap:20 }}>
              <div style={{ position:'relative', width:110, height:110, flexShrink:0 }}>
                <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform:'rotate(-90deg)' }}>
                  <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(14,165,233,0.1)" strokeWidth="10"/>
                  <circle cx="55" cy="55" r="46" fill="none" stroke="url(#grad)" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray="289"
                    strokeDashoffset={meds.length > 0 ? 289 - (takenCount / meds.length) * 289 : 289}
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%">
                      <stop offset="0%" stopColor="#0ea5e9"/>
                      <stop offset="100%" stopColor="#06b6d4"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontFamily:'Sora', fontSize:24, fontWeight:700, color:'#fff', lineHeight:1 }}>
                    {meds.length > 0 ? `${Math.round((takenCount/meds.length)*100)}%` : '—'}
                  </span>
                  <span style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>Today</span>
                </div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>
                  {takenCount} of {meds.length} taken today
                </div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>Streak</div>
                <div style={{ fontFamily:'Sora', fontSize:16, fontWeight:700, color:'var(--accent)' }}>🔥 Keep it up!</div>
              </div>
            </div>
          </div>

          <div className="card-custom">
            <h6 style={{ fontFamily:'Sora', fontWeight:600, color:'#fff', marginBottom:14 }}>AI Insights 🤖</h6>
            <div style={{ background:'rgba(14,165,233,0.06)', border:'1px solid rgba(14,165,233,0.15)', borderRadius:12, padding:12, marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--primary)', marginBottom:4 }}>⚡ Smart Suggestion</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>
                {meds.length > 0
                  ? `You have ${pendingCount} medicine${pendingCount !== 1 ? 's' : ''} pending today. Stay on track!`
                  : 'Add your medicines to get personalised AI suggestions.'}
              </div>
            </div>
            <div style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:12, padding:12 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--accent2)', marginBottom:4 }}>
                {takenCount > 0 ? '✅ Great job!' : '💡 Tip'}
              </div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>
                {takenCount > 0
                  ? `${takenCount} medicine${takenCount !== 1 ? 's' : ''} taken on time today. Keep it up!`
                  : 'Taking medicines at the same time each day helps build a healthy habit.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlarmModal
        open={!!alarm}
        onClose={() => setAlarm(null)}
        onTaken={() => alarm && markTaken(alarm.id)}
        onSkip={() => alarm && markSkip(alarm.id)}
        onLater={() => alarm && markLater(alarm.id)}
        medicine={alarm ? { name:alarm.name, detail:alarm.detail } : null}
      />
    </div>
  )
}