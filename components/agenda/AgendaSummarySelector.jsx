import { useState, useEffect } from "react";
import "../../styles/agenda/agenda-summary-selector.css";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaSummarySelector — AUTÓNOMO (REAL BACKEND)

✔ Carga profesionales: GET /professionals
✔ Selector profesionales (1–4)
✔ Selector vista: 30 días / 7 días
✔ Botón Aplicar (único disparo)
✔ Backend REAL:
   - /agenda/summary/month?professional=...&start_date=YYYY-MM-DD
   - /agenda/summary/week?professional=...&start_date=YYYY-MM-DD
✔ Renderiza hasta 4 médicos en paralelo
✔ Click día → onSelectDay({ professional, date })
*/

export default function AgendaSummarySelector({
  max = 4,
  defaultMode = "monthly", // "monthly" | "weekly"
  startDate,               // opcional YYYY-MM-DD; si no, usa HOY
  onSelectDay,             // ({ professional, date })
}) {
  // =========================
  // Estado
  // =========================
  const [mode, setMode] = useState(defaultMode);
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessionals, setSelectedProfessionals] = useState([]);

  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // ⬇️ CAMBIO CLAVE: por profesional
  const [summaryByProfessional, setSummaryByProfessional] = useState({});
  const [applied, setApplied] = useState(false);

  // =========================
  // Fecha base REAL
  // =========================
  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  const baseDate = startDate || todayISO();

  // =========================
  // Cargar profesionales (REAL)
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
  // Cambiar vista (NO llama backend)
  // =========================
  function changeMode(next) {
    setMode(next);
    setApplied(false);
    setSummaryByProfessional({});
  }

  // =========================
  // APLICAR → BACKEND REAL
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
      {/* =========================
          SELECTOR VISTA (30 / 7)
      ========================= */}
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

      {/* =========================
          PROFESIONALES
      ========================= */}
      <div className="summary-professionals">
        {loadingProfessionals && (
          <div className="agenda-placeholder">Cargando profesionales…</div>
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
          CALENDARIOS POR MÉDICO
      ========================= */}
      {applied &&
        Object.entries(summaryByProfessional).map(
          ([professionalId, days]) => (
            <div key={professionalId} className="month-calendar">
              <h4>{professionalId}</h4>

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
                    {date.slice(-2)}
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
