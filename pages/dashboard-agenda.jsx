import { useAuth } from "../auth/AuthContext";

import AgendaPage from "./AgendaPage.jsx";

import AgendaMonthSummary from "./AgendaMonthSummary.jsx";
import AgendaMonthSummary from "./agenda/AgendaMonthSummary.jsx";

import "../styles/agenda/dashboard-agenda.css";

export default function DashboardAgenda() {
  const { role } = useAuth();

  return (
    <div className="dashboard dashboard-agenda">
      {/* ===============================
          HEADER OPERATIVO
         =============================== */}
      <header className="dashboard-header agenda-header">
        <div className="agenda-context">
          <h1>Agenda</h1>
          <span className="agenda-date">
            {role?.name === "secretaria" && "Vista mensual"}
            {role?.name === "medico" && "Vista semanal"}
          </span>
        </div>
      </header>

      {/* ===============================
          CUERPO PRINCIPAL
         =============================== */}
      <main className="dashboard-body agenda-layout">

        {/* ===== ZONA PRINCIPAL ===== */}
        <section className="agenda-view">
          <AgendaPage />
        </section>

        {/* ===== PANEL LATERAL ===== */}
        <aside className="agenda-side">

          {/* SECRETARIA → SUMMARY MENSUAL */}
          {role?.name === "secretaria" && (
            <div className="side-block">
              <div className="side-title">Resumen mensual</div>
              <div className="side-body">
                <AgendaMonthSummary />
              </div>
            </div>
          )}

          {/* MEDICO → SUMMARY SEMANAL */}
          {role?.name === "medico" && (
            <div className="side-block">
              <div className="side-title">Resumen semanal</div>
              <div className="side-body">
                <AgendaWeekSummary />
              </div>
            </div>
          )}

          {/* OTROS ROLES */}
          {role?.name !== "secretaria" && role?.name !== "medico" && (
            <div className="side-block">
              <div className="side-title">Información</div>
              <div className="side-body">
                Selecciona un paciente desde la agenda.
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
