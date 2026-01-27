import { useEffect, useState } from "react";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
CalendarMonthView (Secretaría)

✔ Vista mensual completa
✔ Días coloreados según disponibilidad
✔ Click → selecciona fecha para Agenda
*/

export default function CalendarMonthView({
  professional,
  month,
  selectedDate,
  onSelectDate
}) {
  const [days, setDays] = useState({});
  const [loading, setLoading] = useState(false);

  // ============================
  // Cargar summary mensual backend
  // ============================
  useEffect(() => {
    if (!professional || !month) return;

    async function loadSummary() {
      setLoading(true);

      try {
        const res = await fetch(
          `${API_URL}/agenda/summary/month?professional=${professional}&month=${month}`
        );

        const data = await res.json();

        if (res.ok) {
          setDays(data.days || {});
        }
      } catch (err) {
        console.error("Error summary mensual", err);
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, [professional, month]);

  // ============================
  // Render calendario simple
  // ============================
  const dayKeys = Object.keys(days);

  return (
    <div className="month-calendar">
      <h3>📅 Disponibilidad mensual</h3>

      {loading && <p>Cargando calendario…</p>}

      <div className="month-grid">
        {dayKeys.map((day) => {
          const status = days[day]; // free | low | full | empty

          return (
            <button
              key={day}
              className={`day-cell ${status} ${
                selectedDate === day ? "selected" : ""
              }`}
              onClick={() => onSelectDate(day)}
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
