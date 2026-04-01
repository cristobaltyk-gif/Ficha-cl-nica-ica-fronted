import "../styles/pacientes/dashboard-pacientes.css";
/*
DashboardAtencionKine — UI PURA

Campos:
- Atención
- Examen físico
- Diagnóstico
- Plan de tratamiento
*/

export default function DashboardAtencionKine({
  rut,
  nombre,
  edad,
  date,
  time,
  professional,
  atencion,
  examenFisico,
  diagnostico,
  planTratamiento,
  onChangeAtencion,
  onChangeExamenFisico,
  onChangeDiagnostico,
  onChangePlanTratamiento,
  onImprimir,
  onGuardar,
  onModificar,
  onCancelar,
}) {
  return (
    <div className="dp-root">

      {/* HEADER */}
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>{nombre}</h1>
          <p>
            {rut}
            {edad ? ` · ${edad} años` : ""}
            {" · "}{date} {time}
            {professional ? ` · ${professional}` : ""}
          </p>
        </div>
      </div>

      <div className="dp-content">
        <div className="dp-card">

          {/* ATENCIÓN */}
          <div className="dp-field">
            <p className="dp-field-label">Atención</p>
            <textarea
              className="dp-textarea"
              rows={4}
              placeholder="Motivo de consulta y descripción de la sesión…"
              value={atencion}
              onChange={e => onChangeAtencion(e.target.value)}
            />
          </div>

          {/* EXAMEN FÍSICO */}
          <div className="dp-field">
            <p className="dp-field-label">Examen físico</p>
            <textarea
              className="dp-textarea"
              rows={4}
              placeholder="Hallazgos del examen físico, rangos articulares, fuerza muscular…"
              value={examenFisico}
              onChange={e => onChangeExamenFisico(e.target.value)}
            />
          </div>

          {/* DIAGNÓSTICO */}
          <div className="dp-field">
            <p className="dp-field-label">Diagnóstico</p>
            <textarea
              className="dp-textarea"
              rows={3}
              placeholder="Diagnóstico funcional kinésico…"
              value={diagnostico}
              onChange={e => onChangeDiagnostico(e.target.value)}
            />
          </div>

          {/* PLAN DE TRATAMIENTO */}
          <div className="dp-field">
            <p className="dp-field-label">Plan de tratamiento</p>
            <textarea
              className="dp-textarea"
              rows={4}
              placeholder="Objetivos, técnicas, frecuencia de sesiones…"
              value={planTratamiento}
              onChange={e => onChangePlanTratamiento(e.target.value)}
            />
          </div>

          {/* IMPRIMIR INFORME */}
          <button
            className="dp-btn-secondary"
            onClick={onImprimir}
            style={{ marginBottom: 8 }}
          >
            🖨️ Imprimir informe kinésico
          </button>

          {/* ACCIONES */}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="dp-btn-primary" onClick={onGuardar} style={{ flex: 2 }}>
              ✓ Guardar atención
            </button>
            <button className="dp-btn-secondary" onClick={onModificar} style={{ flex: 1 }}>
              Modificar
            </button>
            <button className="dp-btn-secondary" onClick={onCancelar} style={{ flex: 1 }}>
              Cancelar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
