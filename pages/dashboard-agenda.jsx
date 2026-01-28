import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

import AgendaPage from "./AgendaPage.jsx";

import AgendaMonthSummary from "./agenda/AgendaMonthSummary.jsx";
import AgendaWeekSummary from "./agenda/AgendaWeekSummary.jsx";
import AgendaSummarySelector from "./agenda/AgendaSummarySelector.jsx";

import "../styles/agenda/dashboard-agenda.css";

/*
DashboardAgenda – CANÓNICO FINAL

✔ Selector resumen (mensual/semanal)
✔ Secretaría elige hasta 4 médicos reales
✔ Renderiza 1–4 calendarios simultáneos
✔ Click día → abre Agenda diaria
✔ NO toca Agenda.jsx
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

  // Profesionales disponibles reales (desde backend)
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
            setSelectedDate(null); // reset día al cambiar contexto
          }}
        />
      )}

      {/* ===============================
          CUERPO PRINCIPAL
      =============================== */}
      <div className="agenda-layout">

        {/* ===============================
            IZQUIERDA — RESUMEN (1–4 médicos)
        =============================== */}
        <aside className="agenda-left">

          {/* ===== MENSUAL ===== */}
          {summaryMode === "monthly" &&
            selectedProfessionals.map((profId) => (
              <AgendaMonthSummary
                key={profId}
                professional={profId}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            ))}

          {/* ===== SEMANAL ===== */}
          {summaryMode === "weekly" &&
            selectedProfessionals.map((profId) => (
              <AgendaWeekSummary
                key={profId}
                professional={profId}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            ))}

          {/* Si no hay médicos seleccionados */}
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

              // Captura profesionales reales desde backend
              onProfessionalsLoaded={(list) => {
                setAvailableProfessionals(list);
              }}
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
