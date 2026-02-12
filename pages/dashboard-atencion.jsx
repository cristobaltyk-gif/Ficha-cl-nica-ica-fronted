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
  onCancelar
}) {

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  return (
    <div className="dashboard dashboard-atencion">

      <header className="dashboard-header admin-header">

        <div className="admin-header-top">
          <h1>Atención Clínica</h1>

          <div className="admin-actions">
            <button
              className={dictando ? "btn-danger" : "btn-primary"}
              onClick={onDictado}
              disabled={!puedeDictar}
            >
              {dictando ? "■" : "🎙"}
            </button>

            <button
              className="btn-secondary"
              disabled={!puedeOrdenar}
              onClick={onOrdenarClinicamente}
            >
              🧠
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

      <main className="dashboard-body atencion-split">

        <div className="col-left">

          <section className="panel">
            <div className="panel-header">Atención</div>
            <textarea
              value={atencion}
              rows={5}
              onChange={(e) => onChangeAtencion(e.target.value)}
              onInput={autoResize}
            />
          </section>

          <section className="panel">
            <div className="panel-header">Diagnóstico</div>
            <textarea
              value={diagnostico}
              rows={2}
              onChange={(e) => onChangeDiagnostico(e.target.value)}
              onInput={autoResize}
            />
          </section>

          <section className="panel">
            <div className="panel-header">
              <span>Receta</span>
              <button
                className="icon-print"
                onClick={() => onImprimir?.("receta")}
              >
                🖨
              </button>
            </div>
            <textarea
              value={receta}
              rows={4}
              onChange={(e) => onChangeReceta(e.target.value)}
              onInput={autoResize}
            />
          </section>

          <section className="panel">
            <div className="panel-header">
              <span>Exámenes</span>
              <button
                className="icon-print"
                onClick={() => onImprimir?.("examenes")}
              >
                🖨
              </button>
            </div>
            <textarea
              value={examenes}
              rows={2}
              onChange={(e) => onChangeExamenes(e.target.value)}
              onInput={autoResize}
            />
          </section>

        </div>

        <div className="col-right">

          <section className="panel">
            <div className="panel-header">
              <span>Indicaciones</span>
              <button className="icon-print">🖨</button>
            </div>
            <textarea
              value={indicaciones}
              rows={3}
              onChange={(e) => onChangeIndicaciones(e.target.value)}
              onInput={autoResize}
            />
          </section>

          <section className="panel">
            <div className="panel-header">
              <span>Orden kinésica</span>
              <button className="icon-print">🖨</button>
            </div>
            <textarea
              value={ordenKinesiologia}
              rows={3}
              onChange={(e) => onChangeOrdenKinesiologia(e.target.value)}
              onInput={autoResize}
            />
          </section>

          <section className="panel">
            <div className="panel-header">
              <span>Indicación quirúrgica</span>
              <button className="icon-print">🖨</button>
            </div>
            <textarea
              value={indicacionQuirurgica}
              rows={3}
              onChange={(e) => onChangeIndicacionQuirurgica(e.target.value)}
              onInput={autoResize}
            />
          </section>

        </div>

      </main>

      <div className="action-bar-new">
        {onGuardar && (
          <button className="btn-primary-large" onClick={onGuardar}>
            Guardar
          </button>
        )}
        {onCancelar && (
          <button className="btn-danger-large" onClick={onCancelar}>
            Cancelar
          </button>
        )}
      </div>

    </div>
  );
}
