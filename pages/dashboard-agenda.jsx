import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

import AgendaPage from "./AgendaPage.jsx";

// 👉 componentes reales
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector.jsx";

import "../styles/agenda/dashboard-agenda.css";

/*
DashboardAgenda — ESTRUCTURA PURA

✔ SOLO layout
✔ SOLO orquestación visual
✔ NO fetch
✔ NO lógica de negocio
✔ NO transformación de datos
✔ Estado UI mínimo y explícito
*/

export default function DashboardAgenda() {
  const { role } = useAuth();

  const isSecretaria = role?.name === "secretaria";
  const isMedico = role?.name === "medico";

  // ===============================
  // ESTADO VISUAL CLAVE
  // ===============================
  const [selectedDay, setSelectedDay] = useState(null);
  // { professional: string, date: "YYYY-MM-DD" }

  return (
    <div className="dashboard-agenda">

      {/* ===============================
          HEADER
      =============================== */}
      <header className="agenda-header">
        <h1>Agenda</h1>
        <span className="agenda-mode">
          {isSecretaria && "Resumen agenda"}
          {isMedico && "Agenda médica"}
        </span>
      </header>

      {/* ===============================
          SUMMARY (SECRETARIA)
      =============================== */}
      {isSecretaria && (
        <AgendaSummarySelector
          onSelectDay={(payload) => {
            // payload = { professional, date }
            setSelectedDay(payload);
          }}
        />
      )}

      {/* ===============================
          AGENDA DIARIA
      =============================== */}
      <main className="agenda-right">
        {selectedDay ? (
          <AgendaPage
            professional={selectedDay.professional}
            date={selectedDay.date}
          />
        ) : (
          <div className="agenda-placeholder">
            Selecciona un día en el resumen
          </div>
        )}
      </main>

    </div>
  );
}
