import "../../styles/agenda/agenda.css";
import Slot from "./Slot";

/*
Agenda (RENDER PURO)

props:
{
  loading: boolean,
  date: "YYYY-MM-DD",
  box: "box1" | "box2" | "box3",
  professionals: string[], // 1 o 2 ids
  agendaData: {
    calendar: {
      [professionalId]: {
        slots: {
          [time]: { status: string, rut?: string }
        }
      }
    }
  } | null,

  // setters de contexto (toolbar vive aquí o arriba)
  onDateChange: fn,
  onBoxChange: fn,
  onProfessionalsChange: fn
}
*/

const TIMES_15_MIN = (() => {
  // 09:00–18:00 fijo por ahora (15 min)
  const out = [];
  let cur = 9 * 60;
  const end = 18 * 60;
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
  // =========================
  // ESTADOS BLOQUEANTES
  // =========================

  if (loading) {
    return <div className="agenda-state">Cargando agenda…</div>;
  }

  if (!date || !box || !professionals || professionals.length === 0) {
    return (
      <div className="agenda-state">
        Selecciona fecha, box y profesional(es)
      </div>
    );
  }

  if (!agendaData || !agendaData.calendar) {
    return (
      <div className="agenda-state">
        Sin datos de agenda para el día seleccionado
      </div>
    );
  }

  // =========================
  // RENDER
  // =========================

  return (
    <div className="agenda">
      {professionals.map((profId) => {
        const profData = agendaData.calendar[profId] || { slots: {} };
        const slots = profData.slots || {};

        return (
          <div key={profId} className="agenda-column">
            <div className="agenda-title">
              <strong>{profId}</strong>
              <span className="agenda-subtitle">Box {box.replace("box", "")}</span>
            </div>

            {TIMES_15_MIN.map((time) => {
              const slot = slots[time];
              const status = slot?.status || "available";

              return (
                <Slot
                  key={`${profId}-${time}`}
                  time={time}
                  status={status}
                  onSelect={() => {
                    // acciones (modal) se conectan después
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
