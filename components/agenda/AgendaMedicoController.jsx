import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";

import CalendarWeekView from "./CalendarWeekView";
import AgendaDayController from "./AgendaDayController";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaMedicoController — PRODUCCIÓN REAL

REGLAS (RESPETADAS):
✔ NO selector
✔ NO multi-médico
✔ Profesional viene desde LOGIN
✔ Resumen semanal SOLO orientativo
✔ Agenda diaria SIEMPRE se construye desde schedule
✔ Backend SOLO guarda lo ocupado
*/

export default function AgendaMedicoController() {
  const { professional } = useAuth(); 
  // professional === "huerta"

  const [selectedDate, setSelectedDate] = useState(null);

  // =========================
  // SEGURIDAD DURA
  // =========================
  if (!professional) {
    return (
      <div className="agenda-placeholder">
        Médico sin profesional asignado
      </div>
    );
  }

  // =========================
  // FECHA BASE
  // =========================
  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  // =========================
  // AUTO-SELECCIÓN INICIAL
  // =========================
  useEffect(() => {
    // 🔑 IMPORTANTE:
    // Aunque summary diga "empty",
    // igual hay agenda si el schedule existe
    setSelectedDate(todayISO());
  }, []);

  // =========================
  // RENDER
  // =========================
  return (
    <section className="agenda-medico">

      {/* =========================
          RESUMEN SEMANAL (VISUAL)
          NO decide agenda diaria
      ========================= */}
      <CalendarWeekView
        professional={professional}
        startDate={todayISO()}
        selectedDate={
          selectedDate ? { date: selectedDate } : null
        }
        onSelectDate={({ date }) => setSelectedDate(date)}
      />

      {/* =========================
          AGENDA DIARIA REAL
          Slots desde schedule
          Backend solo pisa ocupados
      ========================= */}
      {selectedDate && (
        <AgendaDayController
          professional={professional}
          date={selectedDate}
        />
      )}
    </section>
  );
}
