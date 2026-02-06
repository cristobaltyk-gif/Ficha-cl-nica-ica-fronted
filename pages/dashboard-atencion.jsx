import "../styles/atencion/dashboard-atencion.css";

/*
DashboardAtencion — PRODUCCIÓN REAL (ICA)

✔ UI pura
✔ Sin fetch
✔ Sin lógica
✔ Cerebro controla todo
✔ Preparado para historial y expansión admin
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
     CONTENIDO CLÍNICO
  =============================== */
  atencion,
  diagnostico,
  receta,
  examenes,

  onChangeAtencion,
  onChangeDiagnostico,
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

  onHistorial
}) {
  return (
    <div className="dashboard dashboard-atencion">

      {/* ===============================
          HEADER — FICHA ADMINISTRATIVA
      =============================== */}
      <header className="dashboard-header admin-header">

        <div className="admin-header-top">
          <h1>Atención Clínica</h1>

          <div className="admin-actions">
            {onHistorial && (
              <button
                className="btn-outline"
                onClick={onHistorial}
                title="Ver historial de atenciones"
              >
                📚 Historial
              </button>
            )}

            <button
              className={dictando ? "btn-danger" : "btn-primary"}
              onClick={onDictado}
              disabled={!puedeDictar}
            >
              {dictando ? "⏹ Detener dictado" : "🎙 Dictar"}
            </button>

            <button
              className="btn-secondary"
              disabled={!puedeOrdenar}
              onClick={onOrdenarClinicamente}
            >
              🧠 Ordenar
            </button>
          </div>
        </div>

        <div className="admin-grid">
          <div><strong>Paciente</strong><span>{nombre}</span></div>
          <div><strong>RUT</strong><span>{rut}</span></div>
          <div><strong>Edad</strong><span>{edad}</span></div>
          <div><strong>Sexo</strong><span>{sexo}</span></div>
          <div><strong>Fecha</strong><span>{date} {time}</span></div>
          <div><strong>Profesional</strong><span>{professional}</span></div>
        </div>

      </header>

      {/* ===============================
          BODY — CONTENIDO CLÍNICO
      =============================== */}
      <main className="dashboard-body atencion-layout">

        {/* 1️⃣ ATENCIÓN */}
        <section className="panel">
          <div className="panel-header">Atención</div>
          <div className="panel-body">
            <textarea
              value={atencion}
              onChange={(e) => onChangeAtencion(e.target.value)}
              placeholder="Evolución, anamnesis, examen físico…"
            />
          </div>
        </section>

        {/* 2️⃣ DIAGNÓSTICO */}
        <section className="panel">
          <div className="panel-header">Diagnóstico</div>
          <div className="panel-body">
            <textarea
              value={diagnostico}
              onChange={(e) => onChangeDiagnostico(e.target.value)}
              placeholder="Diagnóstico principal y secundarios…"
            />
          </div>
        </section>

        {/* 3️⃣ RECETA */}
        <section className="panel">
          <div className="panel-header">Receta</div>
          <div className="panel-body">
            <textarea
              value={receta}
              onChange={(e) => onChangeReceta(e.target.value)}
              placeholder="Medicamentos, dosis, frecuencia…"
            />
          </div>
        </section>

        {/* 4️⃣ EXÁMENES */}
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
        <button className="btn-outline">🦵 Orden kinésica</button>
        <button className="btn-outline">📝 Indicaciones</button>
        <button className="btn-outline">🔪 Indicación quirúrgica</button>
      </footer>

    </div>
  );
}
