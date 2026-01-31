import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";

import CalendarWeekView from "./CalendarWeekView";
import AgendaDayController from "./AgendaDayController";

/*
AgendaMedicoController — NAVEGADOR REAL

✔ NO pinta calendario
✔ NO calcula lunes / weekdays
✔ NO llama backend de summary
✔ Orquesta navegación semanal
✔ CalendarWeekView = vista + backend
✔ Agenda diaria intacta
*/

export default function AgendaMedicoController() {
  const { professional } = useAuth();

  // =========================
  // ESTADO
  // =========================
  const [selectedDate, setSelectedDate] = useState(null);

  // =========================
  // SEGURIDAD
  // =========================
  if (!professional) {
    return (
      <div className="agenda-placeholder">
        Médico sin profesional asignado
      </div>
    );
  }

  // =========================
  // FECHA BASE LOCAL
  // =========================
  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  const today = todayISO();

  // =========================
  // AUTO-SELECCIÓN INICIAL
  // =========================
  useEffect(() => {
    setSelectedDate({
      date: today,
      key: Date.now(), // fuerza render agenda diaria
    });
  }, [today]);

  // =========================
  // RENDER
  // =========================
  return (
    <section className="agenda-medico">

      {/* =========================
          CALENDARIO SEMANAL
          (vista + backend)
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
