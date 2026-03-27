import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocation } from "react-router-dom";
import PatientForm from "../components/patient/PatientForm";
import DashboardPacientes from "../pages/dashboard-pacientes";
import "../styles/pacientes/patient-form.css";
import "../styles/pacientes/dashboard-pacientes.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function InformesCerebroMedico() {
  const { session, professional } = useAuth();
  const location = useLocation();

  const [admin,          setAdmin]          = useState(null);
  const [eventos,        setEventos]        = useState([]);
  const [seleccionados,  setSeleccionados]  = useState([]);
  const [resumen,        setResumen]        = useState("");
  const [showForm,       setShowForm]       = useState(true);
  const [error,          setError]          = useState(null);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [loadingPdf,     setLoadingPdf]     = useState(false);
  const [resumenError,   setResumenError]   = useState(null);

  // 🔥 REHIDRATAR
  useEffect(() => {
    if (location.state?.rut) {
      const rut = location.state.rut;
      handlePacienteSeleccionado({ rut });
      window.history.replaceState({}, document.title);
    }
  }, []);

  async function handlePacienteSeleccionado(dataPaciente) {
    const rut = dataPaciente.rut;

    setAdmin(null);
    setEventos([]);
    setSeleccionados([]);
    setResumen("");
    setError(null);
    setResumenError(null);
    setLoadingEventos(true);

    try {
      const resAdmin = await fetch(`${API_URL}/api/fichas/admin/${rut}`, {
        headers: { "X-Internal-User": session?.usuario }
      });
      if (!resAdmin.ok) throw new Error("No se pudo cargar ficha administrativa");
      const adminData = await resAdmin.json();
      setAdmin(adminData);

      const resEventos = await fetch(
        `${API_URL}/api/fichas/resumen-clinico/${rut}/eventos`,
        { headers: { "X-Internal-User": session?.usuario } }
      );
      if (!resEventos.ok) throw new Error("No se pudo cargar atenciones");
      const eventosData = await resEventos.json();
      const lista = eventosData.eventos || [];
      setEventos(lista);
      setSeleccionados(lista.map(e => e.id)); // todos seleccionados por defecto

      setShowForm(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingEventos(false);
    }
  }

  function toggleEvento(id) {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function toggleTodos() {
    if (seleccionados.length === eventos.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(eventos.map(e => e.id));
    }
  }

  async function handleGenerarResumen() {
    if (!admin?.rut || seleccionados.length === 0) return;
    setLoadingResumen(true);
    setResumenError(null);
    setResumen("");

    try {
      const res = await fetch(
        `${API_URL}/api/fichas/resumen-clinico/${admin.rut}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-User": session?.usuario
          },
          body: JSON.stringify({ eventos_seleccionados: seleccionados })
        }
      );
      if (!res.ok) throw new Error("Error generando resumen clínico");
      const data = await res.json();
      setResumen(data.resumen || "");
    } catch (e) {
      setResumenError(e.message);
    } finally {
      setLoadingResumen(false);
    }
  }

  async function handleImprimirInforme() {
    if (!admin || !resumen) return;
    setLoadingPdf(true);

    try {
      const res = await fetch(`${API_URL}/api/pdf/informe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-User": session?.usuario
        },
        body: JSON.stringify({
          nombre:           admin.nombre,
          apellido_paterno: admin.apellido_paterno,
          apellido_materno: admin.apellido_materno,
          fecha_nacimiento: admin.fecha_nacimiento,
          rut:              admin.rut,
          diagnostico:      "Resumen clínico integral",
          indicaciones:     resumen,
          professional:     professional
        })
      });
      if (!res.ok) throw new Error("Error generando PDF");
      const blob = await res.blob();
      window.open(window.URL.createObjectURL(blob), "_blank");
    } catch (e) {
      setResumenError(e.message);
    } finally {
      setLoadingPdf(false);
    }
  }

  function handleReset() {
    setShowForm(true);
    setAdmin(null);
    setEventos([]);
    setSeleccionados([]);
    setResumen("");
    setError(null);
    setResumenError(null);
  }

  return (
    <div className="dashboard-pacientes-wrapper">
      <div className="dashboard-pacientes-container">

        <DashboardPacientes
          title="Informes clínicos"
          subtitle="Resumen clínico integral generado por IA"
          actions={
            !showForm && (
              <button className="btn-secondary" onClick={handleReset}>
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

          {/* FICHA PACIENTE */}
          {admin && (
            <div className="ica-card">
              <h3>Paciente</h3>
              <p><strong>Nombre:</strong> {admin.nombre} {admin.apellido_paterno} {admin.apellido_materno}</p>
              <p><strong>RUT:</strong> {admin.rut}</p>
              <p><strong>Previsión:</strong> {admin.prevision}</p>
            </div>
          )}

          {/* SELECCIÓN DE ATENCIONES */}
          {admin && eventos.length > 0 && (
            <div className="ica-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Atenciones</h3>
                <button
                  className="btn-secondary"
                  onClick={toggleTodos}
                  style={{ fontSize: 12, padding: "4px 10px" }}
                >
                  {seleccionados.length === eventos.length ? "Desmarcar todo" : "Marcar todo"}
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {eventos.map(ev => (
                  <label
                    key={ev.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "10px 14px",
                      border: `1.5px solid ${seleccionados.includes(ev.id) ? "#2563eb" : "#e2e8f0"}`,
                      borderRadius: 10,
                      background: seleccionados.includes(ev.id) ? "#eff6ff" : "#f8fafc",
                      cursor: "pointer",
                      transition: "all 0.1s"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(ev.id)}
                      onChange={() => toggleEvento(ev.id)}
                      style={{ marginTop: 2, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>
                        {ev.fecha} · {ev.hora} · {ev.professional_name}
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                        {ev.diagnostico || "Sin diagnóstico"}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  className="btn-primary"
                  onClick={handleGenerarResumen}
                  disabled={loadingResumen || seleccionados.length === 0}
                >
                  {loadingResumen ? "Generando resumen…" : `🤖 Generar resumen (${seleccionados.length} seleccionadas)`}
                </button>

                {resumen && (
                  <button
                    className="btn-primary"
                    onClick={handleImprimirInforme}
                    disabled={loadingPdf}
                  >
                    {loadingPdf ? "Generando PDF…" : "🖨️ Imprimir informe"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SIN ATENCIONES */}
          {admin && !loadingEventos && eventos.length === 0 && (
            <div className="ica-card">
              <p style={{ color: "#64748b" }}>Sin atenciones registradas</p>
            </div>
          )}

          {/* ERROR RESUMEN */}
          {resumenError && (
            <div className="ica-card">
              <p style={{ color: "red" }}>{resumenError}</p>
            </div>
          )}

          {/* RESUMEN GENERADO */}
          {resumen && (
            <div className="ica-card">
              <h3>Resumen clínico integral</h3>
              <div style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: "16px 18px",
                fontSize: 13.5,
                lineHeight: 1.7,
                color: "#0f172a",
                whiteSpace: "pre-wrap",
                marginTop: 12,
                fontFamily: "Georgia, serif"
              }}>
                {resumen}
              </div>
            </div>
          )}

        </DashboardPacientes>
      </div>
    </div>
  );
}
