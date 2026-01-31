import { useState, useEffect } from "react";
import "../../styles/agenda/agenda-summary-selector.css";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaSummarySelector — AUTÓNOMO (REAL BACKEND)

MODOS:
- SECRETARIA (default): selector multi-médico, 30/7 días
- MÉDICO: agenda fija de UN profesional (sin selector)

REGLA:
- Si professional viene → MODO MÉDICO
- Si NO viene → MODO SECRETARIA
*/

export default function AgendaSummarySelector({
  max = 4,
  defaultMode = "monthly",
  startDate,
  onSelectDay,
  professional // 👈 SOLO se pasa desde /medico
}) {
  // =========================
  // MODO
  // =========================
  const isMedicoMode = professional !== undefined;

  // =========================
  // ESTADO
  // =========================
  const [mode, setMode] = useState(defaultMode);
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessionals, setSelectedProfessionals] = useState(
    isMedicoMode ? [professional] : []
  );

  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryByProfessional, setSummaryByProfessional] = useState({});
  const [applied, setApplied] = useState(false);

  // =========================
  // FECHA BASE
  // =========================
  function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  const baseDate = startDate || todayISO();

  // =========================
  // HELPERS
  // =========================
  function weekdayFromISO(dateStr) {
    const dt = new Date(dateStr);
    return dt.toLocaleDateString("es-CL", { weekday: "short" });
  }

  function weekdayIndexMondayFirst(dateStr) {
    const jsDay = new Date(dateStr).getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  }

  function pickBestDate(days) {
    const dates = Object.keys(days).sort();
    if (!dates.length) return null;
    const today = todayISO();
    return dates.includes(today)
      ? today
      : dates.find(d => d > today) || dates[dates.length - 1];
  }

  // =========================
  // CARGAR PROFESIONALES (SECRETARIA)
  // =========================
  useEffect(() => {
    if (isMedicoMode) return;

    async function load() {
      setLoadingProfessionals(true);
      try {
        const res = await fetch(`${API_URL}/professionals`);
        const data = await res.json();
        setProfessionals(Array.isArray(data) ? data : []);
      } finally {
        setLoadingProfessionals(false);
      }
    }

    load();
  }, [isMedicoMode]);

  // =========================
  // APPLY SECRETARIA
  // =========================
  async function applySelection() {
    if (isMedicoMode || selectedProfessionals.length === 0) return;

    setLoadingSummary(true);
    const result = {};

    for (const id of selectedProfessionals) {
      const res = await fetch(
        `${API_URL}/agenda/summary/${mode === "weekly" ? "week" : "month"}?professional=${id}&start_date=${baseDate}`
      );
      const data = await res.json();
      result[id] = data?.days || {};
    }

    setSummaryByProfessional(result);
    setApplied(true);
    setLoadingSummary(false);
  }

  // =========================
  // AUTO APPLY MÉDICO
  // =========================
  useEffect(() => {
    if (!isMedicoMode) return;

    async function autoLoad() {
      setLoadingSummary(true);
      const res = await fetch(
        `${API_URL}/agenda/summary/week?professional=${professional}&start_date=${baseDate}`
      );
      const data = await res.json();
      const days = data?.days || {};

      setSummaryByProfessional({ [professional]: days });
      setApplied(true);

      const best = pickBestDate(days);
      if (best) onSelectDay?.({ professional, date: best });

      setLoadingSummary(false);
    }

    autoLoad();
  }, [isMedicoMode, professional, baseDate]);

  // =========================
  // RENDER
  // =========================
  return (
    <section className="agenda-summary-selector">

      {/* ===== SECRETARIA CONTROLES ===== */}
      {!isMedicoMode && (
        <>
          <div className="summary-mode">
            <button
              className={mode === "monthly" ? "active" : ""}
              onClick={() => setMode("monthly")}
            >
              30 días
            </button>
            <button
              className={mode === "weekly" ? "active" : ""}
              onClick={() => setMode("weekly")}
            >
              7 días
            </button>
          </div>

          <div className="summary-professionals">
            {loadingProfessionals && <div>Cargando…</div>}
            {professionals.map(p => (
              <label key={p.id}>
                <input
                  type="checkbox"
                  checked={selectedProfessionals.includes(p.id)}
                  onChange={() =>
                    setSelectedProfessionals(prev =>
                      prev.includes(p.id)
                        ? prev.filter(x => x !== p.id)
                        : prev.length < max ? [...prev, p.id] : prev
                    )
                  }
                />
                {p.name}
              </label>
            ))}
          </div>

          <button onClick={applySelection} disabled={loadingSummary}>
            Aplicar
          </button>
        </>
      )}

      {/* ===== CALENDARIO ===== */}
      {applied &&
        Object.entries(summaryByProfessional).map(([profId, days]) => {
          const entries = Object.entries(days).sort();
          const offset = entries.length
            ? weekdayIndexMondayFirst(entries[0][0])
            : 0;

          return (
            <div key={profId} className="month-calendar">
              <div className="month-grid">
                {Array.from({ length: offset }).map((_, i) => (
                  <div key={i} className="day-cell empty" />
                ))}
                {entries.map(([date, status]) => (
                  <button
                    key={date}
                    className={`day-cell ${status}`}
                    onClick={() =>
                      onSelectDay?.({ professional: profId, date })
                    }
                  >
                    <div>{weekdayFromISO(date)}</div>
                    <div>{date.slice(-2)}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
    </section>
  );
}
