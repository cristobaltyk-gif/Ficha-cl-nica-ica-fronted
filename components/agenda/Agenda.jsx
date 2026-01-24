import AgendaToolbar from "./AgendaToolbar";
import AgendaColumn from "./AgendaColumn";

/*
Agenda (ORQUESTADOR VISUAL)

- Muestra toolbar de contexto
- Valida contexto mínimo
- Renderiza 1 o 2 columnas (profesionales)
- NO decide acciones
- NO toca backend
*/

const TIMES_15_MIN = (() => {
  const out = [];
  let cur = 9 * 60;   // 09:00
  const end = 18 * 60; // 18:00

  while (cur < end) {
    const hh = String(Math.floor(cur / 60)).padStart(2, "0");
    const mm = String(cur % 60).padStart(2, "0");
    out.push(`${hh}:${mm}`);
    cur += 15;
  }
  return out;
})();

export default function Agenda({
  loading,
  date,
  box,
  professionals,
  agendaData,

  onDateChange,
  onBoxChange,
  onProfessionalsChange
}) {
  return (
    <div>
      {/* =========================
          CONTEXTO (OBLIGATORIO)
         ========================= */}
      <AgendaToolbar
        date={date}
        box={box}
        professionals={professionals}
        onDateChange={onDateChange}
        onBoxChange={onBoxChange}
        onProfessionalsChange={onProfessionalsChange}
      />

      {/* =========================
          ESTADOS BLOQUEANTES
         ========================= */}
      {loading && (
        <div className="agenda-state">Cargando agenda…</div>
      )}

      {!loading && (!date || !box || professionals.length === 0) && (
        <div className="agenda-state">
          Selecciona fecha, box y profesional(es)
        </div>
      )}

      {!loading && date && box && professionals.length > 0 && !agendaData && (
        <div className="agenda-state">
          Sin datos de agenda para el día seleccionado
        </div>
      )}

      {/* =========================
          GRILLA
         ========================= */}
      {!loading && agendaData && agendaData.calendar && (
        <div className="agenda">
          {professionals.map((profId) => {
            const profCalendar =
              agendaData.calendar[profId] || { slots: {} };

            return (
              <AgendaColumn
                key={profId}
                professionalId={profId}
                box={box}
                times={TIMES_15_MIN}
                slots={profCalendar.slots}
                onSelectSlot={() => {
                  // acciones se conectan después (modal)
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
