import { useEffect, useState } from "react";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
CalendarMonthView (Secretaría)

✔ Vista mensual completa
✔ Días coloreados según disponibilidad
✔ Click → devuelve OBJETO { date }
✔ NO orquesta
✔ NO decide flujos
✔ Solo pinta + notifica
*/

export default function CalendarMonthView({
  professional,          // objeto o id ya resuelto por el padre
  month,                 // "YYYY-MM"
  selectedDate,          // { date: "YYYY-MM-DD" } | null
  onSelectDate           // function({ date })
}) {
  const [days, setDays] = useState({});
  const [loading, setLoading] = useState(false);

  // ============================
  // Cargar summary mensual backend
  // ============================
  useEffect(() => {
    if (!professional || !month) return;

    let cancelled = false;

    async function loadSummary() {
      setLoading(true);

      try {
        const res = await fetch(
          `${API_URL}/agenda/summary/month?professional=${professional}&month=${month}`
        );

        const data = await res.json();

        if (!cancelled && res.ok) {
          setDays(data.days || {});
        }
      } catch (err) {
        console.error("Error summary mensual", err);
        if (!cancelled) setDays({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, [professional, month]);

  // ============================
  // Render calendario
  // ============================
  const dayKeys = Object.keys(days);

  return (
    <div className="month-calendar">
      <h3>📅 Disponibilidad mensual</h3>

      {loading && <p>Cargando calendario…</p>}

      {!loading && dayKeys.length === 0 && (
        <p>No hay agenda para este mes.</p>
      )}

      <div className="month-grid">
        {dayKeys.map((day) => {
          const status = days[day]; // free | low | full | empty
          const isSelected = selectedDate?.date === day;

          return (
            <button
              key={day}
              className={`day-cell ${status} ${
                isSelected ? "selected" : ""
              }`}
              onClick={() =>
                onSelectDate?.({ date: day })
              }
            >
              {day.slice(-2)}
            </button>
          );
        })}
      </div>

      <div className="legend">
        <span className="free">🟢 libre</span>
        <span className="low">🟡 pocos</span>
        <span className="full">🔴 lleno</span>
        <span className="empty">⚪ sin agenda</span>
      </div>
    </div>
  );
}
