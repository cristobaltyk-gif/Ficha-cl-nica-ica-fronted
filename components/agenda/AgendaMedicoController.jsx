import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

// 👉 MISMOS CSS QUE EL SELECTOR
import "../../styles/agenda/agenda-summary-selector.css";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaMedicoController — PRODUCCIÓN REAL (FINAL)

✔ Selector de agenda EXCLUSIVO para médico logueado
✔ Copia exacta del patrón AgendaSummarySelector
✔ Semana LUNES → DOMINGO
✔ Inserta vacíos antes del lunes
✔ Pinta weekday (lun/mar/mié)
✔ Colores reales desde backend
✔ BLOQUEA solo días "empty"
✔ Click → navega a AgendaPage
✔ NO renderiza agenda diaria
✔ NO mezcla responsabilidades
*/

export default function AgendaMedicoController() {
  const { professional } = useAuth();
  const navigate = useNavigate();

  // =========================
  // ESTADO
  // =========================
  const [weekEntries, setWeekEntries] = useState([]);
  const [loading, setLoading] = useState(false);

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
  // FECHA BASE LOCAL (SEGURA)
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
  // CARGAR SUMMARY SEMANAL
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadWeek() {
      setLoading(true);
      try {
        const url =
          `${API_URL}/agenda/summary/week` +
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
          setWeekEntries(ordered);
        }
      } catch {
        if (!cancelled) setWeekEntries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWeek();
    return () => {
      cancelled = true;
    };
  }, [professional, baseDate]);

  // =========================
  // OFFSET PARA PARTIR EN LUNES
  // =========================
  const firstDate = weekEntries[0]?.[0];
  const offset = firstDate
    ? weekdayIndexMondayFirst(firstDate)
    : 0;

  // =========================
  // RENDER
  // =========================
  return (
    <section className="agenda-medico agenda-summary-selector">

      <div className="month-calendar">
        <h3>📆 Semana</h3>

        {loading && <p>Cargando semana…</p>}

        {!loading && weekEntries.length === 0 && (
          <p>No hay agenda disponible.</p>
        )}

        <div className="month-grid">
          {/* Vacíos antes del lunes */}
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} className="day-cell empty" />
          ))}

          {weekEntries.map(([date, status]) => {
            const blocked = status === "empty";

            return (
              <button
                key={date}
                className={`day-cell ${status}`}
                disabled={blocked}
                title={date}
                onClick={() =>
                  !blocked &&
                  navigate("/agenda", {
                    state: {
                      professional,
                      date
                    }
                  })
                }
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
    </section>
  );
}
