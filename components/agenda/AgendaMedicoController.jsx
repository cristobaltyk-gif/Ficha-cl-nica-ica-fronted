import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";

import AgendaDayController from "./AgendaDayController";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaMedicoController — PRODUCCIÓN REAL (CONTROLLER REAL)

✔ Copia patrón de AgendaSummarySelector
✔ Semana LUNES → DOMINGO
✔ Inserta vacíos antes del lunes
✔ Pinta weekday (lun/mar/mié)
✔ Decide estados (free / low / full / empty)
✔ Agenda diaria intacta
*/

export default function AgendaMedicoController() {
  const { professional } = useAuth();

  // =========================
  // ESTADO
  // =========================
  const [weekEntries, setWeekEntries] = useState([]);
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
  // HELPERS (IGUAL AL SELECTOR)
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
  // CARGAR SUMMARY SEMANAL
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadWeek() {
      try {
        const url =
          `${API_URL}/agenda/summary/week` +
          `?professional=${encodeURIComponent(professional)}` +
          `&start_date=${encodeURIComponent(today)}`;

        const res = await fetch(url);
        if (!res.ok) return;

        const data = await res.json();
        const days = data?.days || {};

        const entries = Object.entries(days).sort(
          ([a], [b]) => a.localeCompare(b)
        );

        if (!cancelled) {
          setWeekEntries(entries);
        }
      } catch {
        if (!cancelled) setWeekEntries([]);
      }
    }

    loadWeek();
    return () => {
      cancelled = true;
    };
  }, [professional, today]);

  // =========================
  // AUTO-SELECCIÓN INICIAL
  // =========================
  useEffect(() => {
    setSelectedDate({
      date: today,
      key: Date.now(),
    });
  }, [today]);

  // =========================
  // OFFSET LUNES
  // =========================
  const firstDate = weekEntries[0]?.[0];
  const offset = firstDate
    ? weekdayIndexMondayFirst(firstDate)
    : 0;

  // =========================
  // RENDER
  // =========================
  return (
    <section className="agenda-medico">

      <div className="month-calendar">
        <h3>📆 Semana</h3>

        <div className="month-grid">
          {/* Vacíos antes del lunes */}
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} className="day-cell empty" />
          ))}

          {weekEntries.map(([date, status]) => {
            const clickable =
              status === "free" || status === "low";

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
