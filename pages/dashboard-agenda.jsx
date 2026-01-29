import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";

import AgendaPage from "./AgendaPage.jsx";

import AgendaMonthSummary from "./agenda/AgendaMonthSummary.jsx";
import AgendaWeekSummary from "./agenda/AgendaWeekSummary.jsx";
import AgendaSummarySelector from "./agenda/AgendaSummarySelector.jsx";

import "../styles/agenda/dashboard-agenda.css";

const API_URL = import.meta.env.VITE_API_URL;

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

  // IDs seleccionados
  const [selectedProfessionals, setSelectedProfessionals] = useState([]);

  // Fecha seleccionada (CONTRATO ÚNICO)
  // { date: "YYYY-MM-DD" } | null
  const [selectedDate, setSelectedDate] = useState(null);

  // Profesionales reales
  const [availableProfessionals, setAvailableProfessionals] = useState([]);

  // ===============================
  // CARGA PROFESIONALES
  // ===============================
  useEffect(() => {
    async function loadProfessionals() {
      try {
        const res = await fetch(`${API_URL}/professionals`);
        const data = await res.json();
        setAvailableProfessionals(Array.isArray(data) ? data : []);
      } catch {
        setAvailableProfessionals([]);
      }
    }

    loadProfessionals();
  }, []);

  // ===============================
  // FECHA NORMALIZADA (YA STRING)
  // ===============================
  const normalizedDate = selectedDate?.date || null;

  // ===============================
  // IDs → OBJETOS (AGENDA DIARIA)
  // ===============================
  const selectedProfessionalObjects = useMemo(() => {
    return availableProfessionals.filter((p) =>
      selectedProfessionals.includes(p.id)
    );
  }, [selectedProfessionals, availableProfessionals]);

  return (
    <div className="dashboard-agenda">
      <header className="agenda-header">
        <h1>Agenda</h1>
        <span className="agenda-mode">
          {summaryMode === "monthly" && "Resumen mensual"}
          {summaryMode === "weekly" && "Resumen semanal"}
        </span>
      </header>

      {/* SELECTOR */}
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

      <div className="agenda-layout">
        {/* RESUMEN */}
        <aside className="agenda-left">
          {summaryMode === "monthly" &&
            selectedProfessionals.map((profId) => (
              <AgendaMonthSummary
                key={profId}
                professional={profId}
                selectedDate={normalizedDate}
                onSelectDate={setSelectedDate}
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

        {/* AGENDA DIARIA */}
        <main className="agenda-right">
          {normalizedDate ? (
            <AgendaPage
              forcedDate={normalizedDate}
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
