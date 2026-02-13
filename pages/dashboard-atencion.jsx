import "../styles/atencion/dashboard-atencion.css";
import { useState, useRef, useMemo, useEffect } from "react";

export default function DashboardAtencion({
  rut,
  nombre,
  edad,
  sexo,
  direccion,
  telefono,
  email,
  prevision,
  date,
  time,
  professional,

  atencion,
  diagnostico,
  receta,
  examenes,
  indicaciones,
  ordenKinesiologia,
  indicacionQuirurgica,

  onChangeAtencion,
  onChangeDiagnostico,
  onChangeReceta,
  onChangeExamenes,
  onChangeIndicaciones,
  onChangeOrdenKinesiologia,
  onChangeIndicacionQuirurgica,

  onDictado,
  dictando,
  puedeDictar,

  onOrdenarClinicamente,
  puedeOrdenar,

  onImprimir,
  onGuardar,
  onModificar,
  onCancelar
}) {

  const [activeTab, setActiveTab] = useState("atencion");
  const textareaRef = useRef(null);

  // =========================
  // CONFIG BASE (ESTÁTICA)
  // =========================
  const sectionConfig = {
    atencion: { title: "Atención Clínica", rows: 8, print: null },
    diagnostico: { title: "Diagnóstico", rows: 4, print: null },
    receta: { title: "Receta Médica", rows: 6, print: "receta" },
    examenes: { title: "Exámenes Complementarios", rows: 4, print: "examenes" },
    indicaciones: { title: "Indicaciones Generales", rows: 5, print: "indicaciones" },
    kinesiologia: { title: "Orden Kinésica", rows: 5, print: "kinesiologia" },
    quirurgica: { title: "Indicación Quirúrgica", rows: 5, print: "quirurgica" }
  };

  // =========================
  // SECTIONS DINÁMICAS
  // =========================
  const sections = useMemo(() => ({
    atencion: { ...sectionConfig.atencion, content: atencion ?? "", onChange: onChangeAtencion },
    diagnostico: { ...sectionConfig.diagnostico, content: diagnostico ?? "", onChange: onChangeDiagnostico },
    receta: { ...sectionConfig.receta, content: receta ?? "", onChange: onChangeReceta },
    examenes: { ...sectionConfig.examenes, content: examenes ?? "", onChange: onChangeExamenes },
    indicaciones: { ...sectionConfig.indicaciones, content: indicaciones ?? "", onChange: onChangeIndicaciones },
    kinesiologia: { ...sectionConfig.kinesiologia, content: ordenKinesiologia ?? "", onChange: onChangeOrdenKinesiologia },
    quirurgica: { ...sectionConfig.quirurgica, content: indicacionQuirurgica ?? "", onChange: onChangeIndicacionQuirurgica }
  }), [
    atencion,
    diagnostico,
    receta,
    examenes,
    indicaciones,
    ordenKinesiologia,
    indicacionQuirurgica,
    onChangeAtencion,
    onChangeDiagnostico,
    onChangeReceta,
    onChangeExamenes,
    onChangeIndicaciones,
    onChangeOrdenKinesiologia,
    onChangeIndicacionQuirurgica
  ]);

  // =========================
  // AUTO RESIZE
  // =========================
  const autoResize = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    autoResize();
  }, [activeTab, sections]);

  const handlePrint = () => {
    const printType = sections[activeTab]?.print;
    if (printType) onImprimir?.(printType);
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="clinical-dashboard">

      {/* HEADER */}
      <header className="clinical-header">
        <div className="header-content">

          <div className="patient-card">
            <div className="patient-avatar">
              <div className="avatar-icon">👤</div>
            </div>
            <div className="patient-info">
              <h1 className="patient-name">{nombre || "Paciente"}</h1>
              <div className="patient-meta">
                <span><strong>RUT:</strong> {rut || "—"}</span>
                <span><strong>Edad:</strong> {edad || "—"}</span>
                <span><strong>Sexo:</strong> {sexo || "—"}</span>
              </div>
            </div>
          </div>

          <div className="header-actions">

            <div className="action-group">
              <button
                className={`voice-btn ${dictando ? "active" : ""}`}
                onClick={onDictado}
                disabled={!puedeDictar}
                title="Dictado por voz"
              >
                {dictando ? "⏹️" : "🎤"}
              </button>

              <button
                className="ai-btn"
                onClick={onOrdenarClinicamente}
                disabled={!puedeOrdenar}
                title="Ordenar clínicamente"
              >
                🧠 AI
              </button>
            </div>

            <div className="header-meta">
              <div>
                <strong>Fecha:</strong> {date} {time}
              </div>
              <div>
                <strong>Profesional:</strong> {professional}
              </div>
              <div>
                <strong>Previsión:</strong> {prevision || "—"}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="clinical-main">

        <nav className="clinical-tabs">
          {Object.keys(sections).map((key) => (
            <button
              key={key}
              className={`tab-btn ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              {sections[key].title}
            </button>
          ))}
        </nav>

        <section className="clinical-section">
          <div className="section-header">
            <h2>{sections[activeTab].title}</h2>

            {sections[activeTab].print && (
              <button
                className="print-btn"
                onClick={handlePrint}
                title="Imprimir"
              >
                🖨️
              </button>
            )}
          </div>

          <textarea
            ref={textareaRef}
            className="clinical-editor"
            value={sections[activeTab].content}
            rows={sections[activeTab].rows}
            onChange={(e) => sections[activeTab].onChange?.(e.target.value)}
            onInput={autoResize}
            placeholder={`Escriba aquí ${sections[activeTab].title.toLowerCase()}...`}
          />
        </section>

        <aside className="patient-sidebar">
          <div className="sidebar-card">
            <h3>Contacto</h3>
            <div>📱 {telefono || "No registrado"}</div>
            <div>✉️ {email || "No registrado"}</div>
            <div>🏠 {direccion || "No registrado"}</div>
          </div>
        </aside>

      </main>

      {/* FOOTER */}
      <footer className="clinical-footer">
        <div className="footer-actions">

          {onCancelar && (
            <button className="btn-cancel" onClick={onCancelar}>
              Cancelar
            </button>
          )}

          {onModificar && (
            <button className="btn-secondary" onClick={onModificar}>
              Modificar
            </button>
          )}

          {onGuardar && (
            <button className="btn-primary" onClick={onGuardar}>
              💾 Guardar Atención
            </button>
          )}

        </div>
      </footer>

    </div>
  );
}
