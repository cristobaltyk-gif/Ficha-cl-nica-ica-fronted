import { useEffect, useState } from "react";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
CalendarMonthView — CONTROLLER + VIEW (MONTH)

✔ Llama backend (/agenda/summary/month)
✔ Normaliza inicio por LUNES
✔ Pinta weekdays
✔ Agrega celdas vacías
✔ Colorea estados reales
✔ Click → devuelve { date }
*/

export default function CalendarMonthView({
  professional,          // string ID profesional
  startDate,             // "YYYY-MM-DD"
  selectedDate,          // { date } | null
  onSelectDate           // function({ date })
}) {
  const [days, setDays] = useState({});
  const [loading, setLoading] = useState(false);

  // ============================
  // Fecha base LOCAL estable
  // ============================
  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  const baseDate = startDate || todayISO();

  // ============================
  // Helpers (MISMO PATRÓN SELECTOR)
  // ============================
  function weekdayFromISO(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("es-CL", { weekday: "short" });
  }

  function weekdayIndexMondayFirst(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const jsDay = dt.getDay(); // 0 domingo
    return jsDay === 0 ? 6 : jsDay - 1; // lunes = 0
  }

  // ============================
  // Cargar summary mensual REAL
  // ============================
  useEffect(() => {
    if (!professional || !baseDate) return;

    let cancelled = false;

    async function loadSummary() {
      setLoading(true);
      try {
        const url =
          `${API_URL}/agenda/summary/month` +
          `?professional=${encodeURIComponent(professional)}` +
          `&start_date=${encodeURIComponent(baseDate)}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!cancelled && res.ok) {
          setDays(data.days || {});
        }
      } catch (err) {
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
  const entries = Object.entries(days).sort(
    ([a], [b]) => a.localeCompare(b)
  );

  if (loading) {
    return <p>Cargando calendario…</p>;
  }

  if (entries.length === 0) {
    return <p>No hay agenda disponible.</p>;
  }

  const firstDate = entries[0][0];
  const offset = weekdayIndexMondayFirst(firstDate);

  return (
    <div className="month-calendar">
      <h3>📅 Disponibilidad próximos 30 días</h3>

      <div className="month-grid">
        {/* Celdas vacías antes del lunes */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} className="day-cell empty" />
        ))}

        {entries.map(([date, status]) => {
          const clickable = status === "free" || status === "low";
          const isSelected = selectedDate?.date === date;

          return (
            <button
              key={date}
              className={`day-cell ${status} ${
                isSelected ? "selected" : ""
              }`}
              disabled={!clickable}
              onClick={() =>
                clickable && onSelectDate?.({ date })
              }
              title={date}
            >
              <div className="day-week">
                {weekdayFromISO(date)}
              </div>
              <div className="day-number">
                {date.slice(-2)}
              </div>
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
