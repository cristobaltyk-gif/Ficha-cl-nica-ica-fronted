import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import PatientForm from "../components/patient/PatientForm";
import "../styles/pacientes/patient-form.css";
import { useNavigate } from "react-router-dom";
import DashboardAtencion from "../pages/dashboard-atencion.jsx";


const API_URL = import.meta.env.VITE_API_URL;

export default function BusquedaCerebroPaciente() {
  const { session } = useAuth();
  const navigate = useNavigate();

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
      {!showForm && (
          <button
              className="buscar-otro-btn"
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
<div style={{ marginBottom: "15px" }}>
  <button
    onClick={() =>
      navigate("/atencion", {
        state: {
          rut: rutSeleccionado,
          date: new Date().toISOString().slice(0, 10),
          time: "09:00",
          professional: session?.professional
        }
      })
    }
  >
    ➕ Nueva Atención
  </button>
</div>
          
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
      {detalle && admin && (
  <div style={{ marginTop: "30px" }}>
    <DashboardAtencion
      rut={admin.rut}
      nombre={`${admin.nombre} ${admin.apellido_paterno}`}
      edad=""
      sexo={admin.sexo}
      direccion={admin.direccion}
      telefono={admin.telefono}
      email={admin.email}
      prevision={admin.prevision}
      date={detalle.fecha}
      time={detalle.hora}
      professional={detalle.professional_name}

      atencion={detalle.atencion}
      diagnostico={detalle.diagnostico}
      receta={detalle.receta}
      examenes={detalle.examenes}
      indicaciones={detalle.indicaciones}
      ordenKinesiologia={detalle.orden_kinesiologia}
      indicacionQuirurgica={detalle.indicacion_quirurgica}

      onChangeAtencion={() => {}}
      onChangeDiagnostico={() => {}}
      onChangeReceta={() => {}}
      onChangeExamenes={() => {}}
      onChangeIndicaciones={() => {}}
      onChangeOrdenKinesiologia={() => {}}
      onChangeIndicacionQuirurgica={() => {}}

      onDictado={() => {}}
      dictando={false}
      puedeDictar={false}

      onOrdenarClinicamente={() => {}}
      puedeOrdenar={false}

      onImprimir={() => {}}
      onGuardar={() => {}}
      onModificar={() => {}}
      onCancelar={() => setDetalle(null)}

      editable={false}
    />
  </div>
)}

    </div>
  );
}
