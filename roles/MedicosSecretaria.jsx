import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import "../styles/pacientes/dashboard-pacientes.css";
import BloqueoAgendaModal from "../components/agenda/BloqueoAgendaModal.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const DIAS = [
  { key: "monday",    label: "Lunes" },
  { key: "tuesday",   label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday",  label: "Jueves" },
  { key: "friday",    label: "Viernes" },
  { key: "saturday",  label: "Sábado" },
  { key: "sunday",    label: "Domingo" },
];

export default function MedicosSecretaria() {
  const { session } = useAuth();

  const [professionals, setProfessionals] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [detalle,       setDetalle]       = useState(null);
  const [horarios,      setHorarios]      = useState({});
  const [horSuccess,    setHorSuccess]    = useState(null);
  const [horError,      setHorError]      = useState(null);
  const [showBloqueo,   setShowBloqueo]   = useState(false);
  const [bloqueoOk,     setBloqueoOk]     = useState(null); // mensaje confirmación

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/professionals`);
        if (!res.ok) throw new Error();
        setProfessionals(await res.json());
      } catch {
        setProfessionals([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Recargar profesional después de bloqueo para ver blocked_dates actualizado
  async function recargarDetalle(profId) {
    try {
      const res = await fetch(`${API_URL}/professionals`);
      if (!res.ok) return;
      const data = await res.json();
      const prof = data.find(p => p.id === profId);
      if (prof) setDetalle(prof);
    } catch {}
  }

  function handleSeleccionar(prof) {
    setDetalle(prof);
    setHorSuccess(null);
    setHorError(null);
    setBloqueoOk(null);
    const dias = prof.schedule?.days || {};
    const init = {};
    DIAS.forEach(d => {
      const bloques = dias[d.key];
      if (bloques) {
        const arr = Array.isArray(bloques) ? bloques : bloques.blocks || [];
        init[d.key] = arr.map(b => ({ start: b.start, end: b.end }));
      } else {
        init[d.key] = [];
      }
    });
    setHorarios(init);
  }

  function addBloque(dia) {
    setHorarios(prev => ({ ...prev, [dia]: [...(prev[dia] || []), { start: "09:00", end: "13:00" }] }));
  }

  function removeBloque(dia, idx) {
    setHorarios(prev => ({ ...prev, [dia]: prev[dia].filter((_, i) => i !== idx) }));
  }

  function updateBloque(dia, idx, field, value) {
    setHorarios(prev => {
      const copy = [...prev[dia]];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...prev, [dia]: copy };
    });
  }

  async function handleGuardarHorario(dia) {
    setHorError(null); setHorSuccess(null);
    const bloques = horarios[dia] || [];
    try {
      if (bloques.length === 0) {
        await fetch(`${API_URL}/admin/professionals/${detalle.id}/day/${dia}`, { method: "DELETE" });
      } else {
        await fetch(`${API_URL}/admin/professionals/${detalle.id}/day`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weekday: dia, blocks: bloques, slotMinutes: 15 })
        });
      }
      setHorSuccess(dia);
      setTimeout(() => setHorSuccess(null), 2000);
    } catch { setHorError(dia); }
  }

  // Fechas bloqueadas del profesional actual
  const blockedDates = detalle?.blocked_dates || [];

  return (
    <div className="dp-root">

      <div className="dp-header">
        <div className="dp-header-left">
          <h1>{detalle ? detalle.name : "Profesionales"}</h1>
          {!detalle && <p>{professionals.length} profesionales activos</p>}
          {detalle && <p>{detalle.specialty || ""}</p>}
        </div>
        {detalle && (
          <button className="dp-btn-secondary" onClick={() => { setDetalle(null); setShowBloqueo(false); setBloqueoOk(null); }}>
            ← Volver
          </button>
        )}
      </div>

      <div className="dp-content">

        {loading && <div className="dp-card"><p className="dp-empty">Cargando…</p></div>}

        {/* LISTA */}
        {!loading && !detalle && (
          <div className="dp-card">
            {professionals.length === 0 && <p className="dp-empty">Sin profesionales registrados</p>}
            {professionals.map((p, i) => (
              <div key={p.id} className="dp-event-row" onClick={() => handleSeleccionar(p)}
                style={{ borderBottomColor: i < professionals.length - 1 ? "#f1f5f9" : "transparent" }}>
                <div style={{
                  width:38, height:38, borderRadius:"50%", background:"#0f172a", color:"#fff",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:15, fontWeight:700, flexShrink:0
                }}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p className="dp-event-diag">{p.name}</p>
                  <p className="dp-event-meta">{p.specialty || p.id}</p>
                </div>
                <svg className="dp-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            ))}
          </div>
        )}

        {/* DETALLE */}
        {detalle && (
          <>
            {/* INFO */}
            <div className="dp-card">

              <div className="dp-field">
                <p className="dp-field-label">Nombre</p>
                <p className="dp-field-value">{detalle.name}</p>
              </div>

              {detalle.specialty && (
                <div className="dp-field">
                  <p className="dp-field-label">Especialidad</p>
                  <p className="dp-field-value">{detalle.specialty}</p>
                </div>
              )}

              {/* Confirmación bloqueo */}
              {bloqueoOk && (
                <div style={{
                  background:"#f0fdf4", border:"1px solid #86efac", color:"#166534",
                  padding:"10px 12px", borderRadius:8, fontSize:13, margin:"8px 0"
                }}>
                  {bloqueoOk}
                </div>
              )}

              {/* Fechas bloqueadas */}
              {blockedDates.length > 0 && (
                <div className="dp-field">
                  <p className="dp-field-label">Días bloqueados</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:4 }}>
                    {blockedDates.sort().map(d => (
                      <span key={d} style={{
                        fontSize:11, fontWeight:700, padding:"3px 8px",
                        background:"#fef2f2", border:"1px solid #fecaca",
                        color:"#dc2626", borderRadius:4
                      }}>
                        🔒 {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="dp-btn-secondary"
                style={{ width:"100%", marginTop:8, padding:"10px", fontSize:13, fontWeight:700 }}
                onClick={() => setShowBloqueo(true)}
              >
                🔒 Gestionar bloqueos de agenda
              </button>
            </div>

            {/* HORARIOS */}
            {DIAS.map(({ key, label }) => (
              <div key={key} className="dp-card">
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <p className="dp-label" style={{ margin:0 }}>{label}</p>
                  <div style={{ display:"flex", gap:6 }}>
                    <button className="dp-btn-secondary" style={{ fontSize:11, padding:"4px 10px" }}
                      onClick={() => addBloque(key)}>+ Bloque</button>
                    <button className="dp-btn-primary" style={{
                      fontSize:11, padding:"4px 10px", width:"auto",
                      background: horSuccess === key ? "#16a34a" : "#0f172a"
                    }} onClick={() => handleGuardarHorario(key)}>
                      {horSuccess === key ? "✓" : "Guardar"}
                    </button>
                  </div>
                </div>
                {(horarios[key] || []).length === 0 && <p className="dp-empty">Día libre</p>}
                {(horarios[key] || []).map((b, idx) => (
                  <div key={idx} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <input type="time" value={b.start}
                      onChange={e => updateBloque(key, idx, "start", e.target.value)}
                      style={{ flex:1, padding:"8px", border:"1px solid #e2e8f0", borderRadius:6, fontSize:13, fontFamily:"'DM Sans',system-ui" }}/>
                    <span style={{ color:"#94a3b8", fontSize:12 }}>—</span>
                    <input type="time" value={b.end}
                      onChange={e => updateBloque(key, idx, "end", e.target.value)}
                      style={{ flex:1, padding:"8px", border:"1px solid #e2e8f0", borderRadius:6, fontSize:13, fontFamily:"'DM Sans',system-ui" }}/>
                    <button onClick={() => removeBloque(key, idx)}
                      style={{ background:"none", border:"none", color:"#ef4444", cursor:"pointer", fontSize:18, padding:"0 4px" }}>×</button>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

      </div>

      <BloqueoAgendaModal
        open={showBloqueo}
        professional={detalle?.id}
        internalUser={session?.usuario}
        onClose={() => setShowBloqueo(false)}
        onSuccess={() => {
          setShowBloqueo(false);
          recargarDetalle(detalle?.id);
          setBloqueoOk("✅ Agenda actualizada correctamente");
          setTimeout(() => setBloqueoOk(null), 4000);
        }}
      />

    </div>
  );
                    }
                        
