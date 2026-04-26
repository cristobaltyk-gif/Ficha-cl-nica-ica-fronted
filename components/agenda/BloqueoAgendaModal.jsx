/**
 * BloqueoAgendaModal.jsx
 * Modal para bloquear/desbloquear días o slots de agenda.
 * Usado desde ConfiguracionMedico (médico) y MedicosSecretaria (secretaria).
 *
 * Props:
 *   open         {bool}
 *   professional {string}  — ID del profesional
 *   onClose      {fn}
 *   onSuccess    {fn}
 *   internalUser {string}  — session?.usuario
 */

import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

// Genera slots de 15 en 15 entre dos horas
function generarSlots(inicio = "07:00", fin = "20:00") {
  const slots = [];
  let [h, m] = inicio.split(":").map(Number);
  const [hf, mf] = fin.split(":").map(Number);
  while (h < hf || (h === hf && m < mf)) {
    slots.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
    m += 15;
    if (m >= 60) { m -= 60; h++; }
  }
  return slots;
}

const TODOS_SLOTS = generarSlots("07:00", "21:00");

export default function BloqueoAgendaModal({ open, professional, onClose, onSuccess, internalUser }) {
  const [fecha,       setFecha]       = useState("");
  const [agendaDia,   setAgendaDia]   = useState({});  // {HH:MM: {status,...}}
  const [loading,     setLoading]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [confirmado,  setConfirmado]  = useState(null); // "bloqueado" | "desbloqueado"

  useEffect(() => {
    if (!fecha || !professional) return;
    setLoading(true);
    setError("");
    fetch(`${API_URL}/agenda?date=${fecha}`)
      .then(r => r.json())
      .then(data => {
        const slots = data?.calendar?.[professional]?.slots || {};
        setAgendaDia(slots);
      })
      .catch(() => setAgendaDia({}))
      .finally(() => setLoading(false));
  }, [fecha, professional]);

  if (!open) return null;

  function handleClose() {
    setFecha(""); setAgendaDia({});
    setError(""); setConfirmado(null);
    onClose();
  }

  // Slots que tienen horario definido (cualquier status)
  const slotsDelDia = Object.entries(agendaDia);
  const bloqueados  = slotsDelDia.filter(([, s]) => s.status === "blocked").map(([t]) => t);
  const libres      = slotsDelDia.filter(([, s]) => s.status === "available").map(([t]) => t);
  const ocupados    = slotsDelDia.filter(([, s]) => !["blocked","available"].includes(s.status)).map(([t]) => t);

  async function bloquearSlot(time) {
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_URL}/agenda/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Internal-User": internalUser || "" },
        body: JSON.stringify({ date: fecha, time, professional, status: "blocked" })
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Error al bloquear");
      // Refrescar
      const data = await fetch(`${API_URL}/agenda?date=${fecha}`).then(r => r.json());
      setAgendaDia(data?.calendar?.[professional]?.slots || {});
      setConfirmado("bloqueado");
      setTimeout(() => setConfirmado(null), 1500);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function desbloquearSlot(time) {
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_URL}/agenda/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Internal-User": internalUser || "" },
        body: JSON.stringify({ date: fecha, time, professional })
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Error al desbloquear");
      const data = await fetch(`${API_URL}/agenda?date=${fecha}`).then(r => r.json());
      setAgendaDia(data?.calendar?.[professional]?.slots || {});
      setConfirmado("desbloqueado");
      setTimeout(() => setConfirmado(null), 1500);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function bloquearDiaCompleto() {
    if (!fecha) { setError("Selecciona una fecha primero"); return; }
    setSaving(true); setError("");
    let ok = 0;
    try {
      // Bloquear todos los slots libres del día
      for (const time of libres) {
        await fetch(`${API_URL}/agenda/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Internal-User": internalUser || "" },
          body: JSON.stringify({ date: fecha, time, professional, status: "blocked" })
        });
        ok++;
      }
      const data = await fetch(`${API_URL}/agenda?date=${fecha}`).then(r => r.json());
      setAgendaDia(data?.calendar?.[professional]?.slots || {});
      setConfirmado("bloqueado");
      setTimeout(() => setConfirmado(null), 1500);
      onSuccess?.();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function desbloquearDiaCompleto() {
    if (!fecha) { setError("Selecciona una fecha primero"); return; }
    setSaving(true); setError("");
    try {
      for (const time of bloqueados) {
        await fetch(`${API_URL}/agenda/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Internal-User": internalUser || "" },
          body: JSON.stringify({ date: fecha, time, professional })
        });
      }
      const data = await fetch(`${API_URL}/agenda?date=${fecha}`).then(r => r.json());
      setAgendaDia(data?.calendar?.[professional]?.slots || {});
      setConfirmado("desbloqueado");
      setTimeout(() => setConfirmado(null), 1500);
      onSuccess?.();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  function statusSlot(time) {
    const s = agendaDia[time];
    if (!s) return "sin_agenda";
    if (s.status === "blocked")   return "blocked";
    if (s.status === "available") return "available";
    return "ocupado"; // reserved, confirmed, evaluated
  }

  const colorStatus = {
    blocked:    { bg: "#fef2f2", border: "#fecaca", color: "#dc2626", label: "Bloqueado" },
    available:  { bg: "#f0fdf4", border: "#86efac", color: "#16a34a", label: "Libre" },
    ocupado:    { bg: "#f1f5f9", border: "#e2e8f0", color: "#64748b", label: "Ocupado" },
    sin_agenda: { bg: "#fff",    border: "#f1f5f9", color: "#cbd5e1", label: "Sin agenda" },
  };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(15,23,42,0.5)",
      display:"flex", alignItems:"flex-end", justifyContent:"center",
      zIndex:400, padding:"0"
    }} onClick={e => e.target === e.currentTarget && handleClose()}>

      <div style={{
        background:"#fff", borderRadius:"20px 20px 0 0",
        width:"100%", maxWidth:480, maxHeight:"90vh",
        display:"flex", flexDirection:"column",
        boxShadow:"0 -8px 40px rgba(0,0,0,0.15)",
        fontFamily:"'DM Sans',system-ui,sans-serif",
        overflow:"hidden"
      }}>

        {/* Header */}
        <div style={{
          padding:"20px 20px 16px", borderBottom:"1px solid #f1f5f9",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          flexShrink:0
        }}>
          <div>
            <p style={{margin:0, fontSize:16, fontWeight:700, color:"#0f172a"}}>
              Bloqueo de agenda
            </p>
            <p style={{margin:0, fontSize:12, color:"#94a3b8"}}>
              {professional}
            </p>
          </div>
          <button onClick={handleClose} style={{
            background:"none", border:"none", cursor:"pointer", color:"#94a3b8", padding:4
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Contenido scrollable */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 20px 32px" }}>

          {error && (
            <div style={{
              background:"#fef2f2", border:"1px solid #fecaca",
              color:"#dc2626", padding:"10px 12px", borderRadius:8,
              fontSize:13, marginBottom:12
            }}>{error}</div>
          )}

          {confirmado && (
            <div style={{
              background: confirmado === "bloqueado" ? "#fef2f2" : "#f0fdf4",
              border: `1px solid ${confirmado === "bloqueado" ? "#fecaca" : "#86efac"}`,
              color: confirmado === "bloqueado" ? "#dc2626" : "#16a34a",
              padding:"10px 12px", borderRadius:8, fontSize:13, marginBottom:12,
              fontWeight:600
            }}>
              {confirmado === "bloqueado" ? "🔒 Slot bloqueado" : "🔓 Slot desbloqueado"}
            </div>
          )}

          {/* Selector fecha */}
          <div style={{ marginBottom:16 }}>
            <p style={{
              fontSize:10, fontWeight:700, textTransform:"uppercase",
              letterSpacing:"0.12em", color:"#94a3b8", margin:"0 0 6px"
            }}>Fecha</p>
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              style={{
                width:"100%", padding:"10px 12px", border:"1px solid #e2e8f0",
                borderRadius:8, fontSize:14, fontFamily:"inherit",
                outline:"none", boxSizing:"border-box"
              }}
            />
          </div>

          {/* Acciones día completo */}
          {fecha && !loading && slotsDelDia.length > 0 && (
            <div style={{
              display:"flex", gap:8, marginBottom:16,
              padding:"12px 14px", background:"#f8fafc",
              borderRadius:10, border:"1px solid #e2e8f0"
            }}>
              <div style={{ flex:1 }}>
                <p style={{ margin:"0 0 2px", fontSize:12, fontWeight:700, color:"#0f172a" }}>
                  Día completo
                </p>
                <p style={{ margin:0, fontSize:11, color:"#94a3b8" }}>
                  {libres.length} libres · {bloqueados.length} bloqueados · {ocupados.length} ocupados
                </p>
              </div>
              <button
                onClick={bloquearDiaCompleto}
                disabled={saving || libres.length === 0}
                style={{
                  padding:"8px 12px", background:"#fef2f2", color:"#dc2626",
                  border:"1px solid #fecaca", borderRadius:8, fontSize:12,
                  fontWeight:700, cursor: libres.length === 0 ? "not-allowed" : "pointer",
                  opacity: libres.length === 0 ? 0.5 : 1
                }}
              >
                🔒 Bloquear todo
              </button>
              <button
                onClick={desbloquearDiaCompleto}
                disabled={saving || bloqueados.length === 0}
                style={{
                  padding:"8px 12px", background:"#f0fdf4", color:"#16a34a",
                  border:"1px solid #86efac", borderRadius:8, fontSize:12,
                  fontWeight:700, cursor: bloqueados.length === 0 ? "not-allowed" : "pointer",
                  opacity: bloqueados.length === 0 ? 0.5 : 1
                }}
              >
                🔓 Desbloquear todo
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <p style={{ textAlign:"center", color:"#94a3b8", fontSize:13, padding:"20px 0" }}>
              Cargando agenda…
            </p>
          )}

          {/* Sin fecha */}
          {!fecha && (
            <p style={{ textAlign:"center", color:"#cbd5e1", fontSize:13, padding:"20px 0" }}>
              Selecciona una fecha para ver los slots
            </p>
          )}

          {/* Slots */}
          {fecha && !loading && slotsDelDia.length === 0 && (
            <p style={{ textAlign:"center", color:"#94a3b8", fontSize:13, padding:"20px 0" }}>
              No hay agenda definida para este día
            </p>
          )}

          {fecha && !loading && slotsDelDia.length > 0 && (
            <div>
              <p style={{
                fontSize:10, fontWeight:700, textTransform:"uppercase",
                letterSpacing:"0.12em", color:"#94a3b8", margin:"0 0 8px"
              }}>Slots del día</p>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {slotsDelDia.sort(([a],[b]) => a.localeCompare(b)).map(([time, slot]) => {
                  const st = statusSlot(time);
                  const c  = colorStatus[st];
                  const esOcupado = st === "ocupado";
                  return (
                    <div key={time} style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"10px 12px", borderRadius:8,
                      background:c.bg, border:`1px solid ${c.border}`
                    }}>
                      <div>
                        <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#0f172a" }}>{time}</p>
                        <p style={{ margin:0, fontSize:10, color:c.color, fontWeight:600 }}>{c.label}</p>
                      </div>
                      {!esOcupado && (
                        st === "blocked" ? (
                          <button onClick={() => desbloquearSlot(time)} disabled={saving} style={{
                            padding:"4px 8px", background:"#fff", color:"#16a34a",
                            border:"1px solid #86efac", borderRadius:6,
                            fontSize:11, fontWeight:700, cursor:"pointer"
                          }}>
                            🔓
                          </button>
                        ) : (
                          <button onClick={() => bloquearSlot(time)} disabled={saving} style={{
                            padding:"4px 8px", background:"#fff", color:"#dc2626",
                            border:"1px solid #fecaca", borderRadius:6,
                            fontSize:11, fontWeight:700, cursor:"pointer"
                          }}>
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
      
