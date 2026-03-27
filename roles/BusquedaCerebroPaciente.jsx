import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import PatientForm from "../components/patient/PatientForm";
import DashboardPacientes from "../pages/dashboard-pacientes";
import "../styles/pacientes/patient-form.css";
import "../styles/pacientes/dashboard-pacientes.css";
import { useNavigate, useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function BusquedaCerebroPaciente() {
  const { session, professional } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [rutSeleccionado, setRutSeleccionado] = useState(null);
  const [admin,    setAdmin]    = useState(null);
  const [eventos,  setEventos]  = useState([]);
  const [detalle,  setDetalle]  = useState(null);
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
    setAdmin(null);
    setEventos([]);
    setDetalle(null);
    setError(null);

    try {
      const resAdmin = await fetch(`${API_URL}/api/fichas/admin/${rut}`, {
        headers: { "X-Internal-User": session?.usuario }
      });
      if (!resAdmin.ok) throw new Error("No se pudo cargar ficha administrativa");
      setAdmin(await resAdmin.json());

      const resEventos = await fetch(`${API_URL}/api/fichas/evento/${rut}`, {
        headers: { "X-Internal-User": session?.usuario }
      });
      if (!resEventos.ok) throw new Error("No se pudo cargar historial clínico");
      setEventos(await resEventos.json());

      setShowForm(false);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="dashboard-pacientes-wrapper">
      <div className="dashboard-pacientes-container">
        <DashboardPacientes
          title="Pacientes"
          subtitle="Búsqueda y revisión de historial clínico"
          actions={
            !showForm && (
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowForm(true);
                  setAdmin(null);
                  setEventos([]);
                  setDetalle(null);
                  setRutSeleccionado(null);
                  setError(null);
                }}
              >
                Buscar otro
              </button>
            )
          }
        >

          {/* BUSCADOR */}
          {showForm && (
            <div className="ica-card">
              <PatientForm
                onConfirm={handlePacienteSeleccionado}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="ica-card">
              <p style={{ color: "red", margin: 0 }}>{error}</p>
            </div>
          )}

          {/* FICHA PACIENTE — compacta */}
          {admin && !detalle && (
            <div className="ica-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                  {admin.nombre} {admin.apellido_paterno} {admin.apellido_materno || ""}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>
                  {admin.rut} · {admin.prevision}
                </p>
              </div>
              <button
                className="btn-primary"
                style={{ flexShrink: 0, fontSize: 13, padding: "8px 14px" }}
                onClick={() => {
                  const now = new Date();
                  navigate("/medico/agenda/dia/atencion", {
                    state: {
                      rut:          rutSeleccionado,
                      date:         now.toISOString().slice(0, 10),
                      time:         now.toTimeString().slice(0, 5),
                      professional: professional,
                      origin:       "pacientes"
                    }
                  });
                }}
              >
                ➕ Nueva
              </button>
            </div>
          )}

          {/* HISTORIAL */}
          {admin && !detalle && (
            <div className="ica-card">
              <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Historial · {eventos.length} atenciones
              </p>

              {eventos.length === 0 && (
                <p style={{ color: "#94a3b8", margin: 0, fontSize: 13 }}>Sin atenciones registradas</p>
              )}

              <div style={{ display: "flex", flexDirection: "column" }}>
                {eventos.map((ev, index) => (
                  <div
                    key={index}
                    onClick={() => setDetalle(ev)}
                    style={{
                      padding: "12px 0",
                      borderBottom: index < eventos.length - 1 ? "1px solid #f1f5f9" : "none",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                          {ev.diagnostico || "Sin diagnóstico"}
                        </p>
                        <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>
                          {ev.fecha} · {ev.hora} · {ev.professional_name || ""}
                        </p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DETALLE */}
          {detalle && (
            <div className="ica-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                    {detalle.diagnostico || "Sin diagnóstico"}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>
                    {detalle.fecha} · {detalle.hora} · {detalle.professional_name || ""}
                  </p>
                </div>
                <button
                  className="btn-secondary"
                  style={{ fontSize: 12, padding: "6px 12px", flexShrink: 0 }}
                  onClick={() => setDetalle(null)}
                >
                  ← Volver
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Motivo de consulta", value: detalle.atencion },
                  { label: "Diagnóstico",         value: detalle.diagnostico },
                  { label: "Receta",              value: detalle.receta },
                  { label: "Exámenes",            value: detalle.examenes },
                  { label: "Indicaciones",        value: detalle.indicaciones },
                  { label: "Orden kinésica",      value: detalle.orden_kinesiologia },
                  { label: "Indicación quirúrgica", value: detalle.indicacion_quirurgica },
                ]
                  .filter(f => f.value && f.value.trim())
                  .map((f, i) => (
                    <div key={i}>
                      <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {f.label}
                      </p>
                      <p style={{ margin: 0, fontSize: 13.5, color: "#0f172a", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                        {f.value}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

        </DashboardPacientes>
      </div>
    </div>
  );
}
