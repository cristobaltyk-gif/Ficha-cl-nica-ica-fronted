import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

import AgendaPage from "./AgendaPage.jsx";

// 👉 TODO viene desde components/agenda
import AgendaMonthSummary from "../components/agenda/AgendaMonthSummary.jsx";
import AgendaWeekSummary from "../components/agenda/AgendaWeekSummary.jsx";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector.jsx";

import "../styles/agenda/dashboard-agenda.css";

/*
DashboardAgenda — ESTRUCTURA PURA

✔ SOLO layout
✔ SOLO orquestación visual
✔ NO fetch
✔ NO lógica de negocio
✔ NO transformación de datos
✔ NO contratos implícitos
*/

export default function DashboardAgenda({
  availableProfessionals = [],        // [{ id, name }]
  selectedProfessionals = [],         // [id]
  selectedProfessionalObjects = [],   // [{ id, name }]
  selectedDate = null,                // "YYYY-MM-DD" | null

  summaryMode: summaryModeProp,       // "monthly" | "weekly"
  onSummaryChange,                    // ({ mode, selectedProfessionals })
  onSelectDate                        // (dateString)
}) {
  const { role } = useAuth();

  const isSecretaria = role?.name === "secretaria";
  const isMedico = role?.name === "medico";

  // ===============================
  // Estado SOLO visual (fallback)
  // ===============================
  const [summaryModeLocal, setSummaryModeLocal] = useState(
    summaryModeProp || (isMedico ? "weekly" : "monthly")
  );

  const summaryMode = summaryModeProp ?? summaryModeLocal;

  function handleSummaryChange(payload) {
    setSummaryModeLocal(payload.mode);
    onSummaryChange?.(payload);
  }

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
          onChange={handleSummaryChange}
        />
      )}

      {/* ===============================
          LAYOUT PRINCIPAL
      =============================== */}
      <div className="agenda-layout">

        {/* ===============================
            IZQUIERDA — RESÚMENES
        =============================== */}
        <aside className="agenda-left">

          {summaryMode === "monthly" &&
            selectedProfessionals.map((profId) => (
              <AgendaMonthSummary
                key={profId}
                professional={profId}
                selectedDate={selectedDate}
                onSelectDate={onSelectDate}
              />
            ))}

          {summaryMode === "weekly" && isMedico && (
            <AgendaWeekSummary />
          )}

          {selectedProfessionals.length === 0 && (
            <div className="agenda-placeholder">
              Selecciona hasta 4 profesionales arriba
            </div>
          )}
        </aside>

        {/* ===============================
            DERECHA — AGENDA DIARIA
        =============================== */}
        <main className="agenda-right">
          {selectedDate ? (
            <AgendaPage
              forcedDate={selectedDate}
              professionals={selectedProfessionalObjects}
            />
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
