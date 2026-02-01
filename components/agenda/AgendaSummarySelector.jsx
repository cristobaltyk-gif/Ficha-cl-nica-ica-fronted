import { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import AgendaDayController from "./AgendaDayController";

import "../../styles/agenda/agenda-summary-selector.css";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaMedicoController — FINAL REAL (CORREGIDO)

✔ Un solo médico (logueado)
✔ Mismo patrón que AgendaSummarySelector
✔ Modo semanal / mensual
✔ Semana parte en lunes
✔ Rellena días blancos
✔ Colores reales backend
✔ Bloquea solo EMPTY
✔ Click abre agenda diaria
*/

export default function AgendaMedicoController() {
  const { professional } = useAuth();

  // =========================
  // ESTADO
  // =========================
  const [mode, setMode] = useState("weekly"); // weekly | monthly
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // SEGURIDAD
  // =========================
  if (!professional) {
    return <div className="agenda-placeholder">Médico sin profesional</div>;
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

  const baseDate = todayISO();

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
    const jsDay = dt.getDay(); // 0 domingo
    return jsDay === 0 ? 6 : jsDay - 1; // lunes = 0
  }

  // =========================
  // CARGAR SUMMARY (SEMANA / MES)
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setLoading(true);
      setEntries([]);          // ✅ FIX CRÍTICO
      setSelectedDate(null);

      const endpoint =
        mode === "weekly"
          ? "/agenda/summary/week"
          : "/agenda/summary/month";

      try {
        const url =
          `${API_URL}${endpoint}` +
          `?professional=${encodeURIComponent(professional)}` +
          `&start_date=${encodeURIComponent(baseDate)}`;

        const res = await fetch(url);
        if (!res.ok) return;

        const data = await res.json();
        const days = data?.days || {};

        const ordered = Object.entries(days).sort(
          ([a], [b]) => a.localeCompare(b)
        );

        if (!cancelled) {
          setEntries(ordered);

          // auto seleccionar primer día válido
          const firstValid = ordered.find(
            ([, status]) => status !== "empty"
          );

          if (firstValid) {
            setSelectedDate({
              date: firstValid[0],
              key: Date.now(),
            });
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSummary();
    return () => {
      cancelled = true;
    };
  }, [professional, mode, baseDate]);

  // =========================
  // OFFSET PARA PARTIR EN LUNES
  // =========================
  const firstDate = entries[0]?.[0];
  const offset = firstDate ? weekdayIndexMondayFirst(firstDate) : 0;

  // =========================
  // RENDER
  // =========================
  return (
    <section className="agenda-medico">

      {/* =========================
          SELECTOR SEMANA / MES
      ========================= */}
      <div className="summary-mode">
        <button
          type="button"
          className={mode === "monthly" ? "active" : ""}
          onClick={() => setMode("monthly")}
        >
          30 días
        </button>

        <button
          type="button"
          className={mode === "weekly" ? "active" : ""}
          onClick={() => setMode("weekly")}
        >
          7 días
        </button>
      </div>

      {/* =========================
          CALENDARIO
      ========================= */}
      <div className="month-calendar">
        <h3>📆 {mode === "weekly" ? "Semana" : "Mes"}</h3>

        {loading && <p>Cargando…</p>}

        {!loading && entries.length === 0 && (
          <p>No hay agenda disponible.</p>
        )}

        <div className="month-grid">
          {/* Vacíos antes del lunes */}
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} className="day-cell empty" />
          ))}

          {entries.map(([date, status]) => {
            const clickable = status !== "empty";

            return (
              <button
                key={date}
                className={`day-cell ${status} ${
                  selectedDate?.date === date ? "selected" : ""
                }`}
                disabled={!clickable}
                onClick={() =>
                  clickable &&
                  setSelectedDate({
                    date,
                    key: Date.now(),
                  })
                }
                title={date}
              >
                <div className="day-week">{weekdayFromISO(date)}</div>
                <div className="day-number">{date.slice(-2)}</div>
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

      {/* =========================
          AGENDA DIARIA
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
