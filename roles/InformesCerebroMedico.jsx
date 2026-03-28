import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocation } from "react-router-dom";
import PatientForm from "../components/patient/PatientForm";
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

  const nombreCompleto = admin
    ? `${admin.nombre} ${admin.apellido_paterno} ${admin.apellido_materno || ""}`.trim()
    : "";

  return (
    <div className="dp-root">

      {/* HEADER */}
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>{admin ? nombreCompleto : "Informes clínicos"}</h1>
          {admin && <p>{admin.rut} · {admin.prevision}</p>}
          {!admin && <p>Resumen clínico integral generado por IA</p>}
        </div>
        {!showForm && (
          <button className="dp-btn-secondary" onClick={handleReset}>
            ← Buscar otro
          </button>
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

        {/* SELECCIÓN DE ATENCIONES */}
        {admin && eventos.length > 0 && (
          <div className="dp-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p className="dp-label" style={{ margin: 0 }}>
                Atenciones · {seleccionados.length}/{eventos.length} seleccionadas
              </p>
              <button className="dp-btn-secondary" onClick={toggleTodos}>
                {seleccionados.length === eventos.length ? "Desmarcar todo" : "Marcar todo"}
              </button>
            </div>

            {eventos.map((ev, i) => {
              const sel = seleccionados.includes(ev.id);
              return (
                <div
                  key={ev.id}
                  className="dp-event-row"
                  onClick={() => toggleEvento(ev.id)}
                  style={{ borderBottomColor: i < eventos.length - 1 ? "#f1f5f9" : "transparent" }}
                >
                  {/* CHECKBOX */}
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${sel ? "#2563eb" : "#cbd5e1"}`,
                    background: sel ? "#2563eb" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {sel && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="dp-event-diag">{ev.diagnostico || "Sin diagnóstico"}</p>
                    <p className="dp-event-meta">
                      {ev.fecha} · {ev.hora}{ev.professional_name ? ` · ${ev.professional_name}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                className="dp-btn-primary"
                onClick={handleGenerarResumen}
                disabled={loadingResumen || seleccionados.length === 0}
              >
                {loadingResumen ? "Generando resumen…" : `Generar resumen (${seleccionados.length} atenciones)`}
              </button>

              {resumen && (
                <button
                  className="dp-btn-primary"
                  onClick={handleImprimirInforme}
                  disabled={loadingPdf}
                  style={{ background: "#1e40af" }}
                >
                  {loadingPdf ? "Generando PDF…" : "Imprimir informe"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* SIN ATENCIONES */}
        {admin && !loadingEventos && eventos.length === 0 && (
          <div className="dp-card">
            <p className="dp-empty">Sin atenciones registradas</p>
          </div>
        )}

        {/* ERROR RESUMEN */}
        {resumenError && (
          <div className="dp-card">
            <p className="dp-error">{resumenError}</p>
          </div>
        )}

        {/* RESUMEN */}
        {resumen && (
          <div className="dp-card">
            <p className="dp-label">Resumen clínico integral</p>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: "#0f172a", whiteSpace: "pre-wrap", fontFamily: "Georgia, serif" }}>
              {resumen}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
