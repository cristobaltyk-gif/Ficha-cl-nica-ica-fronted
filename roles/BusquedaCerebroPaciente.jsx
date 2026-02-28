import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import PatientForm from "../components/patient/PatientForm";

const API_URL = import.meta.env.VITE_API_URL;

export default function BusquedaCerebroPaciente() {
  const { session } = useAuth();

  // =========================
  // ESTADOS
  // =========================
  const [rutSeleccionado, setRutSeleccionado] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(true);

  // =========================
  // CUANDO EL FORMULARIO CONFIRMA PACIENTE
  // =========================
  async function handlePacienteSeleccionado(dataPaciente) {
    const rut = dataPaciente.rut;

    setRutSeleccionado(rut);
    setError(null);
    setAdmin(null);
    setEventos([]);
    setDetalle(null);

    try {
      // 1️⃣ Cargar ficha administrativa
      const resAdmin = await fetch(
        `${API_URL}/api/fichas/admin/${rut}`,
        {
          headers: {
            "X-Internal-User": session?.usuario
          }
        }
      );

      if (!resAdmin.ok) throw new Error("No se pudo cargar ficha administrativa");

      const adminData = await resAdmin.json();
      setAdmin(adminData);

      // 2️⃣ Cargar eventos clínicos
      const resEventos = await fetch(
        `${API_URL}/api/fichas/evento/${rut}`,
        {
          headers: {
            "X-Internal-User": session?.usuario
          }
        }
      );

      if (!resEventos.ok) throw new Error("No se pudo cargar historial clínico");

      const eventosData = await resEventos.json();
      setEventos(eventosData);
      setShowForm(false);

    } catch (e) {
      setError(e.message);
    }
  }

  // =========================
  // VER DETALLE
  // =========================
  async function handleVerDetalle(ev) {
    try {
      const res = await fetch(
        `${API_URL}/api/fichas/evento/${rutSeleccionado}/${encodeURIComponent(ev.fecha)}/${encodeURIComponent(ev.hora)}`,
        {
          headers: {
            "X-Internal-User": session?.usuario
          }
        }
      );

      if (!res.ok) throw new Error("No se pudo cargar detalle");

      const data = await res.json();
      setDetalle(data);

    } catch (e) {
      setError(e.message);
    }
  }

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: "20px" }}>

      <h2>Búsqueda de Pacientes</h2>

      {/* 🔵 USAMOS TU FORMULARIO EXISTENTE */}
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
        <div style={{ marginTop: "20px", border: "1px solid #ddd", padding: "15px" }}>
          <h3>Ficha Administrativa</h3>
          <p><strong>Nombre:</strong> {admin.nombre} {admin.apellido_paterno}</p>
          <p><strong>RUT:</strong> {admin.rut}</p>
          <p><strong>Previsión:</strong> {admin.prevision}</p>
        </div>
      )}

      {/* =========================
          LISTA EVENTOS
      ========================= */}
      {eventos.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Historial Clínico</h3>

          {eventos.map((ev, index) => (
            <div
              key={index}
              onClick={() => handleVerDetalle(ev)}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
                cursor: "pointer"
              }}
            >
              <strong>{ev.fecha} {ev.hora}</strong>
              <div>{ev.diagnostico}</div>
              <small>{ev.professional_name}</small>
            </div>
          ))}
        </div>
      )}

      {/* =========================
          DETALLE EVENTO
      ========================= */}
      {detalle && (
        <div style={{ marginTop: "20px", border: "2px solid #000", padding: "15px" }}>
          <h3>Detalle Atención</h3>
          <p><strong>Motivo:</strong> {detalle.atencion}</p>
          <p><strong>Diagnóstico:</strong> {detalle.diagnostico}</p>
          <p><strong>Plan:</strong> {detalle.receta}</p>
          <p><strong>Exámenes:</strong> {detalle.examenes}</p>
        </div>
      )}

    </div>
  );
}
