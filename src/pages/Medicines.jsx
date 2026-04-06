import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import axios from 'axios'

import API_BASE from '../config';
const API = API_BASE;

const BLANK = { name:'', dosage:'', freq:'Once daily', condition:'🩸 Diabetes', time1:'08:00', time2:'', mode:'flex' }

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

export default function Medicines() {
  const { user } = useAuth()
  const [meds, setMeds]         = useState([])
  const [form, setForm]         = useState(BLANK)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchMeds = async () => {
      try {
        setFetching(true)
        const token = await user.getIdToken()
        const res = await axios.get(`${API}/medicines/${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const fetched = (res.data.medicines || []).map((med, i) => ({
          id:        med.id,
          name:      med.name || 'Unknown',
          dosage:    med.dosage || '',
          freq:      med.freq || 'Once daily',
          condition: med.condition || '',
          emoji:     getMedEmoji(med.name || ''),
          mode:      med.mode || 'flex',
          times:     med.times || [],
          color:     getMedColor(i),
        }))
        setMeds(fetched)
      } catch (err) {
        console.error(err)
        toast.error('Could not load medicines')
      } finally {
        setFetching(false)
      }
    }
    fetchMeds()
  }, [user])

  const addMed = async (e) => {
    e.preventDefault()
    if (!form.name || !form.dosage) {
      toast.error('Please fill in medicine name and dosage')
      return
    }
    setLoading(true)
    try {
      const token = await user.getIdToken()
      const payload = {
        name:      form.name,
        dosage:    form.dosage,
        freq:      form.freq,
        condition: form.condition,
        mode:      form.mode,
        times:     [form.time1, form.time2].filter(Boolean),
      }
      const res = await axios.post(`${API}/medicines/${user.uid}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const newMed = {
        id:        res.data.medicine?.id || Date.now(),
        name:      form.name,
        dosage:    form.dosage,
        freq:      form.freq,
        condition: form.condition,
        emoji:     getMedEmoji(form.name),
        mode:      form.mode,
        times:     [form.time1, form.time2].filter(Boolean),
        color:     getMedColor(meds.length),
      }
      setMeds(prev => [...prev, newMed])
      toast.success(`✅ ${form.name} added to your schedule!`)
      setForm(BLANK)
      setShowForm(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to add medicine')
    } finally {
      setLoading(false)
    }
  }

  const deleteMed = async (id) => {
    try {
      const token = await user.getIdToken()
      await axios.delete(`${API}/medicines/${user.uid}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMeds(prev => prev.filter(m => m.id !== id))
      toast.success('🗑️ Medicine removed')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete medicine')
    }
  }

  return (
    <div className="fade-up">
      <div style={{ fontFamily:'Sora', fontSize:26, fontWeight:700, color:'#fff', marginBottom:4 }}>My Medicines 💊</div>
      <div style={{ fontSize:14, color:'var(--text-muted)', marginBottom:28 }}>Manage your medication schedule</div>

      <div className="row g-3">
        <div className={showForm ? 'col-lg-7' : 'col-12'}>
          <div className="card-custom">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
              <h6 style={{ fontFamily:'Sora', fontWeight:600, color:'#fff', margin:0 }}>
                Active Medicines ({meds.length})
              </h6>
              <button className="btn-primary-custom" style={{ padding:'8px 16px', fontSize:12 }}
                onClick={() => setShowForm(true)}>
                + Add Medicine
              </button>
            </div>

            {fetching && (
              <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontSize:14 }}>
                ⏳ Loading your medicines...
              </div>
            )}

            {!fetching && meds.length === 0 && (
              <div style={{ textAlign:'center', padding:'2.5rem 1rem', color:'var(--text-muted)' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>💊</div>
                <div style={{ fontSize:14, fontWeight:600, color:'#fff', marginBottom:6 }}>No medicines yet</div>
                <div style={{ fontSize:12 }}>Add medicines manually using the button above,<br/>or scan a prescription to import them automatically.</div>
              </div>
            )}

            {!fetching && meds.length > 0 && (
              <div style={{ overflowX:'auto', marginTop:8 }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid var(--border)' }}>
                      {['', 'Medicine', 'Dosage', 'Frequency', 'Condition', 'Times', 'Mode', 'Action'].map(h => (
                        <th key={h} style={{ padding:'8px 12px', textAlign:'left', color:'var(--text-muted)', fontWeight:600, fontSize:11, whiteSpace:'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {meds.map(med => (
                      <tr key={med.id}
                        style={{ borderBottom:'1px solid var(--border)', transition:'background 0.15s' }}
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
                        <td style={{ padding:'10px 12px', color:'var(--text-muted)' }}>{med.dosage || '—'}</td>
                        <td style={{ padding:'10px 12px', color:'var(--text-muted)' }}>{med.freq}</td>
                        <td style={{ padding:'10px 12px', color:'var(--text-muted)' }}>{med.condition || '—'}</td>
                        <td style={{ padding:'10px 12px' }}>
                          {med.times.map(t => (
                            <span key={t} className="time-badge" style={{ marginRight:4, fontSize:10 }}>{t}</span>
                          ))}
                        </td>
                        <td style={{ padding:'10px 12px' }}>
                          <span className={`mode-badge ${med.mode === 'flex' ? 'mode-flex' : 'mode-strict'}`}>
                            {med.mode === 'flex' ? '🤖 Flexible' : '🔒 Strict'}
                          </span>
                        </td>
                        <td style={{ padding:'10px 12px' }}>
                          <button className="btn-skip" style={{ fontSize:11, padding:'4px 10px' }}
                            onClick={() => deleteMed(med.id)}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {showForm && (
          <div className="col-lg-5">
            <div className="card-custom">
              <h6 style={{ fontFamily:'Sora', fontWeight:600, color:'#fff', marginBottom:18 }}>➕ Add New Medicine</h6>
              <form onSubmit={addMed}>
                <div className="mb-3">
                  <label className="form-label">Medicine Name *</label>
                  <input className="form-control" placeholder="e.g. Metformin 500mg"
                    value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Dosage *</label>
                  <input className="form-control" placeholder="e.g. 1 tablet after meals"
                    value={form.dosage} onChange={e => setForm({...form, dosage:e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Frequency</label>
                  <select className="form-select" value={form.freq} onChange={e => setForm({...form, freq:e.target.value})}>
                    <option>Once daily</option>
                    <option>Twice daily</option>
                    <option>Three times daily</option>
                    <option>As needed</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Condition</label>
                  <select className="form-select" value={form.condition} onChange={e => setForm({...form, condition:e.target.value})}>
                    <option>🩸 Diabetes</option>
                    <option>❤️ Hypertension</option>
                    <option>🌬️ Asthma</option>
                    <option>💓 Heart Disease</option>
                    <option>🧠 Neurological</option>
                    <option>🦴 Bone & Joint</option>
                    <option>💊 Other</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Reminder Time</label>
                  <input type="time" className="form-control" value={form.time1}
                    onChange={e => setForm({...form, time1:e.target.value})} />
                </div>
                {form.freq.includes('Twice') && (
                  <div className="mb-3">
                    <label className="form-label">Second Reminder</label>
                    <input type="time" className="form-control" value={form.time2}
                      onChange={e => setForm({...form, time2:e.target.value})} />
                  </div>
                )}
                <div className="mb-4">
                  <label className="form-label">Reminder Mode</label>
                  <div style={{ display:'flex', gap:10 }}>
                    <div className={`mode-opt ${form.mode === 'flex' ? 'sel-flex' : ''}`}
                      onClick={() => setForm({...form, mode:'flex'})}>
                      <div style={{ fontSize:22, marginBottom:4 }}>🤖</div>
                      <div style={{ fontSize:12, fontWeight:600 }}>Flexible</div>
                      <div style={{ fontSize:10, color:'var(--text-muted)' }}>AI adjusts timing</div>
                    </div>
                    <div className={`mode-opt ${form.mode === 'strict' ? 'sel-strict' : ''}`}
                      onClick={() => setForm({...form, mode:'strict'})}>
                      <div style={{ fontSize:22, marginBottom:4 }}>🔒</div>
                      <div style={{ fontSize:12, fontWeight:600 }}>Strict</div>
                      <div style={{ fontSize:10, color:'var(--text-muted)' }}>Fixed time always</div>
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn-primary-custom"
                  style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
                  {loading ? '⏳ Saving...' : '💾 Save Medicine'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ width:'100%', marginTop:8, background:'transparent', border:'1px solid var(--border)', color:'var(--text-muted)', padding:'10px', borderRadius:12, cursor:'pointer', fontSize:13 }}>
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="row g-3 mt-2">
        <div className="col-md-6">
          <div style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.15)', borderRadius:14, padding:16 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--accent)', marginBottom:6 }}>🤖 Flexible Mode — AI Learns Your Habits</div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>If you always take your 9:00 AM medicine at 9:15 AM, the AI gradually shifts the reminder to 9:15 AM so you don't get annoyed.</div>
          </div>
        </div>
        <div className="col-md-6">
          <div style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:14, padding:16 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--danger)', marginBottom:6 }}>🔒 Strict Mode — Never Changes</div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>Best for insulin, blood pressure meds. The reminder fires at the exact time, every day, no matter what.</div>
          </div>
        </div>
      </div>
    </div>
  )
}