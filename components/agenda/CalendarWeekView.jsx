import { useEffect, useState } from "react";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
CalendarWeekView (Secretaría / Médico)

✔ Vista de 7 días CONSECUTIVOS desde start_date
✔ Días coloreados según disponibilidad real
✔ Click → devuelve OBJETO { date }
✔ NO orquesta
✔ NO decide flujos
✔ Solo pinta + notifica
✔ Contrato REAL backend (/agenda/summary/week?start_date=)
*/

export default function CalendarWeekView({
  professional,          // string ID profesional (ej: "medico1")
  startDate,             // "YYYY-MM-DD" (fecha base REAL)
  selectedDate,          // { date: "YYYY-MM-DD" } | null
  onSelectDate           // function({ date })
}) {
  const [days, setDays] = useState({});
  const [loading, setLoading] = useState(false);

  // ============================
  // Fecha base segura
  // ============================
  const baseDate =
    startDate ||
    new Date().toISOString().slice(0, 10); // hoy

  // ============================
  // Cargar summary semanal REAL
  // ============================
  useEffect(() => {
    if (!professional || !baseDate) return;

    let cancelled = false;

    async function loadSummary() {
      setLoading(true);

      try {
        const url =
          `${API_URL}/agenda/summary/week` +
          `?professional=${encodeURIComponent(professional)}` +
          `&start_date=${encodeURIComponent(baseDate)}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!cancelled && res.ok) {
          setDays(data.days || {});
        }
      } catch (err) {
        console.error("Error summary 7 días", err);
        if (!cancelled) setDays({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, [professional, baseDate]);

  // ============================
  // Render
  // ============================
  const dayKeys = Object.keys(days);

  return (
    <div className="month-calendar">
      <h3>📆 Disponibilidad próximos 7 días</h3>

      {loading && <p>Cargando semana…</p>}

      {!loading && dayKeys.length === 0 && (
        <p>No hay agenda disponible.</p>
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
              onClick={() => onSelectDate?.({ date: day })}
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
