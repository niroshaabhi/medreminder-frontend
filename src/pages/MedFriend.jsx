import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const INIT_CAREGIVERS = [
  { id:1, name:'Sarah (Wife)', phone:'+919655868943', emoji:'👩', channel:['WhatsApp','SMS'], online:true,  lastAlert:'2h ago', color:'linear-gradient(135deg,#8b5cf6,#7c3aed)' },
  { id:2, name:'Raj (Son)',    phone:'+919655868942', emoji:'👦', channel:['SMS'],             online:true,  lastAlert:'No alerts', color:'linear-gradient(135deg,#06b6d4,#0ea5e9)' },
]

const ACTIVITY = [
  { icon:'✅', msg:'Metformin taken on time',    detail:'Today 8:05 AM · Notified Sarah & Raj', color:'rgba(16,185,129,0.06)', border:'rgba(16,185,129,0.15)' },
  { icon:'⏰', msg:'Amlodipine – Remind later', detail:'Today 9:00 AM · Re-reminded at 9:15 AM', color:'rgba(245,158,11,0.06)', border:'rgba(245,158,11,0.15)' },
  { icon:'🚨', msg:'Insulin missed – Alert sent!',detail:'Yesterday 6:10 AM · WhatsApp sent to Sarah', color:'rgba(239,68,68,0.06)', border:'rgba(239,68,68,0.15)' },
  { icon:'✅', msg:'Aspirin taken on time',      detail:'Yesterday 8:00 PM · On time', color:'rgba(16,185,129,0.06)', border:'rgba(16,185,129,0.15)' },
]

