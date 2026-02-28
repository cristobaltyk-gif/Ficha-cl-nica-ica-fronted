import "../styles/atencion/dashboard-atencion.css";

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
  editable
}) {

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  return (
    <div className="dashboard-atencion">

      {/* HEADER */}
      <header className="header-compact">

        <div className="header-top">
          <h1>Atención Clínica</h1>

          <div className="header-actions">

            <div
              className={`icon-circle ${dictando ? "recording" : ""}`}
              onClick={onDictado}
            >
              🎤
            </div>

            <div
              className="icon-circle brain"
              onClick={onOrdenarClinicamente}
            >
              🧠
            </div>

          </div>
        </div>

        <div className="patient-grid">
          <span><strong>Paciente:</strong> {nombre}</span>
          <span><strong>RUT:</strong> {rut}</span>
          <span><strong>Edad:</strong> {edad}</span>
          <span><strong>Sexo:</strong> {sexo}</span>
          <span><strong>Previsión:</strong> {prevision || "—"}</span>
          <span><strong>Fecha:</strong> {date} {time}</span>
          <span><strong>Profesional:</strong> {professional}</span>
        </div>

      </header>

      {/* BODY */}
      <main className="split-layout">

        <div className="column">

          <Section title="Atención">
            <textarea value={atencion} rows={6} onChange={(e)=>onChangeAtencion(e.target.value)} onInput={autoResize}/>
          </Section>

          <Section title="Diagnóstico">
            <textarea value={diagnostico} rows={2} onChange={(e)=>onChangeDiagnostico(e.target.value)} onInput={autoResize}/>
          </Section>

          <Section title="Receta" print="receta" onImprimir={onImprimir}>
            <textarea value={receta} rows={4} onChange={(e)=>onChangeReceta(e.target.value)} onInput={autoResize}/>
          </Section>

          <Section title="Exámenes" print="examenes" onImprimir={onImprimir}>
            <textarea value={examenes} rows={2} onChange={(e)=>onChangeExamenes(e.target.value)} onInput={autoResize}/>
          </Section>

        </div>

        <div className="column">

          <Section title="Indicaciones" print="indicaciones" onImprimir={onImprimir}>
            <textarea value={indicaciones} rows={3} onChange={(e)=>onChangeIndicaciones(e.target.value)} onInput={autoResize}/>
          </Section>

          <Section title="Orden kinésica" print="kinesiologia" onImprimir={onImprimir}>
            <textarea value={ordenKinesiologia} rows={3} onChange={(e)=>onChangeOrdenKinesiologia(e.target.value)} onInput={autoResize}/>
          </Section>

          <Section title="Indicación quirúrgica" print="quirurgica" onImprimir={onImprimir}>
            <textarea value={indicacionQuirurgica} rows={3} onChange={(e)=>onChangeIndicacionQuirurgica(e.target.value)} onInput={autoResize}/>
          </Section>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="footer-bar">

        <button className="btn-cancel" onClick={onCancelar}>
          Cancelar
        </button>

        <button className="btn-secondary" onClick={onModificar}>
          Modificar
        </button>

        <button className="btn-primary" onClick={onGuardar}>
          Guardar
        </button>

      </footer>

    </div>
  );
}

function Section({ title, children, print, onImprimir }) {
  return (
    <section className="card">
      <div className="card-header">
        <span>{title}</span>
        {print && (
          <span
            className="icon-print"
            onClick={() => onImprimir?.(print)}
          >
            🖨
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
