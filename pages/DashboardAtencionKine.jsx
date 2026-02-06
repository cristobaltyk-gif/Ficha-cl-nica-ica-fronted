import "../styles/atencion/dashboard-kine.css";

/*
DashboardAtencionKine — PRODUCCIÓN REAL (ICA)

✔ UI pura
✔ Sin fetch
✔ Sin lógica
✔ Cerebro Kine controla todo
✔ Preparado para evolución por sesión
*/

export default function DashboardAtencionKine({
  /* ===============================
     FICHA ADMINISTRATIVA
  =============================== */
  rut,
  nombre,
  edad,
  sexo,
  date,
  professional,

  /* ===============================
     CONTENIDO KINÉSICO
  =============================== */
  atencion,
  examenFisico,
  diagnostico,
  plan,

  onChangeAtencion,
  onChangeExamenFisico,
  onChangeDiagnostico,
  onChangePlan,

  /* ===============================
     ACCIONES
  =============================== */
  onGuardar,
  onHistorial
}) {
  return (
    <div className="dashboard dashboard-kine">

      {/* ===============================
          HEADER — ADMINISTRATIVO
      =============================== */}
      <header className="dashboard-header admin-header">

        <div className="admin-header-top">
          <h1>Atención Kinésica</h1>

          <div className="admin-actions">
            {onHistorial && (
              <button className="btn-outline" onClick={onHistorial}>
                📚 Historial
              </button>
            )}

            {onGuardar && (
              <button className="btn-primary" onClick={onGuardar}>
                💾 Guardar sesión
              </button>
            )}
          </div>
        </div>

        <div className="admin-grid">
          <div><strong>Paciente</strong><span>{nombre}</span></div>
          <div><strong>RUT</strong><span>{rut}</span></div>
          <div><strong>Edad</strong><span>{edad}</span></div>
          <div><strong>Sexo</strong><span>{sexo}</span></div>
          <div><strong>Fecha</strong><span>{date}</span></div>
          <div><strong>Kinesiólogo</strong><span>{professional}</span></div>
        </div>

      </header>

      {/* ===============================
          BODY — CONTENIDO KINÉSICO
      =============================== */}
      <main className="dashboard-body kine-layout">

        {/* 1️⃣ ATENCIÓN */}
        <section className="panel">
          <div className="panel-header">Atención</div>
          <div className="panel-body">
            <textarea
              value={atencion}
              onChange={(e) => onChangeAtencion(e.target.value)}
              placeholder="Motivo de consulta, evolución desde sesión anterior…"
            />
          </div>
        </section>

        {/* 2️⃣ EXAMEN FÍSICO */}
        <section className="panel">
          <div className="panel-header">Examen físico</div>
          <div className="panel-body">
            <textarea
              value={examenFisico}
              onChange={(e) => onChangeExamenFisico(e.target.value)}
              placeholder="ROM, fuerza, dolor (EVA), tests específicos…"
            />
          </div>
        </section>

        {/* 3️⃣ DIAGNÓSTICO KINÉSICO */}
        <section className="panel">
          <div className="panel-header">Diagnóstico kinésico</div>
          <div className="panel-body">
            <textarea
              value={diagnostico}
              onChange={(e) => onChangeDiagnostico(e.target.value)}
              placeholder="Déficits funcionales, alteraciones biomecánicas…"
            />
          </div>
        </section>

        {/* 4️⃣ PLAN DE TRATAMIENTO */}
        <section className="panel">
          <div className="panel-header">Plan de tratamiento</div>
          <div className="panel-body">
            <textarea
              value={plan}
              onChange={(e) => onChangePlan(e.target.value)}
              placeholder="Objetivos, técnicas, frecuencia, progresión…"
            />
          </div>
        </section>

      </main>

    </div>
  );
}
