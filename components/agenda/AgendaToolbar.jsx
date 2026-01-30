import "../../styles/agenda/toolbar.css";

/*
AgendaToolbar — SOLO VISUAL (PRODUCCIÓN REAL)

✔ NO estado local
✔ NO input editable
✔ NO select editable
✔ NO emite eventos
✔ NO cambia fecha
✔ NO cambia profesional
✔ SOLO muestra contexto elegido en el Summary
*/

export default function AgendaToolbar({
  date,                 // "YYYY-MM-DD"
  professionals = [],   // [{ id, name }] → SIEMPRE 1 en agenda diaria
}) {
  const professional = professionals[0];

  return (
    <div className="agenda-toolbar">

      {/* FECHA (READ ONLY) */}
      <div className="toolbar-field">
        <label>Fecha</label>
        <div className="toolbar-value">
          {date || "—"}
        </div>
      </div>

      {/* PROFESIONAL (READ ONLY) */}
      <div className="toolbar-field">
        <label>Profesional</label>
        <div className="toolbar-value">
          {professional?.name || professional?.id || "—"}
        </div>
      </div>

    </div>
  );
}
