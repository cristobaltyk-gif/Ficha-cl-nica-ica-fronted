import "../styles/atencion/dashboard-atencion.css";

/*
DashboardAtencion — ICA 2 COLUMNAS

✔ UI pura
✔ Sin fetch
✔ Sin lógica
✔ División clínica estructurada
✔ Panel quirúrgico separado
*/

export default function DashboardAtencion({

  /* ===============================
     FICHA ADMINISTRATIVA
  =============================== */
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

  /* ===============================
     CONTENIDO CLÍNICO
  =============================== */
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

  /* ===============================
     ACCIONES
  =============================== */
  onOrdenKinesiologia,
  onIndicaciones,
  onIndicacionQuirurgica,
  onImprimir,

  onGuardar,
  onModificar,
  onCancelar
}) {

  return (
    <div className="dashboard dashboard-atencion">

      {/* ===============================
          HEADER
      =============================== */}
      <header className="dashboard-header admin-header">
        <div className="admin-header-top">
          <h1>Atención Clínica</h1>
        </div>

        <div className="admin-grid">
          <div><strong>Paciente</strong><span>{nombre}</span></div>
          <div><strong>RUT</strong><span>{rut}</span></div>
          <div><strong>Edad</strong><span>{edad}</span></div>
          <div><strong>Sexo</strong><span>{sexo}</span></div>

          <div><strong>Dirección</strong><span>{direccion || "—"}</span></div>
          <div><strong>Teléfono</strong><span>{telefono || "—"}</span></div>
          <div><strong>Email</strong><span>{email || "—"}</span></div>
          <div><strong>Previsión</strong><span>{prevision || "—"}</span></div>

          <div><strong>Fecha</strong><span>{date} {time}</span></div>
          <div><strong>Profesional</strong><span>{professional}</span></div>
        </div>
      </header>

      {/* ===============================
          BODY 2 COLUMNAS
      =============================== */}
      <main className="dashboard-body atencion-split">

        {/* ===============================
            COLUMNA IZQUIERDA
        =============================== */}
        <div className="col-left">

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

        </div>

        {/* ===============================
            COLUMNA DERECHA
        =============================== */}
        <div className="col-right">

          {/* INDICACIONES */}
          <section className="panel panel-accent">
            <div className="panel-header">
              Indicaciones
              <button
                className="btn-small"
                onClick={onIndicaciones}
              >
                Generar
              </button>
            </div>
            <div className="panel-body">
              <textarea
                value={indicaciones}
                onChange={(e) => onChangeIndicaciones(e.target.value)}
                placeholder="Reposo, control, recomendaciones…"
              />
            </div>
          </section>

          {/* ORDEN KINESIOLOGÍA */}
          <section className="panel panel-accent">
            <div className="panel-header">
              Orden Kinésica
              <button
                className="btn-small"
                onClick={onOrdenKinesiologia}
              >
                Generar
              </button>
            </div>
            <div className="panel-body">
              <textarea
                value={ordenKinesiologia}
                onChange={(e) => onChangeOrdenKinesiologia(e.target.value)}
                placeholder="Detalle de rehabilitación…"
              />
            </div>
          </section>

          {/* INDICACIÓN QUIRÚRGICA */}
          <section className="panel panel-accent panel-quirurgico">
            <div className="panel-header">
              Indicación Quirúrgica
              <button
                className="btn-danger-small"
                onClick={onIndicacionQuirurgica}
              >
                Generar
              </button>
            </div>
            <div className="panel-body">
              <textarea
                value={indicacionQuirurgica}
                onChange={(e) => onChangeIndicacionQuirurgica(e.target.value)}
                placeholder="Tipo de cirugía, PAD, insumos…"
              />
            </div>
          </section>

          {/* IMPRIMIR */}
          <div className="panel print-panel">
            <button
              className="btn-print"
              onClick={onImprimir}
            >
              🖨 Imprimir Documentos
            </button>
          </div>

        </div>

      </main>

      {/* ===============================
          ACCIONES GRANDES FINALES
      =============================== */}
      <div className="action-bar">

        <button
          className="btn-big btn-primary"
          onClick={onGuardar}
        >
          💾 Guardar
        </button>

        <button
          className="btn-big btn-secondary"
          onClick={onModificar}
        >
          ✏ Modificar
        </button>

        <button
          className="btn-big btn-danger"
          onClick={onCancelar}
        >
          ❌ Cancelar
        </button>

      </div>

    </div>
  );
}
