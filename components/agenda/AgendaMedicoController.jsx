import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";

import CalendarWeekView from "./CalendarWeekView";
import AgendaDayController from "./AgendaDayController";

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

  // =========================
  // ESTADO
  // =========================
  const [selectedDate, setSelectedDate] = useState(null);
  // selectedDate = { date: "YYYY-MM-DD", key: number }

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
  // FECHA BASE (UNA SOLA VEZ)
  // =========================
  const today = new Date().toISOString().slice(0, 10);

  // =========================
  // AUTO-SELECCIÓN INICIAL
  // =========================
  useEffect(() => {
    // Fuerza activación real de agenda diaria
    setSelectedDate({
      date: today,
      key: Date.now(),
    });
  }, [today]);

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
        startDate={today}
        selectedDate={selectedDate}
        onSelectDate={({ date }) =>
          setSelectedDate({
            date,
            key: Date.now(),
          })
        }
      />

      {/* =========================
          AGENDA DIARIA REAL
          Slots desde schedule
          Backend solo pisa ocupados
      ========================= */}
      {selectedDate && (
        <AgendaDayController
          key={selectedDate.key}
          professional={professional}
          date={selectedDate.date}
        />
      )}
    </section>
  );
}