export default function MedFriend() {
  const { user } = useAuth()

  const [caregivers, setCaregivers] = useState(INIT_CAREGIVERS)
  const [alertDelay, setAlertDelay] = useState('5')
  const [whatsapp, setWhatsapp]     = useState(true)
  const [sms, setSms]               = useState(true)
  const [newCg, setNewCg]           = useState({ name:'', phone:'' })
  const [showAdd, setShowAdd]       = useState(false)

  useEffect(() => {
    if (!user) return
    try {
      const saved = localStorage.getItem(`caregivers_${user.uid}`)
      if (saved) {
        setCaregivers(JSON.parse(saved))
      } else {
        localStorage.setItem(`caregivers_${user.uid}`, JSON.stringify(INIT_CAREGIVERS))
      }
    } catch {
      setCaregivers(INIT_CAREGIVERS)
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    localStorage.setItem(`caregivers_${user.uid}`, JSON.stringify(caregivers))
  }, [caregivers, user])

  const addCaregiver = (e) => {
    e.preventDefault()
    if (!newCg.name || !newCg.phone) { toast.error('Please fill name and phone'); return }
    const cleanPhone = newCg.phone.replace(/\s+/g, '').replace(/-/g, '')
    const newEntry = {
      id: Date.now(),
      name: newCg.name,
      phone: cleanPhone,
      emoji: '👤',
      channel: ['WhatsApp', 'SMS'],
      online: true,
      lastAlert: 'Never',
      color: 'linear-gradient(135deg,#10b981,#059669)'
    }
    setCaregivers(prev => [...prev, newEntry])
    toast.success(`👤 ${newCg.name} added as caregiver!`)
    setNewCg({ name:'', phone:'' })
    setShowAdd(false)
  }

  const removeCaregiver = (id) => {
    setCaregivers(prev => prev.filter(cg => cg.id !== id))
    toast.success('Caregiver removed.')
  }

  const sendTest = async () => {
    if (!user) return
    try {
      const token = await user.getIdToken()
      const caregiverList = caregivers
        .filter(cg => cg.online !== false)
        .map(cg => ({
          ...cg,
          phone: cg.phone.replace(/\s+/g, '').replace(/-/g, '')
        }))

      const res = await fetch(`https://medreminder-backends.onrender.com/notify/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          caregivers: caregiverList,
          patientName: user.displayName || 'Patient'
        })
      })
      const data = await res.json()
      if (data.success) {
        toast('🚨 Test alert sent via WhatsApp & SMS!', { icon:'📨' })
      } else {
        toast.error('Failed: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to send test alert')
    }
  }

  return (
    <div className="fade-up">
      <div style={{ fontFamily:'Sora',fontSize:26,fontWeight:700,color:'#fff',marginBottom:4 }}>MedFriend 👨‍👩‍👦</div>
      <div style={{ fontSize:14,color:'var(--text-muted)',marginBottom:28 }}>Caregiver monitoring — family gets notified if you miss a medicine</div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card-custom">
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18 }}>
              <h6 style={{ fontFamily:'Sora',fontWeight:600,color:'#fff',margin:0 }}>My Caregivers</h6>
              <button className="btn-primary-custom" style={{ padding:'7px 14px',fontSize:12 }} onClick={() => setShowAdd(!showAdd)}>
                + Add Caregiver
              </button>
            </div>

            {showAdd && (
              <form onSubmit={addCaregiver} style={{ background:'rgba(14,165,233,0.05)',border:'1px solid rgba(14,165,233,0.15)',borderRadius:12,padding:16,marginBottom:16 }}>
                <div className="mb-2">
                  <label className="form-label">Name & Relation</label>
                  <input className="form-control" placeholder="e.g. Mary (Daughter)" value={newCg.name} onChange={e=>setNewCg({...newCg,name:e.target.value})}/>
                </div>
                <div className="mb-3">
                  <label className="form-label">WhatsApp / Phone Number</label>
                  <input className="form-control" placeholder="+91 98765 43210" value={newCg.phone} onChange={e=>setNewCg({...newCg,phone:e.target.value})}/>
                </div>
                <button type="submit" className="btn-primary-custom" style={{ fontSize:12,padding:'8px 16px' }}>Save</button>
              </form>
            )}

            {caregivers.map(cg => (
              <div key={cg.id} style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:14,padding:'16px 18px',display:'flex',alignItems:'center',gap:14,marginBottom:10 }}>
                <div style={{ width:44,height:44,borderRadius:'50%',background:cg.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0 }}>
                  {cg.emoji}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14,fontWeight:600,color:'#fff' }}>{cg.name}</div>
                  <div style={{ fontSize:12,color:'var(--text-muted)' }}>{cg.phone}</div>
                  <div style={{ fontSize:11,marginTop:3 }}>
                    <span style={{ width:7,height:7,borderRadius:'50%',background:cg.online?'var(--accent2)':'var(--text-muted)',display:'inline-block',marginRight:4,boxShadow:cg.online?'0 0 6px var(--accent2)':'none' }}/>
                    <span style={{ color:cg.online?'var(--accent2)':'var(--text-muted)' }}>
                      {cg.online?'Online':'Offline'} · {cg.channel.join(' & ')}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                  <span className="mode-ok" style={{ fontSize:11 }}>Active</span>
                  <div style={{ fontSize:10,color:'var(--text-muted)' }}>Last: {cg.lastAlert}</div>
                  <button onClick={() => removeCaregiver(cg.id)} style={{ fontSize:10, color:'#ef4444', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}

            <div style={{ marginTop:18 }}>
              <h6 style={{ fontFamily:'Sora',fontWeight:600,color:'#fff',marginBottom:12,fontSize:14 }}>Notification Settings</h6>
              {[
                { label:'📱 WhatsApp Alerts', val:whatsapp, set:setWhatsapp },
                { label:'✉️ SMS Alerts',       val:sms,      set:setSms },
              ].map(({ label, val, set }) => (
                <div key={label} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'var(--glass)',border:'1px solid var(--border)',borderRadius:12,marginBottom:8 }}>
                  <div style={{ fontSize:13,color:'var(--text)' }}>{label}</div>
                  <div className={`toggle-switch ${val?'':'off'}`} onClick={() => set(!val)}>
                    <div className="knob"/>
                  </div>
                </div>
              ))}
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'var(--glass)',border:'1px solid var(--border)',borderRadius:12,marginBottom:8 }}>
                <div style={{ fontSize:13,color:'var(--text)' }}>⏱️ Alert after missed (mins)</div>
                <select className="form-select" style={{ width:80,padding:'4px 8px',fontSize:12 }} value={alertDelay} onChange={e=>setAlertDelay(e.target.value)}>
                  <option>5</option><option>10</option><option>15</option><option>30</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop:14 }}>
              <button className="btn-primary-custom" style={{ width:'100%',justifyContent:'center' }} onClick={sendTest}>
                📨 Send Test Alert to Caregivers
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card-custom">
            <h6 style={{ fontFamily:'Sora',fontWeight:600,color:'#fff',marginBottom:14 }}>Recent Activity</h6>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display:'flex',alignItems:'flex-start',gap:10,padding:12,background:a.color,border:`1px solid ${a.border}`,borderRadius:12,marginBottom:10 }}>
                <span style={{ fontSize:18 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize:13,fontWeight:500,color:'#fff' }}>{a.msg}</div>
                  <div style={{ fontSize:11,color:'var(--text-muted)',marginTop:2 }}>{a.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card-custom" style={{ marginTop:16 }}>
            <h6 style={{ fontFamily:'Sora',fontWeight:600,color:'#fff',marginBottom:14 }}>How MedFriend Works</h6>
            {[
              ['🔔','Medicine alarm rings','Alarm rings and continues until patient responds'],
              ['⏱️','No response in 5 mins','System waits for the alert delay you configured'],
              ['📱','Caregiver notified','WhatsApp and SMS sent to all active caregivers'],
              ['✅','Patient confirms','Once taken, caregivers receive a confirmation too'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ display:'flex',gap:12,marginBottom:12 }}>
                <div style={{ width:32,height:32,borderRadius:8,background:'rgba(14,165,233,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize:12,fontWeight:600,color:'#fff' }}>{title}</div>
                  <div style={{ fontSize:11,color:'var(--text-muted)',marginTop:2 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}