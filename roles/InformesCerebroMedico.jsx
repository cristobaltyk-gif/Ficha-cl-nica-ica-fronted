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

  useEffect(() => {
    if (location.state?.rut) {
      handlePacienteSeleccionado({ rut: location.state.rut });
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
      if (!resAdmin.ok) throw new Error("No se pudo cargar ficha");
      setAdmin(await resAdmin.json());

      const resEv = await fetch(
        `${API_URL}/api/fichas/resumen-clinico/${rut}/eventos`,
        { headers: { "X-Internal-User": session?.usuario } }
      );
      if (!resEv.ok) throw new Error("No se pudo cargar atenciones");
      const data = await resEv.json();
      const lista = data.eventos || [];
      setEventos(lista);
      setSeleccionados(lista.map(e => e.id));
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
    setSeleccionados(
      seleccionados.length === eventos.length ? [] : eventos.map(e => e.id)
    );
  }

  async function handleGenerarResumen() {
    if (!admin?.rut || seleccionados.length === 0) return;
    setLoadingResumen(true);
    setResumenError(null);
    setResumen("");

    try {
      const res = await fetch(`${API_URL}/api/fichas/resumen-clinico/${admin.rut}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
        body: JSON.stringify({ eventos_seleccionados: seleccionados })
      });
      if (!res.ok) throw new Error("Error generando resumen");
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
        headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
        body: JSON.stringify({
          nombre: admin.nombre, apellido_paterno: admin.apellido_paterno,
          apellido_materno: admin.apellido_materno, fecha_nacimiento: admin.fecha_nacimiento,
          rut: admin.rut, diagnostico: "Resumen clínico integral",
          indicaciones: resumen, professional
        })
      });
      if (!res.ok) throw new Error("Error generando PDF");
      window.open(window.URL.createObjectURL(await res.blob()), "_blank");
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
          actions={!showForm && (
            <button className="btn-secondary" onClick={handleReset}>
              Buscar otro paciente
            </button>
          )}
        >

          {showForm && (
            <div className="ica-card">
              <PatientForm
                onConfirm={handlePacienteSeleccionado}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {error && (
            <div className="ica-card">
              <p style={{ color: "red" }}>{error}</p>
            </div>
          )}

          {admin && (
            <div className="ica-card">
              <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                {admin.nombre} {admin.apellido_paterno} {admin.apellido_materno}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>
                {admin.rut} · {admin.prevision}
              </p>
            </div>
          )}

          {admin && eventos.length > 0 && (
            <div className="ica-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                  Atenciones ({seleccionados.length}/{eventos.length})
                </span>
                <button
                  onClick={toggleTodos}
                  style={{
                    fontSize: 12, fontWeight: 600,
                    padding: "4px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 999,
                    background: "#f8fafc",
                    color: "#374151",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', system-ui, sans-serif"
                  }}
                >
                  {seleccionados.length === eventos.length ? "Desmarcar todo" : "Marcar todo"}
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {eventos.map(ev => {
                  const sel = seleccionados.includes(ev.id);
                  return (
                    <div
                      key={ev.id}
                      onClick={() => toggleEvento(ev.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        border: `1.5px solid ${sel ? "#2563eb" : "#e2e8f0"}`,
                        borderRadius: 10,
                        background: sel ? "#eff6ff" : "#f8fafc",
                        cursor: "pointer",
                        transition: "all 0.12s",
                      }}
                    >
                      {/* CHECKBOX VISUAL */}
                      <div style={{
                        width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                        border: `2px solid ${sel ? "#2563eb" : "#cbd5e1"}`,
                        background: sel ? "#2563eb" : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {sel && (
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>

                      {/* CONTENIDO */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>
                          {ev.diagnostico || "Sin diagnóstico"}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#64748b" }}>
                          {ev.fecha} · {ev.hora}
                          {ev.professional_name ? ` · ${ev.professional_name}` : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  className="btn-primary"
                  onClick={handleGenerarResumen}
                  disabled={loadingResumen || seleccionados.length === 0}
                >
                  {loadingResumen
                    ? "Generando…"
                    : `🤖 Generar resumen (${seleccionados.length})`}
                </button>

                {resumen && (
                  <button
                    className="btn-primary"
                    onClick={handleImprimirInforme}
                    disabled={loadingPdf}
                  >
                    {loadingPdf ? "Generando PDF…" : "🖨️ Imprimir"}
                  </button>
                )}
              </div>
            </div>
          )}

          {admin && !loadingEventos && eventos.length === 0 && (
            <div className="ica-card">
              <p style={{ color: "#64748b" }}>Sin atenciones registradas</p>
            </div>
          )}

          {resumenError && (
            <div className="ica-card">
              <p style={{ color: "red" }}>{resumenError}</p>
            </div>
          )}

          {resumen && (
            <div className="ica-card">
              <h3 style={{ marginTop: 0 }}>Resumen clínico</h3>
              <div style={{
                background: "#f8fafc", border: "1px solid #e2e8f0",
                borderRadius: 10, padding: "16px 18px",
                fontSize: 13.5, lineHeight: 1.8, color: "#0f172a",
                whiteSpace: "pre-wrap", fontFamily: "Georgia, serif"
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
