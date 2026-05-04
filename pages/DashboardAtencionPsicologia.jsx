import "../styles/atencion/dashboard-atencion.css";

export default function DashboardAtencionPsicologia({
  rut,
  nombre,
  edad,
  prevision,
  date,
  time,
  professional,

  atencion,
  diagnostico,

  onChangeAtencion,
  onChangeDiagnostico,

  onDictado,
  dictando,
  puedeDictar,

  onOrdenarClinicamente,
  puedeOrdenar,
  ordering,

  onGuardar,
  onModificar,
  onCancelar,
}) {
  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  return (
    <div className="da-root">

      {/* ── SIDEBAR ── */}
      <aside className="da-sidebar">

        <div className="da-brand">
          <span className="da-brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z"/>
              <path d="M12 14c-7 0-9 3-9 5v1h18v-1c0-2-2-5-9-5z"/>
            </svg>
          </span>
          <span className="da-brand-label">Psicología</span>
        </div>

        <div className="da-patient-card">
          <div className="da-avatar">
            {nombre ? nombre.charAt(0).toUpperCase() : "P"}
          </div>
          <div>
            <p className="da-patient-name">{nombre}</p>
            <p className="da-patient-rut">{rut}</p>
          </div>
        </div>

        <div className="da-meta-list">
          <div className="da-meta-item">
            <span className="da-meta-label">Edad</span>
            <span className="da-meta-value">{edad} años</span>
          </div>
          <div className="da-meta-item">
            <span className="da-meta-label">Previsión</span>
            <span className="da-meta-value">{prevision || "—"}</span>
          </div>
          <div className="da-meta-item">
            <span className="da-meta-label">Fecha</span>
            <span className="da-meta-value">{date}</span>
          </div>
          <div className="da-meta-item">
            <span className="da-meta-label">Hora</span>
            <span className="da-meta-value">{time}</span>
          </div>
          <div className="da-meta-item">
            <span className="da-meta-label">Psicólogo/a</span>
            <span className="da-meta-value">{professional}</span>
          </div>
        </div>

        {/* ── TOOLS ── */}
        <div className="da-tools">
          <p className="da-tools-label">Herramientas</p>

          <button
            className={`da-tool-btn ${dictando ? "da-tool-btn--recording" : ""}`}
            onClick={onDictado}
            disabled={!puedeDictar}
          >
            <span className="da-tool-icon">
              {dictando
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              }
            </span>
            {dictando ? "Detener dictado" : "Iniciar dictado"}
            {dictando && <span className="da-recording-dot"/>}
          </button>

          <button
            className="da-tool-btn da-tool-btn--claude"
            onClick={onOrdenarClinicamente}
            disabled={!puedeOrdenar || ordering}
          >
            <span className="da-tool-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4l3 3"/>
              </svg>
            </span>
            {ordering ? "Ordenando…" : "Ordenar con Claude"}
          </button>
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="da-sidebar-actions">
          <button className="da-btn-cancel"  onClick={onCancelar}>Cancelar</button>
          <button className="da-btn-modify"  onClick={onModificar}>Modificar</button>
          <button className="da-btn-save"    onClick={onGuardar}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            Guardar
          </button>
        </div>

      </aside>

      {/* ── MAIN ── */}
      <main className="da-main">

        <div className="da-main-header">
          <h1 className="da-title">Registro psicológico</h1>
          <span className="da-badge">Sesión activa</span>
        </div>

        <div className="da-grid">

          <Section title="Atención">
            <textarea
              className="da-textarea"
              value={atencion}
              rows={8}
              onChange={e => onChangeAtencion(e.target.value)}
              onInput={autoResize}
              placeholder="Motivo de consulta, síntomas, evolución del paciente, observaciones clínicas…"
            />
          </Section>

          <Section title="Diagnóstico">
            <textarea
              className="da-textarea"
              value={diagnostico}
              rows={5}
              onChange={e => onChangeDiagnostico(e.target.value)}
              onInput={autoResize}
              placeholder="Diagnóstico psicológico, impresión diagnóstica, CIE-10 si corresponde…"
            />
          </Section>

        </div>
      </main>

    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="da-panel">
      <div className="da-panel-header">
        <span className="da-panel-title">{title}</span>
      </div>
      {children}
    </section>
  );
}
