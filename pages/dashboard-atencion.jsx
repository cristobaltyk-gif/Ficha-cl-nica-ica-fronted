import "../styles/atencion/dashboard-atencion.css";

/*
DashboardAtencion — LAYOUT PURO (ATENCIÓN)

✔ NO fetch
✔ NO lógica clínica
✔ NO roles
✔ SOLO render
✔ Atención Cerebro controla todo
*/

export default function DashboardAtencion({
  /* ===============================
     FICHA ADMINISTRATIVA
  =============================== */
  rut,
  nombre,
  edad,
  sexo,
  date,
  time,
  professional,

  /* ===============================
     CONTENIDO
  =============================== */
  atencion,
  receta,
  examenes,

  onChangeAtencion,
  onChangeReceta,
  onChangeExamenes,

  /* ===============================
     ACCIONES
  =============================== */
  onDictado,
  dictando,
  puedeDictar,

  onOrdenarClinicamente,
  puedeOrdenar,

  onHistorial   // 👈 NUEVO
}) {
  return (
    <div className="dashboard dashboard-atencion">

      {/* ===============================
          HEADER — FICHA ADMINISTRATIVA
      =============================== */}
      <header className="dashboard-header">
        <div className="dashboard-header-top">
          <h1>Atención Clínica</h1>

          <div className="dashboard-actions">
            {onHistorial && (
              <button
                className="secondary"
                onClick={onHistorial}
                title="Ver historial de atenciones"
              >
                📚 Historial
              </button>
            )}

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
        </div>

        <div className="dashboard-meta">
          <span><strong>Paciente:</strong> {nombre}</span>
          <span><strong>RUT:</strong> {rut}</span>
          <span><strong>Edad:</strong> {edad}</span>
          <span><strong>Sexo:</strong> {sexo}</span>
          <span><strong>Fecha:</strong> {date} {time}</span>
          <span><strong>Profesional:</strong> {professional}</span>
        </div>
      </header>

      {/* ===============================
          BODY — ATENCIÓN / RECETA / EXÁMENES
      =============================== */}
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

      {/* ===============================
          FOOTER — ACCIONES POST ATENCIÓN
      =============================== */}
      <footer className="dashboard-footer">
        <button className="secondary">🦵 Orden kinésica</button>
        <button className="secondary">📝 Indicaciones</button>
        <button className="secondary">🔪 Indicación quirúrgica</button>
      </footer>
    </div>
  );
}
