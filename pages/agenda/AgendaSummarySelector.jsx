import { useState } from "react";

/*
AgendaSummarySelector

✔ Elige tipo de resumen
✔ Selecciona hasta 4 médicos
✔ NO renderiza agenda
✔ Solo controla contexto
*/

export default function AgendaSummarySelector({
  professionals,            // ["medico1", "medico2", ...]
  onChange                  // ({ mode, selectedProfessionals })
}) {
  const [mode, setMode] = useState("monthly"); // monthly | weekly
  const [selected, setSelected] = useState([]);

  function toggleProfessional(id) {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id);
      }

      if (prev.length >= 4) {
        return prev; // máximo 4
      }

      return [...prev, id];
    });
  }

  // Notificar cambios
  function notify(nextMode = mode, nextSelected = selected) {
    if (typeof onChange === "function") {
      onChange({
        mode: nextMode,
        selectedProfessionals: nextSelected
      });
    }
  }

  return (
    <section className="agenda-summary-selector">

      {/* =========================
          TIPO DE RESUMEN
         ========================= */}
      <div className="summary-mode">
        <button
          onClick={() => {
            setMode("monthly");
            notify("monthly", selected);
          }}
        >
          Resumen mensual
        </button>

        <button
          onClick={() => {
            setMode("weekly");
            notify("weekly", selected);
          }}
        >
          Resumen semanal
        </button>
      </div>

      {/* =========================
          SELECCIÓN MÉDICOS
         ========================= */}
      <div className="summary-professionals">
        {professionals.map((id) => {
          const active = selected.includes(id);

          return (
            <button
              key={id}
              onClick={() => {
                const next = active
                  ? selected.filter(p => p !== id)
                  : selected.length < 4
                    ? [...selected, id]
                    : selected;

                setSelected(next);
                notify(mode, next);
              }}
              aria-pressed={active}
            >
              {id}
            </button>
          );
        })}
      </div>

      {/* =========================
          AYUDA UX
         ========================= */}
      <p>
        Seleccionados: {selected.length} / 4
      </p>
    </section>
  );
}
