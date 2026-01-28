import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

import AgendaPage from "./AgendaPage.jsx";

import AgendaMonthSummary from "./agenda/AgendaMonthSummary.jsx";
import AgendaWeekSummary from "./agenda/AgendaWeekSummary.jsx";
import AgendaSummarySelector from "./agenda/AgendaSummarySelector.jsx";

import "../styles/agenda/dashboard-agenda.css";

/*
DashboardAgenda – ESTRUCTURA CANÓNICA FINAL

✔ Selector resumen (mensual/semanal)
✔ Selección hasta 4 médicos (desde backend real)
✔ Resumen siempre visible
✔ Agenda diaria se abre desde resumen
✔ NO toca Agenda.jsx
✔ NO CSS nuevo
*/

export default function DashboardAgenda() {
  const { role } = useAuth();

  const isSecretaria = role?.name === "secretaria";
  const isMedico = role?.name === "medico";

  // ===============================
  // ESTADO PRINCIPAL
  // ===============================
  const [summaryMode, setSummaryMode] = useState(
    isMedico ? "weekly" : "monthly"
  );

  const [selectedProfessionals, setSelectedProfessionals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // ===============================
  // PROFESIONALES DISPONIBLES (REAL)
  // ===============================
  const [availableProfessionals, setAvailableProfessionals] = useState([]);

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
          SELECTOR (SECRETARIA)
      =============================== */}
      {isSecretaria && (
        <AgendaSummarySelector
          professionals={availableProfessionals}
          onChange={({ mode, selectedProfessionals }) => {
            setSummaryMode(mode);
            setSelectedProfessionals(selectedProfessionals);
            setSelectedDate(null);
          }}
        />
      )}

      {/* ===============================
          CUERPO PRINCIPAL
      =============================== */}
      <div className="agenda-layout">

        {/* ===============================
            IZQUIERDA — RESUMEN
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
            DERECHA — AGENDA DIARIA
        =============================== */}
        <main className="agenda-right">

          {/* AgendaPage siempre vive aquí */}
          <AgendaPage
            forcedDate={selectedDate}

            /* 🔥 IMPORTANTE:
               aquí capturamos los profesionales reales */
            onProfessionalsLoaded={(list) => {
              setAvailableProfessionals(list);
            }}
          />

          {!selectedDate && (
            <div className="agenda-placeholder">
              Selecciona un día en el resumen
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
