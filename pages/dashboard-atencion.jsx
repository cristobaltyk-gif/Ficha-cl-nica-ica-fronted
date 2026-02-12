import "../styles/atencion/dashboard-atencion.css";

/*
DashboardAtencion — PRODUCCIÓN REAL (ICA)
MITAD Y MITAD EDITABLE + ICONOS IMPRESIÓN
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

      {/* ================= HEADER ================= */}
      <header className="dashboard-header admin-header">

        <div className="admin-header-top">
          <h1>Atención Clínica</h1>

          <div className="admin-actions">

            <button
              className={dictando ? "btn-danger" : "btn-primary"}
              onClick={onDictado}
              disabled={!puedeDictar}
            >
              {dictando ? "■ Detener dictado" : "🎤 Dictar"}
            </button>

            <button
              className="btn-secondary"
              disabled={!puedeOrdenar}
              onClick={onOrdenarClinicamente}
            >
              🧠 Ordenar clínicamente
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
                onInput={autoResize}
                placeholder="Evolución, anamnesis, examen físico…"
              />
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">Diagnóstico</div>
            <div className="panel-body">
              <textarea
                className="textarea-diagnostico"
                value={diagnostico}
                onChange={(e) => onChangeDiagnostico(e.target.value)}
                onInput={autoResize}
                placeholder="Diagnóstico principal…"
              />
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <span>Receta</span>
              <button
                className="icon-print"
                onClick={() => onImprimir?.("receta")}
                title="Imprimir receta"
              >
                🖨
              </button>
            </div>
            <div className="panel-body">
              <textarea
                className="textarea-receta"
                value={receta}
                onChange={(e) => onChangeReceta(e.target.value)}
                onInput={autoResize}
                placeholder="Medicamentos, dosis, frecuencia…"
              />
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <span>Exámenes</span>
              <button
                className="icon-print"
                onClick={() => onImprimir?.("examenes")}
                title="Imprimir orden de exámenes"
              >
                🖨
              </button>
            </div>
            <div className="panel-body">
              <textarea
                className="textarea-examenes"
                value={examenes}
                onChange={(e) => onChangeExamenes(e.target.value)}
                onInput={autoResize}
                placeholder="Exámenes solicitados…"
              />
            </div>
          </section>

        </div>

        {/* DERECHA */}
        <div className="col-right">

          <section className="panel">
            <div className="panel-header">
              <span>Indicaciones</span>
              <button
                className="icon-print"
                onClick={() => onImprimir?.("indicaciones")}
                title="Imprimir indicaciones"
              >
                🖨
              </button>
            </div>
            <div className="panel-body">
              <textarea
                value={indicaciones}
                onChange={(e) => onChangeIndicaciones(e.target.value)}
                onInput={autoResize}
                placeholder="Reposo, control, recomendaciones…"
              />
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <span>Orden kinésica</span>
              <button
                className="icon-print"
                onClick={() => onImprimir?.("kinesiologia")}
                title="Imprimir orden kinésica"
              >
                🖨
              </button>
            </div>
            <div className="panel-body">
              <textarea
                value={ordenKinesiologia}
                onChange={(e) => onChangeOrdenKinesiologia(e.target.value)}
                onInput={autoResize}
                placeholder="10 sesiones, 3 veces por semana…"
              />
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <span>Indicación quirúrgica</span>
              <button
                className="icon-print"
                onClick={() => onImprimir?.("quirurgica")}
                title="Imprimir indicación quirúrgica"
              >
                🖨
              </button>
            </div>
            <div className="panel-body">
              <textarea
                value={indicacionQuirurgica}
                onChange={(e) => onChangeIndicacionQuirurgica(e.target.value)}
                onInput={autoResize}
                placeholder="Procedimiento indicado…"
              />
            </div>
          </section>

        </div>

      </main>

      {/* ================= FOOTER ================= */}
      <div className="action-bar-new">

        {onGuardar && (
          <button className="btn-primary-large" onClick={onGuardar}>
            💾 Guardar
          </button>
        )}

        {onCancelar && (
          <button className="btn-danger-large" onClick={onCancelar}>
            ✖ Cancelar
          </button>
        )}

      </div>

    </div>
  );
}
