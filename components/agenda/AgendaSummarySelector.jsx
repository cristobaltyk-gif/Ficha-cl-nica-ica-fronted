import { useState, useEffect } from "react";
import "../../styles/agenda/agenda-summary-selector.css";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaSummarySelector — AUTÓNOMO (REAL BACKEND)
*/

export default function AgendaSummarySelector({
  max = 4,
  defaultMode = "monthly",
  startDate,
  onSelectDay,
}) {
  // =========================
  // Estado
  // =========================
  const [mode, setMode] = useState(defaultMode);
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessionals, setSelectedProfessionals] = useState([]);

  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [summaryByProfessional, setSummaryByProfessional] = useState({});
  const [applied, setApplied] = useState(false);

  // =========================
  // Fecha base LOCAL (OK)
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
  // Helpers
  // =========================
  function getProfessionalName(id) {
    const p = professionals.find((x) => x.id === id);
    return p?.name || id;
  }

  // ✅ FIX REAL: weekday LOCAL SIN UTC
  function weekdayFromISO(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d); // LOCAL
    return dt.toLocaleDateString("es-CL", { weekday: "short" });
  }

  // =========================
  // Cargar profesionales
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
    setSummaryByProfessional({});

    setSelectedProfessionals((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= max) return prev;
      return [...prev, id];
    });
  }

  // =========================
  // Cambiar vista
  // =========================
  function changeMode(next) {
    setMode(next);
    setApplied(false);
    setSummaryByProfessional({});
  }

  // =========================
  // APLICAR → BACKEND
  // =========================
  async function applySelection() {
    if (selectedProfessionals.length === 0) return;

    setLoadingSummary(true);
    setSummaryByProfessional({});
    setApplied(false);

    const endpoint =
      mode === "weekly"
        ? "/agenda/summary/week"
        : "/agenda/summary/month";

    const result = {};

    try {
      for (const professionalId of selectedProfessionals) {
        const url =
          `${API_URL}${endpoint}` +
          `?professional=${encodeURIComponent(professionalId)}` +
          `&start_date=${encodeURIComponent(baseDate)}`;

        const res = await fetch(url);
        if (!res.ok) continue;

        const data = await res.json();
        result[professionalId] = data?.days || {};
      }

      setSummaryByProfessional(result);
      setApplied(true);
    } catch {
      setSummaryByProfessional({});
    } finally {
      setLoadingSummary(false);
    }
  }

  // =========================
  // Render
  // =========================
  return (
    <section className="agenda-summary-selector">

      <div className="summary-mode">
        <button
          type="button"
          className={mode === "monthly" ? "active" : ""}
          onClick={() => changeMode("monthly")}
        >
          30 días
        </button>

        <button
          type="button"
          className={mode === "weekly" ? "active" : ""}
          onClick={() => changeMode("weekly")}
        >
          7 días
        </button>
      </div>

      <div className="summary-professionals">
        {loadingProfessionals && (
          <div className="agenda-placeholder">
            Cargando profesionales…
          </div>
        )}

        {!loadingProfessionals && professionals.length === 0 && (
          <div className="agenda-placeholder">
            No hay profesionales cargados
          </div>
        )}

        {!loadingProfessionals &&
          professionals.map((p) => {
            const checked = selectedProfessionals.includes(p.id);
            const disabled =
              !checked && selectedProfessionals.length >= max;

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

      {applied &&
        Object.entries(summaryByProfessional).map(
          ([professionalId, days]) => (
            <div key={professionalId} className="month-calendar">
              <h4>{getProfessionalName(professionalId)}</h4>

              {Object.keys(days).length === 0 && (
                <p>No hay cupos disponibles.</p>
              )}

              <div className="month-grid">
                {Object.entries(days).map(([date, status]) => (
                  <button
                    key={date}
                    className={`day-cell ${status}`}
                    onClick={() =>
                      onSelectDay?.({
                        professional: professionalId,
                        date,
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
                ))}
              </div>
            </div>
          )
        )}

      {applied && (
        <div className="legend">
          <span className="free">🟢 libre</span>
          <span className="low">🟡 pocos</span>
          <span className="full">🔴 lleno</span>
          <span className="empty">⚪ sin agenda</span>
        </div>
      )}
    </section>
  );
}
