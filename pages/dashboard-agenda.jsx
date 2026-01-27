import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

import AgendaPage from "./AgendaPage.jsx";
import AgendaMonthSummary from "./agenda/AgendaMonthSummary.jsx";
import AgendaWeekSummary from "./agenda/AgendaWeekSummary.jsx";
import AgendaSummarySelector from "./agenda/AgendaSummarySelector.jsx";

import "../styles/agenda/dashboard-agenda.css";

/*
DashboardAgenda – ESTRUCTURA CANÓNICA

✔ Selector de resumen (mensual / semanal)
✔ Selección de hasta 4 médicos
✔ Resumen SIEMPRE visible
✔ Agenda diaria se abre desde el resumen
✔ SIN CSS nuevo
✔ SIN tocar Agenda.jsx
*/

export default function DashboardAgenda() {
  const { role } = useAuth();

  const isSecretaria = role?.name === "secretaria";
  const isMedico = role?.name === "medico";

  // ===============================
  // ESTADO ESTRUCTURAL (CLAVE)
  // ===============================
  const [summaryMode, setSummaryMode] = useState(
    isMedico ? "weekly" : "monthly"
  );

  const [selectedProfessionals, setSelectedProfessionals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <div className="dashboard-agenda">

      {/* ===============================
          HEADER
      =============================== */}
      <header className="agenda-header">
        <h1>Agenda</h1>
        <span className="agenda-mode">
          {summaryMode === "monthly" && "Resumen mensual"}
          {summaryMode === "weekly" && "Resumen semanal"}
        </span>
      </header>

      {/* ===============================
          SELECTOR (CONTROL REAL)
      =============================== */}
      {isSecretaria && (
        <AgendaSummarySelector
          professionals={[]} 
          /* ↑ puedes pasar aquí la lista real de médicos */
          onChange={({ mode, selectedProfessionals }) => {
            setSummaryMode(mode);
            setSelectedProfessionals(selectedProfessionals);
            setSelectedDate(null); // reset al cambiar contexto
          }}
        />
      )}

      {/* ===============================
          CUERPO PRINCIPAL
      =============================== */}
      <div className="agenda-layout">

        {/* ===============================
            ZONA IZQUIERDA — RESUMEN
        =============================== */}
        <aside className="agenda-left">

          {summaryMode === "monthly" && (
            <AgendaMonthSummary
              professionals={selectedProfessionals}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          )}

          {summaryMode === "weekly" && (
            <AgendaWeekSummary
              professionals={selectedProfessionals}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          )}

        </aside>

        {/* ===============================
            ZONA DERECHA — AGENDA DIARIA
        =============================== */}
        <main className="agenda-right">
          {selectedDate ? (
            <AgendaPage forcedDate={selectedDate} />
          ) : (
            <div className="agenda-placeholder">
              Selecciona un día en el resumen
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
