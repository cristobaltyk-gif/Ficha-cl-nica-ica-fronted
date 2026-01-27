import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

import AgendaPage from "./AgendaPage.jsx";
import AgendaMonthSummary from "./agenda/AgendaMonthSummary.jsx";
import AgendaWeekSummary from "./agenda/AgendaWeekSummary.jsx";

import "../styles/agenda/dashboard-agenda.css";

export default function DashboardAgenda() {
  const { role } = useAuth();

  const isSecretaria = role?.name === "secretaria";
  const isMedico = role?.name === "medico";

  // 🔑 FECHA SELECCIONADA DESDE RESUMEN
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <div className="dashboard-agenda">

      {/* ===============================
          HEADER
      =============================== */}
      <header className="agenda-header">
        <h1>Agenda</h1>
        <span className="agenda-mode">
          {isSecretaria && "Calendario mensual"}
          {isMedico && "Agenda semanal"}
        </span>
      </header>

      {/* ===============================
          CUERPO PRINCIPAL (2 ZONAS)
      =============================== */}
      <div className="agenda-layout">

        {/* ===============================
            ZONA IZQUIERDA — CALENDARIO
        =============================== */}
        <aside className="agenda-left">
          {isSecretaria && (
            <AgendaMonthSummary
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          )}

          {isMedico && (
            <AgendaWeekSummary
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          )}
        </aside>

        {/* ===============================
            ZONA DERECHA — AGENDA DEL DÍA
        =============================== */}
        <main className="agenda-right">
          {selectedDate ? (
            <AgendaPage forcedDate={selectedDate} />
          ) : (
            <div className="agenda-placeholder">
              Selecciona un día en el calendario
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
