import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import PatientForm from "../components/patient/PatientForm";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/pacientes/dashboard-pacientes.css";

const API_URL = import.meta.env.VITE_API_URL;

const CAMPOS = [
  { key: "atencion",              label: "Motivo de consulta",   color: "#0369a1", bg: "#f0f9ff" },
  { key: "diagnostico",           label: "Diagnóstico",           color: "#0f172a", bg: "#f8fafc" },
  { key: "receta",                label: "Receta",                color: "#065f46", bg: "#f0fdf4" },
  { key: "examenes",              label: "Exámenes",              color: "#6d28d9", bg: "#f5f3ff" },
  { key: "indicaciones",          label: "Indicaciones",          color: "#92400e", bg: "#fffbeb" },
  { key: "orden_kinesiologia",    label: "Orden kinésica",        color: "#0e7490", bg: "#ecfeff" },
  { key: "indicacion_quirurgica", label: "Indicación quirúrgica", color: "#9f1239", bg: "#fff1f2" },
];

export default function BusquedaCerebroPaciente() {
  const { session, professional } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [rutSeleccionado, setRutSeleccionado] = useState(null);
  const [admin,    setAdmin]    = useState(null);
  const [eventos,  setEventos]  = useState([]);
  const [detalle,  setDetalle]  = useState(null);
  const [detalleIdx, setDetalleIdx] = useState(null);
  const [error,    setError]    = useState(null);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    if (location.state?.rut) {
      handlePacienteSeleccionado({ rut: location.state.rut });
      window.history.replaceState({}, document.title);
    }
  }, []);

  async function handlePacienteSeleccionado(dataPaciente) {
    const rut = dataPaciente.rut;
    setRutSeleccionado(rut);
    setAdmin(null); setEventos([]); setDetalle(null); setError(null);
    try {
      const resAdmin = await fetch(`${API_URL}/api/fichas/admin/${rut}`,
        { headers: { "X-Internal-User": session?.usuario } });
      if (!resAdmin.ok) throw new Error("No se pudo cargar ficha");
      setAdmin(await resAdmin.json());

      const resEventos = await fetch(`${API_URL}/api/fichas/evento/${rut}`,
        { headers: { "X-Internal-User": session?.usuario } });
      if (!resEventos.ok) throw new Error("No se pudo cargar historial");
      setEventos(await resEventos.json());
      setShowForm(false);
    } catch (e) { setError(e.message); }
  }

  function handleReset() {
    setShowForm(true); setAdmin(null); setEventos([]);
    setDetalle(null); setRutSeleccionado(null); setError(null);
  }

  function abrirDetalle(ev, i) { setDetalle(ev); setDetalleIdx(i); }
  function anterior() { if (detalleIdx > 0) { setDetalle(eventos[detalleIdx-1]); setDetalleIdx(detalleIdx-1); } }
  function siguiente() { if (detalleIdx < eventos.length-1) { setDetalle(eventos[detalleIdx+1]); setDetalleIdx(detalleIdx+1); } }

  const nombreCompleto = admin
    ? `${admin.nombre} ${admin.apellido_paterno} ${admin.apellido_materno || ""}`.trim()
    : "";

  return (
    <div className="dp-root">

      {/* HEADER */}
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>{detalle ? (detalle.diagnostico || "Sin diagnóstico") : "Pacientes"}</h1>
          {admin && !detalle && <p>{nombreCompleto} · {admin.rut}</p>}
          {detalle && <p>{detalle.fecha} · {detalle.hora}{detalle.professional_name ? ` · ${detalle.professional_name}` : ""}</p>}
        </div>
        {!showForm && (
          detalle ? (
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <button
                className="dp-btn-secondary"
                onClick={anterior}
                disabled={detalleIdx === 0}
                style={{ opacity: detalleIdx === 0 ? 0.4 : 1 }}
              >
                ←
              </button>
              <span style={{ fontSize:11, color:"#94a3b8", minWidth:40, textAlign:"center" }}>
                {detalleIdx + 1}/{eventos.length}
              </span>
              <button
                className="dp-btn-secondary"
                onClick={siguiente}
                disabled={detalleIdx === eventos.length - 1}
                style={{ opacity: detalleIdx === eventos.length - 1 ? 0.4 : 1 }}
              >
                →
              </button>
              <button className="dp-btn-secondary" onClick={() => setDetalle(null)}>
                Lista
              </button>
            </div>
          ) : (
            <button className="dp-btn-secondary" onClick={handleReset}>← Buscar otro</button>
          )
        )}
      </div>

      <div className="dp-content">

        {error && <div className="dp-card"><p className="dp-error">{error}</p></div>}

        {/* BUSCADOR */}
        {showForm && (
          <div className="dp-card">
            <PatientForm onConfirm={handlePacienteSeleccionado} onCancel={() => setShowForm(false)}/>
          </div>
        )}

        {/* FICHA + NUEVA ATENCIÓN */}
        {admin && !detalle && (
          <div className="dp-card">
            <p className="dp-label">Paciente</p>
            <p className="dp-patient-name">{nombreCompleto}</p>
            <p className="dp-patient-meta">{admin.rut} · {admin.prevision}</p>
            <button className="dp-btn-primary" onClick={() => {
              const now = new Date();
              navigate("/medico/agenda/dia/atencion", {
                state: {
                  rut: rutSeleccionado,
                  date: now.toISOString().slice(0, 10),
                  time: now.toTimeString().slice(0, 5),
                  professional: professional,
                  origin: "pacientes"
                }
              });
            }}>
              + Nueva atención
            </button>
          </div>
        )}

        {/* HISTORIAL — lista */}
        {admin && !detalle && (
          <div className="dp-card">
            <p className="dp-label">Historial · {eventos.length} atenciones</p>
            {eventos.length === 0 && <p className="dp-empty">Sin atenciones registradas</p>}
            {eventos.map((ev, i) => (
              <div key={i} className="dp-event-row" onClick={() => abrirDetalle(ev, i)}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{
                      fontSize:11, fontWeight:700, background:"#f1f5f9",
                      borderRadius:4, padding:"2px 7px", color:"#475569",
                      fontFamily:"'DM Mono',monospace"
                    }}>{ev.fecha}</span>
                    <span style={{ fontSize:11, color:"#94a3b8" }}>{ev.hora}</span>
                    {ev.professional_name && (
                      <span style={{ fontSize:11, color:"#94a3b8" }}>· {ev.professional_name}</span>
                    )}
                  </div>
                  <p className="dp-event-diag">{ev.diagnostico || "Sin diagnóstico"}</p>
                  {/* Preview de campos presentes */}
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:5 }}>
                    {CAMPOS.filter(f => ev[f.key]?.trim()).map(f => (
                      <span key={f.key} style={{
                        fontSize:10, fontWeight:600, padding:"1px 6px",
                        borderRadius:3, background: f.bg, color: f.color
                      }}>{f.label}</span>
                    ))}
                  </div>
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
          <div className="dp-card">
            {CAMPOS.filter(f => detalle[f.key]?.trim()).map((f, i, arr) => (
              <div key={f.key} style={{
                padding:"14px 0",
                borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none"
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <span style={{
                    fontSize:10, fontWeight:700, textTransform:"uppercase",
                    letterSpacing:"0.12em", padding:"2px 7px", borderRadius:3,
                    background: f.bg, color: f.color
                  }}>{f.label}</span>
                </div>
                <p style={{
                  margin:0, fontSize:14, color:"#0f172a",
                  lineHeight:1.7, whiteSpace:"pre-wrap"
                }}>{detalle[f.key]}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
