import { useState, useEffect } from "react";
import "../../styles/agenda/agenda-summary-selector.css";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaSummarySelector — AUTÓNOMO (REAL BACKEND)

MODOS:
- SECRETARIA (default): multi-médico, 30/7 días, botón aplicar
- MÉDICO: un médico fijo, semanal, auto-carga, auto-selección de día
*/

export default function AgendaSummarySelector({
  max = 4,
  defaultMode = "monthly",
  startDate,
  onSelectDay,
  professional,   // 👈 si viene, estamos en modo MÉDICO
  mode: forcedMode // 👈 opcional (ej: "week")
}) {
  // =========================
  // Flags de modo
  // =========================
  const isMedicoMode = !!professional;

  // =========================
  // Estado
  // =========================
  const [mode, setMode] = useState(
    forcedMode === "week" ? "weekly" : defaultMode
  );

  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessionals, setSelectedProfessionals] = useState(
    isMedicoMode ? [professional] : []
  );

  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [summaryByProfessional, setSummaryByProfessional] = useState({});
  const [applied, setApplied] = useState(false);

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
  // Helpers
  // =========================
  function getProfessionalName(id) {
    const p = professionals.find((x) => x.id === id);
    return p?.name || id;
  }

  function weekdayFromISO(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("es-CL", { weekday: "short" });
  }

  function weekdayIndexMondayFirst(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const jsDay = dt.getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  }

  function pickBestDate(days) {
    const dates = Object.keys(days).sort();
    if (dates.length === 0) return null;

    const today = todayISO();

    if (dates.includes(today)) return today;

    const future = dates.find((d) => d > today);
    if (future) return future;

    return dates[dates.length - 1];
  }

  // =========================
  // Cargar profesionales (SOLO SECRETARIA)
  // =========================
  useEffect(() => {
    if (isMedicoMode) return;

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
  }, [isMedicoMode]);

  // =========================
  // Selección profesionales (SECRETARIA)
  // =========================
  function toggleProfessional(id) {
    if (isMedicoMode) return;

    setApplied(false);
    setSummaryByProfessional({});

    setSelectedProfessionals((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= max) return prev;
      return [...prev, id];
    });
  }

  // =========================
  // Cambiar vista (SECRETARIA)
  // =========================
  function changeMode(next) {
    if (isMedicoMode) return;

    setMode(next);
    setApplied(false);
    setSummaryByProfessional({});
  }

  // =========================
  // APPLY (SECRETARIA)
  // =========================
  async function applySelection() {
    if (isMedicoMode) return;
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
  // AUTO APPLY (MÉDICO)
  // =========================
  useEffect(() => {
    if (!isMedicoMode) return;

    async function autoApply() {
      setLoadingSummary(true);

      const url =
        `${API_URL}/agenda/summary/week` +
        `?professional=${encodeURIComponent(professional)}` +
        `&start_date=${encodeURIComponent(baseDate)}`;

      try {
        const res = await fetch(url);
        if (!res.ok) return;

        const data = await res.json();
        const days = data?.days || {};

        setSummaryByProfessional({
          [professional]: days
        });
        setApplied(true);

        const bestDate = pickBestDate(days);
        if (bestDate) {
          onSelectDay?.({
            professional,
            date: bestDate
          });
        }
      } finally {
        setLoadingSummary(false);
      }
    }

    autoApply();
  }, [isMedicoMode, professional, baseDate]);

  // =========================
  // Render
  // =========================
  return (
    <section className="agenda-summary-selector">

      {/* =========================
          MODO (SOLO SECRETARIA)
      ========================= */}
      {!isMedicoMode && (
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
      )}

      {/* =========================
          PROFESIONALES (SOLO SECRETARIA)
      ========================= */}
      {!isMedicoMode && (
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
      )}

      {/* =========================
          FOOTER (SOLO SECRETARIA)
      ========================= */}
      {!isMedicoMode && (
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
      )}

      {/* =========================
          CALENDARIOS
      ========================= */}
      {applied &&
        Object.entries(summaryByProfessional).map(
          ([professionalId, days]) => {
            const entries = Object.entries(days).sort(
              ([a], [b]) => a.localeCompare(b)
            );

            if (entries.length === 0) {
              return (
                <div key={professionalId} className="month-calendar">
                  <h4>{getProfessionalName(professionalId)}</h4>
                  <p>No hay cupos disponibles.</p>
                </div>
              );
            }

            const firstDate = entries[0][0];
            const offset = weekdayIndexMondayFirst(firstDate);

            return (
              <div key={professionalId} className="month-calendar">
                {!isMedicoMode && (
                  <h4>{getProfessionalName(professionalId)}</h4>
                )}

                <div className="month-grid">
                  {Array.from({ length: offset }).map((_, i) => (
                    <div key={`empty-${i}`} className="day-cell empty" />
                  ))}

                  {entries.map(([date, status]) => {
                    const clickable =
                      status === "free" || status === "low";

                    return (
                      <button
                        key={date}
                        className={`day-cell ${status}`}
                        disabled={!clickable}
                        onClick={() =>
                          clickable &&
                          onSelectDay?.({
                            professional: professionalId,
                            date
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
              </div>
            );
          }
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
