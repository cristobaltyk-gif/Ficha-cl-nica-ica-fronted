import { useState, useEffect } from "react";
import "../../styles/agenda/agenda-summary-selector.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaSummarySelector — PRODUCCIÓN FINAL (AUTÓNOMO)

Responsabilidad:
- Cargar profesionales desde backend
- Selector maestro de profesionales (1–4)
- Selector de modo (monthly / weekly)
- CONFIRMACIÓN explícita con botón "Aplicar"
- Vive ANTES del resumen y de la agenda diaria
- NO conoce Agenda.jsx
- NO conoce fechas
- NO depende de Dashboard
*/

export default function AgendaSummarySelector({
  max = 4,
  onChange,
  defaultMode = "monthly",
}) {
  // =========================
  // Estado
  // =========================
  const [mode, setMode] = useState(defaultMode);
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessionals, setSelectedProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // Cargar profesionales (AUTÓNOMO)
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadProfessionals() {
      setLoading(true);

      try {
        const res = await fetch(`${API_URL}/professionals`);
        if (!res.ok) throw new Error("error profesionales");

        const data = await res.json();

        if (!cancelled) {
          setProfessionals(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setProfessionals([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
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
    setSelectedProfessionals((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }

      if (prev.length >= max) return prev;

      return [...prev, id];
    });
  }

  // =========================
  // Aplicar selección (ÚNICO DISPARO)
  // =========================
  function applySelection() {
    if (!onChange) return;

    onChange({
      mode,
      selectedProfessionals,
    });
  }

  // =========================
  // Render
  // =========================
  return (
    <section className="agenda-summary-selector">
      {/* =========================
          MODO RESUMEN
      ========================= */}
      <div className="summary-mode">
        <button
          type="button"
          className={mode === "monthly" ? "active" : ""}
          onClick={() => setMode("monthly")}
        >
          Resumen mensual
        </button>

        <button
          type="button"
          className={mode === "weekly" ? "active" : ""}
          onClick={() => setMode("weekly")}
        >
          Resumen semanal
        </button>
      </div>

      {/* =========================
          PROFESIONALES
      ========================= */}
      <div className="summary-professionals">
        {loading && (
          <div className="agenda-placeholder">
            Cargando profesionales…
          </div>
        )}

        {!loading && professionals.length === 0 && (
          <div className="agenda-placeholder">
            No hay profesionales cargados
          </div>
        )}

        {!loading &&
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
          FOOTER + APLICAR
      ========================= */}
      <div className="summary-footer">
        <span>
          Seleccionados: {selectedProfessionals.length} / {max}
        </span>

        <button
          type="button"
          className="apply-btn"
          disabled={selectedProfessionals.length === 0}
          onClick={applySelection}
        >
          Aplicar selección
        </button>
      </div>
    </section>
  );
}
