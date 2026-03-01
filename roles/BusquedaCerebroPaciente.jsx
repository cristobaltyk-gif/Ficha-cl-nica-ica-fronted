import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import PatientForm from "../components/patient/PatientForm";
import "../styles/pacientes/patient-form.css";
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

  // 🔥 REHIDRATAR AL VOLVER DESDE ATENCIÓN
  useEffect(() => {
  if (location.state?.rut) {
    handlePacienteSeleccionado({ rut: location.state.rut });

    // 🔥 LIMPIAR STATE PARA QUE NO VUELVA A DISPARARSE
    navigate(location.pathname, { replace: true });
    } 
  }, [location.state?.rut]);

  // =========================
  // BUSCAR PACIENTE
  // =========================
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
      const adminData = await resAdmin.json();
      setAdmin(adminData);

      const resEventos = await fetch(`${API_URL}/api/fichas/evento/${rut}`, {
        headers: { "X-Internal-User": session?.usuario }
      });

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

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2>Búsqueda de Pacientes</h2>

      {!showForm && (
        <button
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
      )}

      {showForm && (
        <PatientForm
          onConfirm={handlePacienteSeleccionado}
          onCancel={() => setShowForm(false)}
        />
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* =========================
          FICHA ADMIN
      ========================= */}
      {admin && (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "15px" }}>
          <h3>Ficha Administrativa</h3>
          <p><strong>Nombre:</strong> {admin.nombre} {admin.apellido_paterno}</p>
          <p><strong>RUT:</strong> {admin.rut}</p>
          <p><strong>Previsión:</strong> {admin.prevision}</p>
        </div>
      )}

      {/* =========================
          LISTA EVENTOS
      ========================= */}
      {admin && (
        <div style={{ marginTop: "30px" }}>
          <h3>Historial Clínico</h3>

          <div style={{ marginBottom: "15px" }}>
            <button
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
            <p style={{ color: "#666" }}>Sin atenciones registradas</p>
          )}

          {eventos.map((ev, index) => (
            <div
              key={index}
              onClick={() => handleVerDetalle(ev)}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "10px",
                cursor: "pointer",
                background: "#f9f9f9"
              }}
            >
              <strong>{ev.fecha} {ev.hora}</strong>
              <div>{ev.diagnostico || "Sin diagnóstico"}</div>
              <small>{ev.professional_name || ""}</small>
            </div>
          ))}
        </div>
      )}

      {/* =========================
          DETALLE EVENTO
      ========================= */}
      {detalle && (
        <div
          style={{
            marginTop: "30px",
            border: "2px solid #000",
            padding: "20px",
            background: "#fff"
          }}
        >
          <h3>Detalle Atención</h3>

          <p><strong>Fecha:</strong> {detalle.fecha} {detalle.hora}</p>
          <p><strong>Profesional:</strong> {detalle.professional_name}</p>

          <hr />

          <p><strong>Motivo:</strong></p>
          <div>{detalle.atencion || "-"}</div>

          <p><strong>Diagnóstico:</strong></p>
          <div>{detalle.diagnostico || "-"}</div>

          <p><strong>Receta:</strong></p>
          <div>{detalle.receta || "-"}</div>

          <p><strong>Exámenes:</strong></p>
          <div>{detalle.examenes || "-"}</div>

          <p><strong>Indicaciones:</strong></p>
          <div>{detalle.indicaciones || "-"}</div>

          <p><strong>Orden kinésica:</strong></p>
          <div>{detalle.orden_kinesiologia || "-"}</div>

          <p><strong>Indicación quirúrgica:</strong></p>
          <div>{detalle.indicacion_quirurgica || "-"}</div>

          <button
            style={{ marginTop: "20px" }}
            onClick={() => setDetalle(null)}
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
