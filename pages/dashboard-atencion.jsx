import "../styles/atencion/dashboard-atencion.css";

export default function DashboardAtencion({
  rut,
  date,
  time,
  professional,

  atencion,
  receta,
  examenes,

  onChangeAtencion,
  onChangeReceta,
  onChangeExamenes,

  onDictado,
  dictando,
  puedeDictar,

  onOrdenarClinicamente,
  puedeOrdenar
}) {
  return (
    <div className="dashboard dashboard-atencion">
      <header className="dashboard-header">
        <h1>Atención Clínica</h1>

        <div className="dashboard-meta">
          <span><strong>Paciente:</strong> {rut}</span>
          <span><strong>Fecha:</strong> {date} {time}</span>
          <span><strong>Profesional:</strong> {professional}</span>
        </div>

        <div className="dashboard-actions">
          <button
            className={dictando ? "danger" : "primary"}
            onClick={onDictado}
            disabled={!puedeDictar}
          >
            {dictando ? "⏹ Detener dictado" : "🎙 Dictar consulta"}
          </button>

          <button
            className="secondary"
            disabled={!puedeOrdenar}
            onClick={onOrdenarClinicamente}
          >
            🧠 Ordenar clínicamente
          </button>
        </div>
      </header>

      <main className="dashboard-body atencion-layout">
        {/* ATENCIÓN */}
        <section className="panel">
          <div className="panel-header">Atención</div>
          <div className="panel-body">
            <textarea
              value={atencion}
              onChange={(e) => onChangeAtencion(e.target.value)}
              placeholder="Atención clínica…"
            />
          </div>
        </section>

        {/* RECETA */}
        <section className="panel">
          <div className="panel-header">Receta</div>
          <div className="panel-body">
            <textarea
              value={receta}
              onChange={(e) => onChangeReceta(e.target.value)}
              placeholder="Receta médica…"
            />
          </div>
        </section>

        {/* EXÁMENES */}
        <section className="panel">
          <div className="panel-header">Exámenes</div>
          <div className="panel-body">
            <textarea
              value={examenes}
              onChange={(e) => onChangeExamenes(e.target.value)}
              placeholder="Exámenes solicitados…"
            />
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        <button className="secondary">🦵 Orden kinésica</button>
        <button className="secondary">📝 Indicaciones</button>
        <button className="secondary">🔪 Indicación quirúrgica</button>
      </footer>
    </div>
  );
}
