import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";

import AgendaPage from "./AgendaPage.jsx";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector.jsx";

import "../styles/agenda/dashboard-agenda.css";

/*
DashboardAgenda — ESTRUCTURA PURA

✔ SOLO layout
✔ SOLO orquestación visual
✔ NO fetch
✔ NO lógica clínica
✔ Estado UI mínimo
*/

export default function DashboardAgenda() {
  const { role, session } = useAuth();

  const isSecretaria = role?.name === "secretaria";
  const isMedico = role?.name === "medico";

  // ===============================
  // ESTADO VISUAL
  // ===============================
  const [selectedDay, setSelectedDay] = useState(null);
  // { professional: string, date: "YYYY-MM-DD" }

  // ===============================
  // INIT VISUAL MÉDICO
  // ===============================
  useEffect(() => {
    if (isMedico && session?.usuario) {
      const today = new Date().toISOString().slice(0, 10);

      setSelectedDay({
        professional: session.usuario, // 👈 ID del médico
        date: today
      });
    }
  }, [isMedico, session]);

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
          SUMMARY (SOLO SECRETARIA)
      =============================== */}
      {isSecretaria && (
        <AgendaSummarySelector
          onSelectDay={(payload) => {
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
            {isSecretaria
              ? "Selecciona un día en el resumen"
              : "Cargando agenda del día…"}
          </div>
        )}
      </main>

    </div>
  );
}
