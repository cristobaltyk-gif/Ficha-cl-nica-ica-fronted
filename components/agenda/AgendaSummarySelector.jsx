import { useState, useEffect } from "react";
import "../../styles/agenda/agenda-summary-selector.css";

/*
AgendaSummarySelector — PRODUCCIÓN FINAL

Responsabilidad:
- Selector maestro de profesionales (1–4)
- Selector de modo (monthly / weekly)
- Vive ANTES del resumen y de la agenda diaria
- NO conoce Agenda.jsx
- NO conoce fechas
*/

export default function AgendaSummarySelector({
  professionals = [],   // [{ id, name }]
  max = 4,
  onChange,
  defaultMode = "monthly",
}) {
  const [mode, setMode] = useState(defaultMode);
  const [selectedProfessionals, setSelectedProfessionals] = useState([]);

  // 🔔 Notificar cambios SOLO cuando hay cambios reales
  useEffect(() => {
    if (!onChange) return;

    onChange({
      mode,
      selectedProfessionals,
    });
  }, [mode, selectedProfessionals, onChange]);

  function toggleProfessional(id) {
    setSelectedProfessionals((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }

      if (prev.length >= max) return prev;

      return [...prev, id];
    });
  }

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
        {professionals.length === 0 && (
          <div className="agenda-placeholder">
            No hay profesionales cargados
          </div>
        )}

        {professionals.map((p) => {
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
          FOOTER
      ========================= */}
      <div className="summary-footer">
        Seleccionados: {selectedProfessionals.length} / {max}
      </div>
    </section>
  );
}
