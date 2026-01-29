import { useState, useEffect } from "react";
import "../../styles/agenda/agenda-summary-selector.css";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaSummarySelector — MÓDULO AUTÓNOMO FINAL

Responsabilidad:
- Cargar profesionales
- Selección (1–4)
- Botón Aplicar
- Llamar backend de resumen (month / week)
- Pintar cupos disponibles
- Emitir evento simple al padre (día seleccionado)

REUTILIZABLE:
- Secretaría
- Agenda online pacientes
*/

export default function AgendaSummarySelector({
  max = 4,
  defaultMode = "monthly",
  onSelectDay, // (dateString)
}) {
  // =========================
  // Estado
  // =========================
  const [mode, setMode] = useState(defaultMode);
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessionals, setSelectedProfessionals] = useState([]);

  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [summaryDays, setSummaryDays] = useState({}); // { "YYYY-MM-DD": "free|low|full" }
  const [applied, setApplied] = useState(false);

  // =========================
  // Cargar profesionales
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadProfessionals() {
      setLoadingProfessionals(true);

      try {
        const res = await fetch(`${API_URL}/professionals`);
        if (!res.ok) throw new Error();

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
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= max) return prev;
      return [...prev, id];
    });
  }

  // =========================
  // APLICAR → LLAMA BACKEND
  // =========================
  async function applySelection() {
    if (selectedProfessionals.length === 0) return;

    setLoadingSummary(true);
    setSummaryDays({});
    setApplied(false);

    try {
      const endpoint =
        mode === "monthly"
          ? "/agenda/summary/month"
          : "/agenda/summary/week";

      const params = new URLSearchParams({
        professionals: selectedProfessionals.join(","),
      });

      const res = await fetch(`${API_URL}${endpoint}?${params}`);
      if (!res.ok) throw new Error();

      const data = await res.json();
      setSummaryDays(data?.days || {});
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
  return (
    <section className="agenda-summary-selector">
      {/* =========================
          MODO
      ========================= */}
      <div className="summary-mode">
        <button
          type="button"
          className={mode === "monthly" ? "active" : ""}
          onClick={() => {
            setMode("monthly");
            setApplied(false);
            setSummaryDays({});
          }}
        >
          Resumen mensual
        </button>

        <button
          type="button"
          className={mode === "weekly" ? "active" : ""}
          onClick={() => {
            setMode("weekly");
            setApplied(false);
            setSummaryDays({});
          }}
        >
          Resumen semanal
        </button>
      </div>

      {/* =========================
          PROFESIONALES
      ========================= */}
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
                className={`professional-item ${
                  checked ? "active" : ""
                } ${disabled ? "disabled" : ""}`}
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
          {Object.keys(summaryDays).length === 0 && (
            <p>No hay cupos disponibles.</p>
          )}

          <div className="month-grid">
            {Object.entries(summaryDays).map(([date, status]) => (
              <button
                key={date}
                className={`day-cell ${status}`}
                onClick={() => onSelectDay?.(date)}
              >
                {date.slice(-2)}
              </button>
            ))}
          </div>

          <div className="legend">
            <span className="free">🟢 libre</span>
            <span className="low">🟡 pocos</span>
            <span className="full">🔴 lleno</span>
          </div>
        </div>
      )}
    </section>
  );
}
