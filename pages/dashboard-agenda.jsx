import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";

import AgendaPage from "./AgendaPage.jsx";

import AgendaMonthSummary from "./agenda/AgendaMonthSummary.jsx";
import AgendaWeekSummary from "./agenda/AgendaWeekSummary.jsx";
import AgendaSummarySelector from "./agenda/AgendaSummarySelector.jsx";

import "../styles/agenda/dashboard-agenda.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
DashboardAgenda – CANÓNICO FINAL (FIX REAL)

✔ Selector resumen (mensual/semanal)
✔ Secretaría elige hasta 4 médicos reales
✔ Renderiza 1–4 calendarios simultáneos
✔ Click día → abre Agenda diaria
✔ Agenda diaria recibe PROFESIONALES COMO OBJETOS
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

  // IDs seleccionados desde el selector
  const [selectedProfessionals, setSelectedProfessionals] = useState([]);

  // Fecha seleccionada desde el resumen
  const [selectedDate, setSelectedDate] = useState(null);

  // Profesionales reales (objetos desde backend)
  const [availableProfessionals, setAvailableProfessionals] = useState([]);

  // ===============================
  // CARGA PROFESIONALES (GLOBAL)
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
  // NORMALIZAR FECHA (ANTI BLANCO)
  // ===============================
  const normalizedDate =
    typeof selectedDate === "string"
      ? selectedDate
      : selectedDate?.date || null;

  // ===============================
  // 🔑 FIX CLAVE:
  // Convertir IDs → OBJETOS antes de pasar a AgendaPage
  // ===============================
  const selectedProfessionalObjects = useMemo(() => {
    if (!Array.isArray(selectedProfessionals)) return [];
    return availableProfessionals.filter((p) =>
      selectedProfessionals.includes(p.id)
    );
  }, [selectedProfessionals, availableProfessionals]);

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

          {/* Placeholder si no hay médicos */}
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
          {normalizedDate ? (
            <AgendaPage
              forcedDate={normalizedDate}
              professionals={selectedProfessionalObjects}  {/* ✅ OBJETOS */}
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
