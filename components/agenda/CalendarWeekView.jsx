import { useEffect, useState } from "react";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
CalendarWeekView — VISTA PURA (SEMANA)

✔ Lógica idéntica al selector
✔ Semana NORMALIZADA a lunes
✔ Weekdays visibles (lun–dom)
✔ Colores según backend real
✔ Celdas vacías si corresponde
✔ Click → { date }
✔ NO orquesta
*/

export default function CalendarWeekView({
  professional,
  startDate,
  selectedDate,
  onSelectDate,
}) {
  const [days, setDays] = useState({});
  const [loading, setLoading] = useState(false);

  // =========================
  // Fecha base LOCAL
  // =========================
  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  const baseDate = startDate || todayISO();

  // =========================
  // HELPERS (IGUALES AL SELECTOR)
  // =========================
  function weekdayFromISO(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("es-CL", { weekday: "short" });
  }

  function weekdayIndexMondayFirst(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const jsDay = dt.getDay(); // 0 dom → 6 sáb
    return jsDay === 0 ? 6 : jsDay - 1; // lunes = 0
  }

  // =========================
  // CARGAR SUMMARY SEMANAL
  // =========================
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
        if (!res.ok) throw new Error("summary");

        const data = await res.json();
        if (!cancelled) {
          setDays(data?.days || {});
        }
      } catch {
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

  // =========================
  // RENDER
  // =========================
  const entries = Object.entries(days).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  if (!loading && entries.length === 0) {
    return (
      <div className="month-calendar">
        <h3>📆 Disponibilidad próximos 7 días</h3>
        <p>No hay agenda disponible.</p>
      </div>
    );
  }

  const firstDate = entries[0]?.[0];
  const offset = firstDate
    ? weekdayIndexMondayFirst(firstDate)
    : 0;

  return (
    <div className="month-calendar">
      <h3>📆 Disponibilidad próximos 7 días</h3>

      {loading && <p>Cargando semana…</p>}

      <div className="month-grid">
        {/* Vacíos antes del lunes */}
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
