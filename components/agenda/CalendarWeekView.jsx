import { useEffect, useState } from "react";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
CalendarWeekView (Secretaría)

✔ Vista semanal completa (lunes a domingo)
✔ Días coloreados según disponibilidad
✔ Click → devuelve OBJETO { date }
✔ NO orquesta
✔ NO decide flujos
✔ Solo pinta + notifica
*/

export default function CalendarWeekView({
  professional,          // objeto o id ya resuelto por el padre
  weekStart,             // "YYYY-MM-DD" (lunes)
  selectedDate,          // { date: "YYYY-MM-DD" } | null
  onSelectDate           // function({ date })
}) {
  const [days, setDays] = useState({});
  const [loading, setLoading] = useState(false);

  // ============================
  // Cargar summary semanal backend
  // ============================
  useEffect(() => {
    if (!professional || !weekStart) return;

    let cancelled = false;

    async function loadSummary() {
      setLoading(true);

      try {
        const res = await fetch(
          `${API_URL}/agenda/summary/week?professional=${professional}&week_start=${weekStart}`
        );

        const data = await res.json();

        if (!cancelled && res.ok) {
          setDays(data.days || {});
        }
      } catch (err) {
        console.error("Error summary semanal", err);
        if (!cancelled) setDays({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, [professional, weekStart]);

  // ============================
  // Render calendario semanal
  // ============================
  const dayKeys = Object.keys(days);

  return (
    <div className="month-calendar">
      <h3>📆 Disponibilidad semanal</h3>

      {loading && <p>Cargando semana…</p>}

      {!loading && dayKeys.length === 0 && (
        <p>No hay agenda para esta semana.</p>
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
              {day.slice(8, 10)}
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
