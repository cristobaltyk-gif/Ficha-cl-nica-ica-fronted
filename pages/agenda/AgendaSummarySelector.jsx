import { useEffect, useState } from "react";

/*
AgendaSummarySelector — PRODUCCIÓN REAL

✔ Recibe profesionales REALES desde backend (props)
✔ Selecciona hasta 4
✔ Cambia modo mensual / semanal
✔ NO inventa médicos
✔ NO mock
✔ Controlador puro
*/

export default function AgendaSummarySelector({
  professionals = [],

  // callback:
  // ({ mode, selectedProfessionals })
  onChange
}) {
  // =========================
  // STATE
  // =========================
  const [mode, setMode] = useState("monthly");
  const [selected, setSelected] = useState([]);

  // =========================
  // NOTIFY (SIEMPRE REAL)
  // =========================
  useEffect(() => {
    if (typeof onChange === "function") {
      onChange({
        mode,
        selectedProfessionals: selected
      });
    }
  }, [mode, selected]);

  // =========================
  // TOGGLE PROFESIONAL (MAX 4)
  // =========================
  function toggleProfessional(id) {
    setSelected((prev) => {
      // quitar si ya estaba
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      }

      // máximo 4
      if (prev.length >= 4) return prev;

      // agregar
      return [...prev, id];
    });
  }

  // =========================
  // RENDER
  // =========================
  return (
    <section className="agenda-summary-selector">
      {/* =========================
          MODO RESUMEN
         ========================= */}
      <div className="summary-mode">
        <button
          type="button"
          onClick={() => setMode("monthly")}
          aria-pressed={mode === "monthly"}
        >
          Resumen mensual
        </button>

        <button
          type="button"
          onClick={() => setMode("weekly")}
          aria-pressed={mode === "weekly"}
        >
          Resumen semanal
        </button>
      </div>

      {/* =========================
          PROFESIONALES REALES
         ========================= */}
      <div className="summary-professionals">
        {professionals.length === 0 && (
          <p style={{ opacity: 0.6 }}>
            No hay profesionales cargados aún.
          </p>
        )}

        {professionals.map((prof) => {
          // soporta string o objeto real
          const id = typeof prof === "string" ? prof : prof.id;
          const name =
            typeof prof === "string"
              ? prof
              : prof.name || prof.label || prof.id;

          const active = selected.includes(id);

          return (
            <button
              key={id}
              type="button"
              onClick={() => toggleProfessional(id)}
              aria-pressed={active}
              disabled={!active && selected.length >= 4}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* =========================
          FOOTER UX
         ========================= */}
      <p>
        Seleccionados: <b>{selected.length}</b> / 4
      </p>
    </section>
  );
}
