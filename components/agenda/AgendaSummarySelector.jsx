import { useState, useEffect } from "react";
import "../../styles/agenda/agenda-summary-selector.css";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaSummarySelector — MÓDULO AUTÓNOMO (MES + SEMANA) — PRODUCCIÓN

✔ Carga profesionales desde backend: GET /professionals
✔ Selector de profesionales (1–4)
✔ Selector de vista: Mensual (30 días) / Semanal (7 días)
✔ Botón Aplicar (único disparo)
✔ Backend REAL:
   - GET /agenda/summary/month?professional=...&start_date=YYYY-MM-DD  (30 días)
   - GET /agenda/summary/week?professional=...&start_date=YYYY-MM-DD   (7 días)
✔ Pinta estados: free | low | full | empty
✔ Click día → onSelectDay("YYYY-MM-DD")
*/

export default function AgendaSummarySelector({
  max = 4,
  onSelectDay,     // (YYYY-MM-DD)
  defaultMode = "monthly", // "monthly" | "weekly"
  startDate,       // opcional: fecha base YYYY-MM-DD; si no, usa HOY
}) {
  // =========================
  // Estado
  // =========================
  const [mode, setMode] = useState(defaultMode); // monthly | weekly
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessionals, setSelectedProfessionals] = useState([]);

  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [summaryDays, setSummaryDays] = useState({}); // { "YYYY-MM-DD": "free|low|full|empty" }
  const [applied, setApplied] = useState(false);

  // =========================
  // Fecha base
  // =========================
  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  const baseDate = startDate || todayISO();

  // =========================
  // Cargar profesionales (cada vez que se monta)
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadProfessionals() {
      setLoadingProfessionals(true);
      try {
        const res = await fetch(`${API_URL}/professionals`);
        if (!res.ok) throw new Error("professionals");
        const data = await res.json();

        if (!cancelled) {
          setProfessionals(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) setProfessionals([]);
      } finally {
        if (!cancelled) setLoadingProfessionals(false);
      }
    }

    loadProfessionals();
    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // Selección profesionales
  // =========================
  function toggleProfessional(id) {
    setApplied(false);
    setSummaryDays({});

    setSelectedProfessionals((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= max) return prev;
      return [...prev, id];
    });
  }

  // =========================
  // Cambiar modo (NO llama backend)
  // =========================
  function setModeSafe(next) {
    setMode(next);
    setApplied(false);
    setSummaryDays({});
  }

  // =========================
  // APLICAR → Backend REAL
  // =========================
  async function applySelection() {
    if (selectedProfessionals.length === 0) return;

    setLoadingSummary(true);
    setSummaryDays({});
    setApplied(false);

    const endpoint =
      mode === "weekly"
        ? "/agenda/summary/week"
        : "/agenda/summary/month"; // monthly

    const merged = {};

    try {
      for (const professionalId of selectedProfessionals) {
        const url =
          `${API_URL}${endpoint}` +
          `?professional=${encodeURIComponent(professionalId)}` +
          `&start_date=${encodeURIComponent(baseDate)}`;

        const res = await fetch(url);
        if (!res.ok) continue;

        const data = await res.json();
        const days = data?.days || {};

        // merge por "peor estado gana"
        // (mantengo tu orden original)
        const order = ["free", "low", "full", "empty"];

        Object.entries(days).forEach(([date, status]) => {
          if (!merged[date]) {
            merged[date] = status;
            return;
          }
          if (order.indexOf(status) > order.indexOf(merged[date])) {
            merged[date] = status;
          }
        });
      }

      setSummaryDays(merged);
      setApplied(true);
    } catch {
      setSummaryDays({});
    } finally {
      setLoadingSummary(false);
    }
  }

  // =========================
  // Render
  // =========================
  const dayEntries = Object.entries(summaryDays);

  return (
    <section className="agenda-summary-selector">
      {/* =========================
          MODO (selector de vista)
      ========================= */}
      <div className="summary-mode">
        <button
          type="button"
          className={mode === "monthly" ? "active" : ""}
          onClick={() => setModeSafe("monthly")}
        >
          Mensual (30 días)
        </button>

        <button
          type="button"
          className={mode === "weekly" ? "active" : ""}
          onClick={() => setModeSafe("weekly")}
        >
          Semanal (7 días)
        </button>
      </div>

      {/* =========================
          PROFESIONALES
      ========================= */}
      <div className="summary-professionals">
        {loadingProfessionals && (
          <div className="agenda-placeholder">Cargando profesionales…</div>
        )}

        {!loadingProfessionals && professionals.length === 0 && (
          <div className="agenda-placeholder">No hay profesionales cargados</div>
        )}

        {!loadingProfessionals &&
          professionals.map((p) => {
            const checked = selectedProfessionals.includes(p.id);
            const disabled = !checked && selectedProfessionals.length >= max;

            return (
              <label
                key={p.id}
                className={`professional-item ${checked ? "active" : ""} ${
                  disabled ? "disabled" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleProfessional(p.id)}
                />
                {p.name}
              </label>
            );
          })}
      </div>

      {/* =========================
          APLICAR
      ========================= */}
      <div className="summary-footer">
        <span>
          Seleccionados: {selectedProfessionals.length} / {max}
        </span>

        <button
          type="button"
          className="apply-btn"
          disabled={selectedProfessionals.length === 0 || loadingSummary}
          onClick={applySelection}
        >
          {loadingSummary ? "Cargando…" : "Aplicar"}
        </button>
      </div>

      {/* =========================
          CALENDARIO RESULTADO
      ========================= */}
      {applied && (
        <div className="month-calendar">
          {dayEntries.length === 0 && <p>No hay cupos disponibles.</p>}

          <div className="month-grid">
            {dayEntries.map(([date, status]) => (
              <button
                key={date}
                className={`day-cell ${status}`}
                onClick={() => onSelectDay?.(date)}
                title={date}
              >
                {date.slice(-2)}
              </button>
            ))}
          </div>

          <div className="legend">
            <span className="free">🟢 libre</span>
            <span className="low">🟡 pocos</span>
            <span className="full">🔴 lleno</span>
            <span className="empty">⚪ sin agenda</span>
          </div>
        </div>
      )}
    </section>
  );
      }
