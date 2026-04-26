/**
 * components/agenda/BloqueoAgendaModal.jsx
 */
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function BloqueoAgendaModal({ open, professional, onClose, onSuccess, internalUser }) {
  const [fecha,      setFecha]      = useState("");
  const [agendaDia,  setAgendaDia]  = useState({});
  const [motivo,     setMotivo]     = useState("El profesional no estará disponible este día");
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [resultado,  setResultado]  = useState(null);

  useEffect(() => {
    if (!fecha || !professional) return;
    setLoading(true); setError("");
    fetch(`${API_URL}/agenda?date=${fecha}`)
      .then(r => r.json())
      .then(data => setAgendaDia(data?.calendar?.[professional]?.slots || {}))
      .catch(() => setAgendaDia({}))
      .finally(() => setLoading(false));
  }, [fecha, professional]);

  if (!open) return null;

  function handleClose() {
    setFecha(""); setAgendaDia({}); setError("");
    setResultado(null); setMotivo("El profesional no estará disponible este día");
    onClose();
  }

  const slots       = Object.entries(agendaDia);
  const reservados  = slots.filter(([, s]) => ["reserved","confirmed"].includes(s.status));
  const bloqueados  = slots.filter(([, s]) => s.status === "blocked");
  const disponibles = slots.filter(([, s]) => s.status === "available");

  async function bloquearDia() {
    if (!fecha) { setError("Selecciona una fecha"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_URL}/agenda/bloquear-dia`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Internal-User": internalUser || "" },
        body: JSON.stringify({ date: fecha, professional, motivo })
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Error al bloquear");
      const data = await res.json();
      setResultado(data);
      setAgendaDia({});
      onSuccess?.();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function bloquearSlot(time) {
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_URL}/agenda/bloquear-slot`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Internal-User": internalUser || "" },
        body: JSON.stringify({ date: fecha, time, professional })
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Error");
      const data = await fetch(`${API_URL}/agenda?date=${fecha}`).then(r => r.json());
      setAgendaDia(data?.calendar?.[professional]?.slots || {});
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function desbloquearSlot(time) {
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_URL}/agenda/desbloquear-slot`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Internal-User": internalUser || "" },
        body: JSON.stringify({ date: fecha, time, professional })
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Error");
      const data = await fetch(`${API_URL}/agenda?date=${fecha}`).then(r => r.json());
      setAgendaDia(data?.calendar?.[professional]?.slots || {});
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  const colorStatus = {
    blocked:   { bg:"#fef2f2", border:"#fecaca", color:"#dc2626", label:"Bloqueado" },
    available: { bg:"#f0fdf4", border:"#86efac", color:"#16a34a", label:"Libre" },
    reserved:  { bg:"#eff6ff", border:"#bfdbfe", color:"#1d4ed8", label:"Reservado" },
    confirmed: { bg:"#eff6ff", border:"#bfdbfe", color:"#1d4ed8", label:"Confirmado" },
  };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(15,23,42,0.5)",
      display:"flex", alignItems:"flex-end", justifyContent:"center",
      zIndex:400
    }} onClick={e => e.target === e.currentTarget && handleClose()}>

      <div style={{
        background:"#fff", borderRadius:"20px 20px 0 0",
        width:"100%", maxWidth:480, maxHeight:"92vh",
        display:"flex", flexDirection:"column",
        boxShadow:"0 -8px 40px rgba(0,0,0,0.15)",
        fontFamily:"'DM Sans',system-ui,sans-serif", overflow:"hidden"
      }}>

        {/* Header */}
        <div style={{
          padding:"20px 20px 16px", borderBottom:"1px solid #f1f5f9",
          display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0
        }}>
          <div>
            <p style={{margin:0, fontSize:16, fontWeight:700, color:"#0f172a"}}>Bloqueo de agenda</p>
            <p style={{margin:0, fontSize:12, color:"#94a3b8"}}>{professional}</p>
          </div>
          <button onClick={handleClose} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",padding:4}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{flex:1, overflowY:"auto", padding:"16px 20px 32px"}}>

          {error && (
            <div style={{background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",
              padding:"10px 12px",borderRadius:8,fontSize:13,marginBottom:12}}>{error}</div>
          )}

          {/* Resultado */}
          {resultado && (
            <div style={{background:"#f0fdf4",border:"1px solid #86efac",color:"#166534",
              padding:"14px",borderRadius:8,fontSize:13,marginBottom:16}}>
              <p style={{margin:"0 0 4px",fontWeight:700}}>✅ Día bloqueado correctamente</p>
              <p style={{margin:0}}>
                {resultado.eliminados} slots eliminados · {resultado.notificados} pacientes notificados
              </p>
            </div>
          )}

          {/* Fecha */}
          <div style={{marginBottom:14}}>
            <p style={{fontSize:10,fontWeight:700,textTransform:"uppercase",
              letterSpacing:"0.12em",color:"#94a3b8",margin:"0 0 6px"}}>Fecha</p>
            <input type="date" value={fecha} onChange={e => { setFecha(e.target.value); setResultado(null); }}
              style={{width:"100%",padding:"10px 12px",border:"1px solid #e2e8f0",
                borderRadius:8,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
          </div>

          {/* Motivo */}
          {fecha && !loading && (
            <div style={{marginBottom:14}}>
              <p style={{fontSize:10,fontWeight:700,textTransform:"uppercase",
                letterSpacing:"0.12em",color:"#94a3b8",margin:"0 0 6px"}}>
                Motivo (se enviará a los pacientes)
              </p>
              <input value={motivo} onChange={e => setMotivo(e.target.value)}
                style={{width:"100%",padding:"10px 12px",border:"1px solid #e2e8f0",
                  borderRadius:8,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
            </div>
          )}

          {/* Resumen día */}
          {fecha && !loading && slots.length > 0 && (
            <div style={{
              padding:"12px 14px",background:"#f8fafc",borderRadius:10,
              border:"1px solid #e2e8f0",marginBottom:14
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <p style={{margin:"0 0 2px",fontSize:12,fontWeight:700,color:"#0f172a"}}>Día completo</p>
                  <p style={{margin:0,fontSize:11,color:"#94a3b8"}}>
                    {reservados.length} reservados · {disponibles.length} libres · {bloqueados.length} bloqueados
                  </p>
                  {reservados.length > 0 && (
                    <p style={{margin:"4px 0 0",fontSize:11,color:"#dc2626",fontWeight:600}}>
                      ⚠️ Se notificará a {reservados.length} paciente{reservados.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={bloquearDia} disabled={saving || slots.length === 0}
                style={{
                  width:"100%",padding:"11px",background:"#dc2626",color:"#fff",
                  border:"none",borderRadius:8,fontSize:13,fontWeight:700,
                  cursor: slots.length === 0 ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1
                }}>
                {saving ? "Procesando…" : "🔒 Bloquear día completo y notificar"}
              </button>
            </div>
          )}

          {loading && (
            <p style={{textAlign:"center",color:"#94a3b8",fontSize:13,padding:"20px 0"}}>
              Cargando agenda…
            </p>
          )}

          {!fecha && (
            <p style={{textAlign:"center",color:"#cbd5e1",fontSize:13,padding:"20px 0"}}>
              Selecciona una fecha para ver los slots
            </p>
          )}

          {fecha && !loading && slots.length === 0 && (
            <p style={{textAlign:"center",color:"#94a3b8",fontSize:13,padding:"20px 0"}}>
              No hay agenda definida para este día
            </p>
          )}

          {/* Slots individuales */}
          {fecha && !loading && slots.length > 0 && (
            <div>
              <p style={{fontSize:10,fontWeight:700,textTransform:"uppercase",
                letterSpacing:"0.12em",color:"#94a3b8",margin:"0 0 8px"}}>
                Slots individuales
              </p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {slots.sort(([a],[b]) => a.localeCompare(b)).map(([time, slot]) => {
                  const st = slot.status || "available";
                  const c  = colorStatus[st] || {bg:"#f8fafc",border:"#e2e8f0",color:"#64748b",label:st};
                  const esReservado = ["reserved","confirmed"].includes(st);
                  return (
                    <div key={time} style={{
                      padding:"10px 12px",borderRadius:8,
                      background:c.bg,border:`1px solid ${c.border}`,
                      display:"flex",alignItems:"center",justifyContent:"space-between"
                    }}>
                      <div>
                        <p style={{margin:0,fontSize:13,fontWeight:700,color:"#0f172a"}}>{time}</p>
                        <p style={{margin:0,fontSize:10,color:c.color,fontWeight:600}}>{c.label}</p>
                      </div>
                      {!esReservado && (
                        st === "blocked" ? (
                          <button onClick={() => desbloquearSlot(time)} disabled={saving}
                            style={{padding:"4px 8px",background:"#fff",color:"#16a34a",
                              border:"1px solid #86efac",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                            🔓
                          </button>
                        ) : (
                          <button onClick={() => bloquearSlot(time)} disabled={saving}
                            style={{padding:"4px 8px",background:"#fff",color:"#dc2626",
                              border:"1px solid #fecaca",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                            🔒
                          </button>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
          }
              
