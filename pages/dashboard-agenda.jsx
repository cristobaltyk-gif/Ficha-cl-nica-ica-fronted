import "../styles/agenda/dashboard-agenda.css";

export default function DashboardAgenda() {
  return (
    <div className="dashboard dashboard-agenda">
      {/* HEADER OPERATIVO */}
      <header className="dashboard-header agenda-header">
        <div className="agenda-context">
          <h1>Agenda</h1>
          <span className="agenda-date">
            {/* Fecha del día */}
          </span>
        </div>

        <div className="agenda-actions">
          {/* acciones visuales futuras */}
        </div>
      </header>

      {/* CUERPO */}
      <main className="dashboard-body agenda-layout">
        {/* ZONA PRINCIPAL: VISUALIZACIÓN */}
        <section className="agenda-view">
          {/* Agenda.jsx se monta aquí */}
        </section>

        {/* ZONA SECUNDARIA: CONTEXTO / ATENCIÓN */}
        <aside className="agenda-side">
          <div className="side-block">
            <div className="side-title">Atención</div>
            <div className="side-body">
              {/* Resumen atención seleccionada */}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
