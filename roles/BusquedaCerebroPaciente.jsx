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
  const navigate = useNavigate();
  const location = useLocation();

  const [rutSeleccionado, setRutSeleccionado] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(true);

  // 🔥 REHIDRATAR (MISMA LÓGICA)
  useEffect(() => {
    if (location.state?.rut) {
      const rut = location.state.rut;
      handlePacienteSeleccionado({ rut });
      window.history.replaceState({}, document.title);
    }
  }, []);

  // =========================
  // BUSCAR PACIENTE (MISMA LÓGICA)
  // =========================
  async function handlePacienteSeleccionado(dataPaciente) {

    const rut = dataPaciente.rut;

    setRutSeleccionado(rut);
    setAdmin(null);
    setEventos([]);
    setDetalle(null);
    setError(null);

    try {

      const resAdmin = await fetch(
        `${API_URL}/api/fichas/admin/${rut}`,
        { headers: { "X-Internal-User": session?.usuario } }
      );

      if (!resAdmin.ok) throw new Error("No se pudo cargar ficha administrativa");
      const adminData = await resAdmin.json();
      setAdmin(adminData);

      const resEventos = await fetch(
        `${API_URL}/api/fichas/evento/${rut}`,
        { headers: { "X-Internal-User": session?.usuario } }
      );

      if (!resEventos.ok) throw new Error("No se pudo cargar historial clínico");
      const eventosData = await resEventos.json();
      setEventos(eventosData);

      setShowForm(false);

    } catch (e) {
      setError(e.message);
    }
  }

  function handleVerDetalle(ev) {
    setDetalle(ev);
  }

  // =========================
  // UI NUEVA (SOLO PRESENTACIÓN)
  // =========================
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
                Buscar otro paciente
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
              <p style={{ color: "red" }}>{error}</p>
            </div>
          )}

          {/* FICHA ADMIN */}
          {admin && (
            <div className="ica-card">
              <h3>Ficha Administrativa</h3>
              <p><strong>Nombre:</strong> {admin.nombre} {admin.apellido_paterno}</p>
              <p><strong>RUT:</strong> {admin.rut}</p>
              <p><strong>Previsión:</strong> {admin.prevision}</p>
            </div>
          )}

          {/* HISTORIAL */}
          {admin && (
            <div className="ica-card">
              <h3>Historial Clínico</h3>

              <div style={{ marginBottom: "20px" }}>
                <button
                  className="btn-primary"
                  onClick={() => {
                    const now = new Date();
                    const horaActual = now.toTimeString().slice(0, 5);

                    navigate("/medico/agenda/dia/atencion", {
                      state: {
                        rut: rutSeleccionado,
                        date: new Date().toISOString().slice(0, 10),
                        time: horaActual,
                        professional: professional,
                        origin: "informes"
                      }
                    });
                  }}
                >
                  ➕ Nueva Atención
                </button>
              </div>

              {eventos.length === 0 && (
                <p style={{ color: "#64748b" }}>
                  Sin atenciones registradas
                </p>
              )}

              {eventos.map((ev, index) => (
                <div
                  key={index}
                  className="ica-event-card"
                  onClick={() => handleVerDetalle(ev)}
                >
                  <div className="ica-event-header">
                    {ev.fecha} {ev.hora}
                  </div>

                  <div className="ica-event-diagnostico">
                    {ev.diagnostico || "Sin diagnóstico"}
                  </div>

                  <div className="ica-event-professional">
                    {ev.professional_name || ""}
                  </div>
                </div>
              ))}

            </div>
          )}

          {/* DETALLE */}
          {detalle && (
            <div className="ica-detalle">
              <h3>Detalle Atención</h3>

              <div className="ica-detalle-section">
                <strong>Fecha</strong>
                {detalle.fecha} {detalle.hora}
              </div>

              <div className="ica-detalle-section">
                <strong>Profesional</strong>
                {detalle.professional_name}
              </div>

              <div className="ica-detalle-section">
                <strong>Motivo</strong>
                {detalle.atencion || "-"}
              </div>

              <div className="ica-detalle-section">
                <strong>Diagnóstico</strong>
                {detalle.diagnostico || "-"}
              </div>

              <div className="ica-detalle-section">
                <strong>Receta</strong>
                {detalle.receta || "-"}
              </div>

              <div className="ica-detalle-section">
                <strong>Exámenes</strong>
                {detalle.examenes || "-"}
              </div>

              <div className="ica-detalle-section">
                <strong>Indicaciones</strong>
                {detalle.indicaciones || "-"}
              </div>

              <div className="ica-detalle-section">
                <strong>Orden kinésica</strong>
                {detalle.orden_kinesiologia || "-"}
              </div>

              <div className="ica-detalle-section">
                <strong>Indicación quirúrgica</strong>
                {detalle.indicacion_quirurgica || "-"}
              </div>

              <button
                className="btn-secondary"
                onClick={() => setDetalle(null)}
              >
                Cerrar
              </button>

            </div>
          )}

        </DashboardPacientes>

      </div>
    </div>
  );
}
