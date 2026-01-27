import { useAuth } from "../auth/AuthContext";

import AgendaPage from "./AgendaPage.jsx";
import AgendaMonthSummary from "./agenda/AgendaMonthSummary.jsx";
import AgendaWeekSummary from "./agenda/AgendaWeekSummary.jsx";

import "../styles/agenda/dashboard-agenda.css";

export default function DashboardAgenda() {
  const { role } = useAuth();

  const isSecretaria = role?.name === "secretaria";
  const isMedico = role?.name === "medico";

  return (
    <div className="dashboard-agenda">

      {/* ===============================
          HEADER
      =============================== */}
      <header className="agenda-header">
        <h1>Agenda</h1>
        <p>
          {isSecretaria && "Vista mensual"}
          {isMedico && "Vista semanal"}
        </p>
      </header>

      {/* ===============================
          RESUMEN (SIEMPRE VISIBLE)
      =============================== */}
      <section className="agenda-summary">
        {isSecretaria && <AgendaMonthSummary />}
        {isMedico && <AgendaWeekSummary />}
      </section>

      {/* ===============================
          AGENDA PRINCIPAL
      =============================== */}
      <section className="agenda-main">
        <AgendaPage />
      </section>

    </div>
  );
}
