
import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import axios from 'axios'

const API = 'http://localhost:5000/api'

const BLANK_MED = { name: '', dosage: '', freq: 'Once daily', condition: '💊 Other', times: ['08:00'], mode: 'flex' }

const FREQ_OPTIONS   = ['Once daily', 'Twice daily', 'Three times daily', 'As needed']
const CONDITION_OPTS = ['🩸 Diabetes','❤️ Hypertension','🌬️ Asthma','💓 Heart Disease','🧠 Neurological','🦴 Bone & Joint','💊 Other']

function getMedEmoji(name = '') {
  const n = name.toLowerCase()
  if (n.includes('inhaler') || n.includes('salbutamol')) return '🌬️'
  if (n.includes('insulin'))                              return '💉'
  if (n.includes('aspirin') || n.includes('heart'))      return '💓'
  if (n.includes('metformin') || n.includes('diabetes')) return '🩸'
  return '💊'
}

export default function PrescriptionScan() {
  const { user } = useAuth()

  const [preview,    setPreview]    = useState(null)
  const [results,    setResults]    = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [drag,       setDrag]       = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [manualMed,  setManualMed]  = useState({ ...BLANK_MED })
  const [manualList, setManualList] = useState([])

  // ✅ ADD HERE — after all useState, before useRef
  useEffect(() => {
    if (!user) return
    const fetchSaved = async () => {
      try {
        const token = await user.getIdToken()
        const res   = await axios.get(`${API}/medicines/${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const fetched = (res.data.medicines || []).map((m, i) => ({
          ...m,
          emoji:    getMedEmoji(m.name || ''),
          selected: true,
          _id:      m.id || `saved_${i}`,
        }))
        if (fetched.length > 0) {
          setResults(fetched)
          setSaved(true)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchSaved()
  }, [user])
  // ✅ END — next line is useRef

     // ← this line was already here, nothing changes below
  const inputRef = useRef()

  const handleFile = async (file) => {
    if (!file) return
    setPreview({ url: URL.createObjectURL(file), name: file.name, type: file.type })
    setResults(null)
    setSaved(false)
    setLoading(true)
    toast('🤖 AI is analyzing your prescription...', { icon: '🔍' })

    try {
      const token    = await user.getIdToken()
      const formData = new FormData()
      formData.append('prescription', file)
      formData.append('uid', user.uid)

      // ✅ FIXED: correctly calls scan endpoint
      const res = await axios.post(`${API}/scan/prescription`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      const scanned = (res.data.medicines || []).map((m, i) => ({
        ...m,
        emoji:    getMedEmoji(m.name || ''),
        selected: true,
        _id:      `scan_${i}`,
      }))

      if (scanned.length === 0) {
        toast.error('No medicines found — try a clearer image or add manually.')
      } else {
        toast.success(`✅ AI extracted ${scanned.length} medicine${scanned.length > 1 ? 's' : ''}!`)
      }
      setResults(scanned)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Scan failed. Try again or add manually.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const onDrop      = (e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }
  const onDragOver  = (e) => { e.preventDefault(); setDrag(true) }
  const onDragLeave = ()  => setDrag(false)

  const updateResult = (idx, key, val) =>
    setResults(prev => prev.map((m, i) => i === idx ? { ...m, [key]: val } : m))

  const toggleSelect = (idx) =>
    setResults(prev => prev.map((m, i) => i === idx ? { ...m, selected: !m.selected } : m))

  const addManual = () => {
    if (!manualMed.name.trim()) { toast.error('Enter a medicine name'); return }
    setManualList(prev => [...prev, {
      ...manualMed,
      emoji:    getMedEmoji(manualMed.name),
      selected: true,
      _id:      `manual_${Date.now()}`,
    }])
    setManualMed({ ...BLANK_MED })
    setShowManual(false)
    toast.success(`✅ ${manualMed.name} added to list`)
  }

  const removeManual = (id) =>
    setManualList(prev => prev.filter(m => m._id !== id))

  const allMeds      = [...(results || []), ...manualList]
  const selectedMeds = allMeds.filter(m => m.selected)

  const saveAll = async () => {
    if (selectedMeds.length === 0) { toast.error('Select at least one medicine'); return }
    setSaving(true)
    try {
      const token    = await user.getIdToken()
      const fcmToken = localStorage.getItem('fcmToken')

      await Promise.all(
        selectedMeds.map(m =>
          axios.post(`${API}/medicines/${user.uid}`, {
            name:      m.name,
            dosage:    m.dosage    || '',
            freq:      m.freq      || 'Once daily',
            condition: m.condition || '💊 Other',
            mode:      m.mode      || 'flex',
            times:     m.times     || ['08:00'],
          }, { headers: { Authorization: `Bearer ${token}` } })
        )
      )

      if (fcmToken) {
        await Promise.allSettled(
          selectedMeds.map(m =>
            axios.post(`${API}/notify/medicine-alarm`, {
              uid:      user.uid,
              fcmToken: fcmToken,
              medicine: { name: m.name, dosage: m.dosage, id: m._id },
            }, { headers: { Authorization: `Bearer ${token}` } })
          )
        )
      }

      toast.success(`🎉 ${selectedMeds.length} medicine${selectedMeds.length > 1 ? 's' : ''} saved & reminders set!`)
      // ✅ FIXED: only mark saved, don't wipe results
      setSaved(true)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Failed to save medicines')
    } finally {
      setSaving(false)
    }
  }

  // ✅ Only clear when user clicks "Scan Another"
  const reset = () => {
    setSaved(false)
    setResults(null)
    setPreview(null)
    setManualList([])
  }

  return (
    <div className="fade-up">
      <div style={{ fontFamily:'Sora',fontSize:26,fontWeight:700,color:'#fff',marginBottom:4 }}>Prescription Scan 📋</div>
      <div style={{ fontSize:14,color:'var(--text-muted)',marginBottom:28 }}>Upload your prescription — AI extracts medicine names automatically</div>

      {/* ✅ Green success banner — stays on top, results still visible */}
      {saved && (
        <div className="card-custom" style={{ marginBottom:20, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ fontSize:32 }}>✅</div>
              <div>
                <div style={{ fontFamily:'Sora', fontSize:15, fontWeight:700, color:'#fff' }}>
                  Medicines saved successfully!
                </div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                  They now appear on your Dashboard and Medicines page.
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button className="btn-primary-custom" onClick={reset}>📋 Scan Another</button>
              <a href="/medicines">
                <button className="btn-primary-custom" style={{ background:'rgba(255,255,255,0.06)' }}>
                  💊 View Medicines
                </button>
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card-custom">

            {/* Upload zone */}
            <div
              className={`upload-zone ${drag ? 'drag' : ''}`}
              style={{ borderColor:drag?'var(--primary)':undefined, background:drag?'rgba(14,165,233,0.06)':undefined }}
              onClick={() => !saved && inputRef.current?.click()}
              onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
              <div style={{ fontSize:48,marginBottom:16,opacity:0.5 }}>{preview ? '✅' : '📄'}</div>
              {preview ? (
                <>
                  <div style={{ fontFamily:'Sora',fontSize:17,fontWeight:600,color:'#fff' }}>{preview.name}</div>
                  <div style={{ fontSize:13,color:'var(--text-muted)',marginTop:6 }}>
                    {saved ? 'Saved! Click "Scan Another" to upload a new one.' : 'Click to upload a different file'}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily:'Sora',fontSize:17,fontWeight:600,color:'#fff' }}>Drop your prescription here</div>
                  <div style={{ fontSize:13,color:'var(--text-muted)',marginTop:6 }}>or click to browse files</div>
                  <div style={{ marginTop:14,display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap' }}>
                    {['JPG','PNG','PDF','HEIC'].map(t => (
                      <span key={t} style={{ fontSize:11,padding:'3px 10px',borderRadius:50,background:'var(--glass)',border:'1px solid var(--border)',color:'var(--text-muted)' }}>{t}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/*,.pdf" style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />

            {preview?.type?.startsWith('image/') && (
              <div style={{ borderRadius:14,overflow:'hidden',border:'1px solid var(--border)',marginTop:16 }}>
                <img src={preview.url} alt="Prescription" style={{ width:'100%',maxHeight:220,objectFit:'cover' }} />
              </div>
            )}

            {loading && (
              <div style={{ textAlign:'center',padding:'24px',marginTop:16 }}>
                <div style={{ fontSize:32,marginBottom:8 }}>🤖</div>
                <div style={{ fontFamily:'Sora',fontWeight:600,color:'var(--primary)',marginBottom:4 }}>Analyzing Prescription…</div>
                <div style={{ fontSize:12,color:'var(--text-muted)' }}>Extracting medicine names, dosage and frequency</div>
              </div>
            )}

            {/* ✅ Results stay visible after save */}
            {results && results.length > 0 && (
              <div style={{ background:'rgba(14,165,233,0.05)',border:'1px solid rgba(14,165,233,0.15)',borderRadius:14,padding:18,marginTop:16 }}>
                <div style={{ fontSize:13,fontWeight:600,color:'var(--primary)',marginBottom:14 }}>
                  🤖 AI Extracted {results.length} Medicine{results.length !== 1 ? 's' : ''}
                  {saved ? ' — saved ✅' : ' — review & edit before saving'}
                </div>
                {results.map((med, idx) => (
                  <div key={med._id} style={{ padding:'10px 0',borderBottom:idx < results.length-1?'1px solid var(--border)':'none',opacity:med.selected?1:0.45,transition:'opacity 0.2s' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8 }}>
                      {!saved ? (
                        <div onClick={() => toggleSelect(idx)} style={{ width:20,height:20,borderRadius:5,border:`2px solid ${med.selected?'var(--accent)':'var(--border)'}`,background:med.selected?'var(--accent)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:12,flexShrink:0 }}>
                          {med.selected && '✓'}
                        </div>
                      ) : (
                        <div style={{ width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0 }}>✅</div>
                      )}
                      <div style={{ width:34,height:34,borderRadius:10,background:'rgba(14,165,233,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0 }}>{med.emoji}</div>
                      <input
                        className="form-control"
                        style={{ flex:1,fontWeight:600,fontSize:13 }}
                        value={med.name}
                        onChange={e => updateResult(idx,'name',e.target.value)}
                        placeholder="Medicine name"
                        disabled={saved}
                      />
                    </div>
                    <div style={{ display:'flex',gap:8,flexWrap:'wrap',paddingLeft:64 }}>
                      <input className="form-control" style={{ flex:1,minWidth:130,fontSize:12 }}
                        value={med.dosage} placeholder="Dosage"
                        onChange={e => updateResult(idx,'dosage',e.target.value)} disabled={saved} />
                      <select className="form-select" style={{ flex:1,minWidth:130,fontSize:12 }}
                        value={med.freq} onChange={e => updateResult(idx,'freq',e.target.value)} disabled={saved}>
                        {FREQ_OPTIONS.map(f => <option key={f}>{f}</option>)}
                      </select>
                      <input type="time" className="form-control" style={{ width:110,fontSize:12 }}
                        value={med.times?.[0]||'08:00'}
                        onChange={e => updateResult(idx,'times',[e.target.value])} disabled={saved} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results && results.length === 0 && !loading && (
              <div style={{ textAlign:'center',padding:'1.5rem',marginTop:12,color:'var(--text-muted)',fontSize:13 }}>
                😕 No medicines detected. Add them manually below.
              </div>
            )}
          </div>

          {/* Manual list */}
          {manualList.length > 0 && (
            <div className="card-custom" style={{ marginTop:16 }}>
              <div style={{ fontSize:13,fontWeight:600,color:'#fff',marginBottom:12 }}>✏️ Manually Added ({manualList.length})</div>
              {manualList.map((med) => (
                <div key={med._id} style={{ display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid var(--border)' }}>
                  <div style={{ width:32,height:32,borderRadius:8,background:'rgba(245,158,11,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15 }}>{med.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13,fontWeight:600,color:'#fff' }}>{med.name}</div>
                    <div style={{ fontSize:11,color:'var(--text-muted)' }}>{med.dosage} · {med.freq} · {med.times?.[0]}</div>
                  </div>
                  {!saved && (
                    <button onClick={() => removeManual(med._id)} style={{ background:'transparent',border:'none',color:'var(--danger)',cursor:'pointer',fontSize:16 }}>🗑️</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Manual entry form */}
          {showManual && !saved && (
            <div className="card-custom" style={{ marginTop:16 }}>
              <div style={{ fontFamily:'Sora',fontSize:14,fontWeight:600,color:'#fff',marginBottom:16 }}>✏️ Add Medicine Manually</div>
              <div className="mb-3">
                <label className="form-label">Medicine Name *</label>
                <input className="form-control" placeholder="e.g. Metformin 500mg"
                  value={manualMed.name} onChange={e => setManualMed({...manualMed,name:e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Dosage</label>
                <input className="form-control" placeholder="e.g. 1 tablet after meals"
                  value={manualMed.dosage} onChange={e => setManualMed({...manualMed,dosage:e.target.value})} />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label">Frequency</label>
                  <select className="form-select" value={manualMed.freq} onChange={e => setManualMed({...manualMed,freq:e.target.value})}>
                    {FREQ_OPTIONS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label">Reminder Time</label>
                  <input type="time" className="form-control" value={manualMed.times[0]}
                    onChange={e => setManualMed({...manualMed,times:[e.target.value]})} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Condition</label>
                <select className="form-select" value={manualMed.condition} onChange={e => setManualMed({...manualMed,condition:e.target.value})}>
                  {CONDITION_OPTS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Reminder Mode</label>
                <div style={{ display:'flex',gap:10 }}>
                  {['flex','strict'].map(m => (
                    <div key={m} onClick={() => setManualMed({...manualMed,mode:m})}
                      style={{ flex:1,padding:'10px',borderRadius:12,border:`1px solid ${manualMed.mode===m?(m==='flex'?'var(--accent)':'var(--danger)'):'var(--border)'}`,background:manualMed.mode===m?(m==='flex'?'rgba(245,158,11,0.1)':'rgba(239,68,68,0.1)'):'transparent',cursor:'pointer',textAlign:'center' }}>
                      <div style={{ fontSize:20 }}>{m==='flex'?'🤖':'🔒'}</div>
                      <div style={{ fontSize:12,fontWeight:600,color:'#fff',marginTop:4 }}>{m==='flex'?'Flexible':'Strict'}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex',gap:8 }}>
                <button className="btn-primary-custom" style={{ flex:1,justifyContent:'center' }} onClick={addManual}>➕ Add to List</button>
                <button onClick={() => setShowManual(false)}
                  style={{ flex:1,background:'transparent',border:'1px solid var(--border)',color:'var(--text-muted)',padding:'10px',borderRadius:12,cursor:'pointer',fontSize:13 }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Action bar */}
          {!saved && (
            <div style={{ display:'flex',gap:10,marginTop:16,flexWrap:'wrap' }}>
              {!showManual && (
                <button className="btn-primary-custom"
                  style={{ background:'rgba(255,255,255,0.06)',border:'1px solid var(--border)' }}
                  onClick={() => setShowManual(true)}>
                  ✏️ Add Manually
                </button>
              )}
              {selectedMeds.length > 0 && (
                <button className="btn-primary-custom" style={{ flex:1,justifyContent:'center' }}
                  onClick={saveAll} disabled={saving}>
                  {saving ? '⏳ Saving…' : `💾 Save & Set Reminders (${selectedMeds.length})`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="col-lg-5">
          <div className="card-custom">
            <h6 style={{ fontFamily:'Sora',fontWeight:600,color:'#fff',marginBottom:14 }}>How It Works</h6>
            {[
              ['1️⃣','Upload Prescription','Photo, scan, or PDF of your doctor\'s prescription'],
              ['2️⃣','AI Extracts Names','AI reads medicine names, dosage and frequency automatically'],
              ['3️⃣','Review & Edit','Correct any details before saving to your schedule'],
              ['✅','Reminders Set','Smart alarms notify you at your reminder time every day'],
            ].map(([num, title, desc]) => (
              <div key={num} style={{ display:'flex',alignItems:'flex-start',gap:12,marginBottom:14 }}>
                <div style={{ width:32,height:32,borderRadius:8,background:'rgba(14,165,233,0.12)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:14 }}>{num}</div>
                <div>
                  <div style={{ fontSize:13,fontWeight:500,color:'#fff' }}>{title}</div>
                  <div style={{ fontSize:12,color:'var(--text-muted)',marginTop:2 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card-custom" style={{ marginTop:16 }}>
            <h6 style={{ fontFamily:'Sora',fontWeight:600,color:'#fff',marginBottom:14 }}>Supported Conditions</h6>
            {[
              ['🩸 Diabetes',      'Metformin, Insulin, Glipizide'],
              ['❤️ Hypertension',  'Amlodipine, Lisinopril, Losartan'],
              ['🌬️ Asthma',        'Salbutamol, Budesonide, Montelukast'],
              ['💓 Heart Disease', 'Aspirin, Atorvastatin, Bisoprolol'],
            ].map(([cond, meds]) => (
              <div key={cond} style={{ padding:'8px 0',borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontSize:12,fontWeight:600,color:'var(--text)',marginBottom:2 }}>{cond}</div>
                <div style={{ fontSize:11,color:'var(--text-muted)' }}>{meds}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}