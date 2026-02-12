import "../styles/atencion/dashboard-atencion.css";

/*
DashboardAtencion — BOUTIQUE ICA

✔ UI pura
✔ Diseño premium
✔ Separación Médico vs IA
✔ Jerarquía visual clara
✔ Elegante, minimal, clínico
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
    <div className="dashboard dashboard-atencion boutique-ica">

      {/* ===============================
          HEADER PREMIUM
      =============================== */}
      <header className="dashboard-header boutique-header">

        <div className="header-title">
          <h1>Atención Clínica</h1>
          <span className="badge-ai">Asistencia Inteligente Activa</span>
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
            COLUMNA MÉDICO
        =============================== */}
        <div className="col-left">

          <section className="panel panel-clinical">
            <div className="panel-header">Atención</div>
            <div className="panel-body">
              <textarea
                value={atencion}
                onChange={(e) => onChangeAtencion(e.target.value)}
                placeholder="Evolución, anamnesis, examen físico…"
              />
            </div>
          </section>

          <section className="panel panel-clinical">
            <div className="panel-header">Diagnóstico</div>
            <div className="panel-body">
              <textarea
                value={diagnostico}
                onChange={(e) => onChangeDiagnostico(e.target.value)}
                placeholder="Diagnóstico principal y secundarios…"
              />
            </div>
          </section>

          <section className="panel panel-clinical">
            <div className="panel-header">Receta</div>
            <div className="panel-body">
              <textarea
                value={receta}
                onChange={(e) => onChangeReceta(e.target.value)}
                placeholder="Medicamentos, dosis, frecuencia…"
              />
            </div>
          </section>

          <section className="panel panel-clinical">
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
            COLUMNA IA
        =============================== */}
        <div className="col-right ia-zone">

          <div className="ia-title">
            <span>🧠 Asistente Clínico IA</span>
          </div>

          <section className="panel panel-ia">
            <div className="panel-header">
              Indicaciones
              <button className="btn-ia" onClick={onIndicaciones}>
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

          <section className="panel panel-ia">
            <div className="panel-header">
              Orden Kinésica
              <button className="btn-ia" onClick={onOrdenKinesiologia}>
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

          <section className="panel panel-ia panel-quirurgico">
            <div className="panel-header">
              Indicación Quirúrgica
              <button className="btn-ia-danger" onClick={onIndicacionQuirurgica}>
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

          <div className="print-container">
            <button className="btn-print" onClick={onImprimir}>
              🖨 Imprimir Documentos
            </button>
          </div>

        </div>

      </main>

      {/* ===============================
          ACCIONES FINALES
      =============================== */}
      <div className="action-bar boutique-actions">

        <button className="btn-action primary" onClick={onGuardar}>
          Guardar
        </button>

        <button className="btn-action secondary" onClick={onModificar}>
          Modificar
        </button>

        <button className="btn-action danger" onClick={onCancelar}>
          Cancelar
        </button>

      </div>

    </div>
  );
}
