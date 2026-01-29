import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

import AgendaPage from "./AgendaPage.jsx";

// 👉 componentes reales que EXISTEN
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector.jsx";
import CalendarMonthView from "../components/agenda/CalendarMonthView.jsx";
import CalendarWeekView from "../components/agenda/CalendarWeekView.jsx";

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

  const singleProfessional =
    selectedProfessionals.length === 1 ? selectedProfessionals[0] : null;

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

          {/* ===== RESUMEN MENSUAL ===== */}
          {summaryMode === "monthly" && singleProfessional && (
            <CalendarMonthView
              professional={singleProfessional}
              month={
                selectedDate
                  ? selectedDate.slice(0, 7)
                  : new Date().toISOString().slice(0, 7)
              }
              selectedDate={
                selectedDate ? { date: selectedDate } : null
              }
              onSelectDate={({ date }) => onSelectDate?.(date)}
            />
          )}

          {/* ===== RESUMEN SEMANAL (MÉDICO) ===== */}
          {summaryMode === "weekly" && isMedico && singleProfessional && (
            <CalendarWeekView
              professional={singleProfessional}
              weekStart={selectedDate}
              selectedDate={
                selectedDate ? { date: selectedDate } : null
              }
              onSelectDate={({ date }) => onSelectDate?.(date)}
            />
          )}

          {!singleProfessional && (
            <div className="agenda-placeholder">
              Selecciona un profesional arriba
            </div>
          )}
        </aside>

        {/* ===============================
            DERECHA — AGENDA DIARIA
        =============================== */}
        <main className="agenda-right">
          {selectedDate && selectedProfessionalObjects.length > 0 ? (
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
