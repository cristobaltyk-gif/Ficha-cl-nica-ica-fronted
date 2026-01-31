import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector.jsx";
import AgendaPage from "./AgendaPage.jsx";

import "../styles/agenda/dashboard-agenda.css";

/*
AgendaMedicoView — ORQUESTADOR VISUAL MÉDICO (PRODUCCIÓN)

✔ SOLO composición visual
✔ Usa componentes REALES existentes
✔ Resumen semanal del médico logeado
✔ Click en día → agenda diaria real
✔ NO lógica clínica
✔ NO cerebro coordinador
*/

export default function AgendaMedicoView() {
  const { session } = useAuth();

  // ===============================
  // ESTADO VISUAL
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
        <span className="agenda-mode">Agenda médica</span>
      </header>

      {/* ===============================
          RESUMEN SEMANAL MÉDICO
          (componente REAL existente)
      =============================== */}
      <AgendaSummarySelector
        professional={session?.usuario}
        mode="week"
        onSelectDay={(payload) => {
          // payload = { professional, date }
          setSelectedDay(payload);
        }}
      />

      {/* ===============================
          AGENDA DIARIA REAL
      =============================== */}
      <main className="agenda-right">
        {selectedDay ? (
          <AgendaPage
            professional={selectedDay.professional}
            date={selectedDay.date}
          />
        ) : (
          <div className="agenda-placeholder">
            Selecciona un día de la semana
          </div>
        )}
      </main>

    </div>
  );
}
