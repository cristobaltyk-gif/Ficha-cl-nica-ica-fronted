import "../styles/atencion/dashboard-atencion.css";

/*
DashboardAtencion — PRODUCCIÓN REAL (ICA)
MODIFICADO: layout mitad y mitad con acciones nuevas
*/

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

  onChangeAtencion,
  onChangeDiagnostico,
  onChangeReceta,
  onChangeExamenes,

  onDictado,
  dictando,
  puedeDictar,

  onOrdenarClinicamente,
  puedeOrdenar,

  onHistorial,
  onGuardar,
  onCancelar
}) {
  return (
    <div className="dashboard dashboard-atencion">

      {/* ================= HEADER ================= */}
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
          <div><strong>Dirección</strong><span>{direccion || "—"}</span></div>
          <div><strong>Teléfono</strong><span>{telefono || "—"}</span></div>
          <div><strong>Email</strong><span>{email || "—"}</span></div>
          <div><strong>Previsión</strong><span>{prevision || "—"}</span></div>
          <div><strong>Fecha</strong><span>{date} {time}</span></div>
          <div><strong>Profesional</strong><span>{professional}</span></div>
        </div>

      </header>

      {/* ================= BODY MITAD Y MITAD ================= */}
      <main className="dashboard-body atencion-split">

        {/* IZQUIERDA */}
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

        {/* DERECHA */}
        <div className="col-right">

          <section className="panel">
            <div className="panel-header">
              Indicaciones
              <button className="btn-outline-small">Generar</button>
            </div>
            <div className="panel-body"></div>
          </section>

          <section className="panel">
            <div className="panel-header">
              Orden kinésica
              <button className="btn-outline-small">Generar</button>
            </div>
            <div className="panel-body"></div>
          </section>

          <section className="panel">
            <div className="panel-header">
              Indicación quirúrgica
              <button className="btn-outline-small">Generar</button>
            </div>
            <div className="panel-body"></div>
          </section>

          <section className="panel">
            <button className="btn-dark-full">
              🖨 Imprimir documentos
            </button>
          </section>

        </div>

      </main>

      {/* ================= NUEVAS ACCIONES FINALES ================= */}
      <div className="action-bar-new">

        {onGuardar && (
          <button className="btn-primary-large" onClick={onGuardar}>
            💾 Guardar
          </button>
        )}

        <button className="btn-secondary-large">
          ✏ Modificar
        </button>

        {onCancelar && (
          <button className="btn-danger-large" onClick={onCancelar}>
            ❌ Cancelar
          </button>
        )}

      </div>

    </div>
  );
}
