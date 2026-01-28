import { useState, useEffect } from "react";
import "../../styles/agenda/agenda-summary-selector.css";

/*
AgendaSummarySelector — PRODUCCIÓN

Responsabilidad:
- Selector maestro de profesionales (1–4)
- Selector de modo (monthly / weekly)
- Vive ANTES del resumen y de la agenda diaria
- NO conoce Agenda.jsx
- NO conoce fechas
*/

export default function AgendaSummarySelector({
  professionals = [],               // [{ id, name }]
  max = 4,
  onChange,                         // ({ mode, selectedProfessionals })
}) {
  const [mode, setMode] = useState("monthly");
  const [selectedProfessionals, setSelectedProfessionals] = useState([]);

  // Notificar cambios al padre (DashboardAgenda)
  useEffect(() => {
    onChange?.({
      mode,
      selectedProfessionals,
    });
  }, [mode, selectedProfessionals]);

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
          className={mode === "monthly" ? "active" : ""}
          onClick={() => setMode("monthly")}
        >
          Resumen mensual
        </button>

        <button
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

        {professionals.map((p) => (
          <label key={p.id} className="professional-item">
            <input
              type="checkbox"
              checked={selectedProfessionals.includes(p.id)}
              onChange={() => toggleProfessional(p.id)}
            />
            {p.name}
          </label>
        ))}
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
