import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import PatientForm from "../components/patient/PatientForm";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/pacientes/dashboard-pacientes.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function BusquedaCerebroPaciente() {
  const { session, professional } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      if (!resAdmin.ok) throw new Error("No se pudo cargar ficha");
      setAdmin(await resAdmin.json());

      const resEventos = await fetch(`${API_URL}/api/fichas/evento/${rut}`, {
        headers: { "X-Internal-User": session?.usuario }
      });
      if (!resEventos.ok) throw new Error("No se pudo cargar historial");
      setEventos(await resEventos.json());

      setShowForm(false);
    } catch (e) {
      setError(e.message);
    }
  }

  function handleReset() {
    setShowForm(true);
    setAdmin(null);
    setEventos([]);
    setDetalle(null);
    setRutSeleccionado(null);
    setError(null);
  }

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
          {detalle && <p>{detalle.fecha} · {detalle.hora} · {detalle.professional_name}</p>}
        </div>
        {!showForm && (
          detalle
            ? <button className="dp-btn-secondary" onClick={() => setDetalle(null)}>← Volver</button>
            : <button className="dp-btn-secondary" onClick={handleReset}>← Buscar otro</button>
        )}
      </div>

      <div className="dp-content">

        {/* ERROR */}
        {error && (
          <div className="dp-card">
            <p className="dp-error">{error}</p>
          </div>
        )}

        {/* BUSCADOR */}
        {showForm && (
          <div className="dp-card">
            <PatientForm
              onConfirm={handlePacienteSeleccionado}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* FICHA + NUEVA ATENCIÓN */}
        {admin && !detalle && (
          <div className="dp-card">
            <p className="dp-label">Paciente</p>
            <p className="dp-patient-name">{nombreCompleto}</p>
            <p className="dp-patient-meta">{admin.rut} · {admin.prevision}</p>
            <button
              className="dp-btn-primary"
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
              + Nueva atención
            </button>
          </div>
        )}

        {/* HISTORIAL */}
        {admin && !detalle && (
          <div className="dp-card">
            <p className="dp-label">Historial · {eventos.length} atenciones</p>

            {eventos.length === 0 && (
              <p className="dp-empty">Sin atenciones registradas</p>
            )}

            {eventos.map((ev, i) => (
              <div key={i} className="dp-event-row" onClick={() => setDetalle(ev)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="dp-event-diag">{ev.diagnostico || "Sin diagnóstico"}</p>
                  <p className="dp-event-meta">
                    {ev.fecha} · {ev.hora}{ev.professional_name ? ` · ${ev.professional_name}` : ""}
                  </p>
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
            {[
              { label: "Motivo de consulta",   value: detalle.atencion },
              { label: "Diagnóstico",           value: detalle.diagnostico },
              { label: "Receta",                value: detalle.receta },
              { label: "Exámenes",              value: detalle.examenes },
              { label: "Indicaciones",          value: detalle.indicaciones },
              { label: "Orden kinésica",        value: detalle.orden_kinesiologia },
              { label: "Indicación quirúrgica", value: detalle.indicacion_quirurgica },
            ]
              .filter(f => f.value && f.value.trim())
              .map((f, i) => (
                <div key={i} className="dp-field">
                  <p className="dp-field-label">{f.label}</p>
                  <p className="dp-field-value">{f.value}</p>
                </div>
              ))}
          </div>
        )}

      </div>
    </div>
  );
}
