import "../styles/agenda/dashboard-agenda.css";

/*
DashboardAgenda — LAYOUT PURO

✔ NO lógica
✔ NO roles
✔ NO fetch
✔ NO estado
✔ SOLO composición visual
✔ Pinta lo que le entreguen
*/

export default function DashboardAgenda({
  headerTitle = "Agenda",
  headerMode = "",
  Summary,
  Day
}) {
  return (
    <div className="dashboard-agenda">

      {/* ===============================
          HEADER
      =============================== */}
      <header className="agenda-header">
        <h1>{headerTitle}</h1>
        {headerMode && (
          <span className="agenda-mode">{headerMode}</span>
        )}
      </header>

      {/* ===============================
          SUMMARY (CEREBRO EXTERNO)
      =============================== */}
      {Summary && (
        <section className="agenda-left">
          {Summary}
        </section>
      )}

      {/* ===============================
          AGENDA DIARIA (CEREBRO EXTERNO)
      =============================== */}
      <main className="agenda-right">
        {Day || (
          <div className="agenda-placeholder">
            Selecciona un día
          </div>
        )}
      </main>

    </div>
  );
}
