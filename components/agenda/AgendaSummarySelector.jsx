import { useState, useEffect } from "react";
import "../../styles/agenda/agenda-summary-selector.css";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaSummarySelector — MÓDULO AUTÓNOMO FINAL (ALINEADO BACKEND)

✔ Usa contrato REAL del backend
✔ Envía professional (UNO) + month
✔ Usa fecha base = HOY
✔ Muestra SOLO 30 días hacia adelante
✔ Una llamada por profesional al presionar Aplicar
✔ Agenda pasada no se considera
*/

export default function AgendaSummarySelector({
  max = 4,
  onSelectDay, // (YYYY-MM-DD)
}) {
  // =========================
  // Estado
  // =========================
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessionals, setSelectedProfessionals] = useState([]);

  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [summaryDays, setSummaryDays] = useState({});
  const [applied, setApplied] = useState(false);

  // =========================
  // Helpers de fecha
  // =========================
  function todayISO() {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }

  function addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function currentMonth() {
    return todayISO().slice(0, 7); // YYYY-MM
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
  // APLICAR → BACKEND REAL
  // =========================
  async function applySelection() {
    if (selectedProfessionals.length === 0) return;

    setLoadingSummary(true);
    setSummaryDays({});
    setApplied(false);

    const startDate = todayISO();
    const endDate = addDays(startDate, 30);
    const month = currentMonth();

    const mergedDays = {};

    try {
      // 👉 UNA LLAMADA POR PROFESIONAL
      for (const professionalId of selectedProfessionals) {
        const res = await fetch(
          `${API_URL}/agenda/summary/month` +
            `?professional=${encodeURIComponent(professionalId)}` +
            `&month=${month}`
        );

        if (!res.ok) continue;

        const data = await res.json();
        const days = data?.days || {};

        // 👉 SOLO FUTURO (30 días)
        Object.entries(days).forEach(([date, status]) => {
          if (date < startDate || date > endDate) return;

          if (!mergedDays[date]) {
            mergedDays[date] = status;
          } else {
            // peor estado gana
            const order = ["free", "low", "full", "empty"];
            if (
              order.indexOf(status) >
              order.indexOf(mergedDays[date])
            ) {
              mergedDays[date] = status;
            }
          }
        });
      }

      setSummaryDays(mergedDays);
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
          CALENDARIO (30 DÍAS)
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
