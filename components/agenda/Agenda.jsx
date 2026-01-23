import "../../styles/agenda/agenda.css";
import Slot from "./Slot";

/*
CONTRATO REAL DE AGENDA (BACKEND-FIRST)

props:
{
  loading?: boolean,
  context?: {
    date: "YYYY-MM-DD",
    professionals: [
      {
        id: string,
        name: string,
        specialty?: string,
        schedule: {
          start: "HH:MM",
          end: "HH:MM",
          slotMinutes: number
        }
      }
    ],
    slots: {
      [professionalId]: {
        [time]: {
          status: "free" | "busy" | "blocked",
          attentionId?: string,
          blockReason?: string
        }
      }
    }
  }
}
*/

export default function Agenda({ loading = false, context = null }) {
  // ===== estados reales del sistema =====
  if (loading) {
    return <div className="agenda-state">Cargando agenda…</div>;
  }

  if (!context) {
    return (
      <div className="agenda-state">
        Agenda sin contexto (fecha / profesionales)
      </div>
    );
  }

  const { date, professionals = [], slots = {} } = context;

  if (!professionals.length) {
    return (
      <div className="agenda-state">
        No hay profesionales configurados para {date}
      </div>
    );
  }

  // ===== helpers =====
  const buildHours = (schedule) => {
    const hours = [];
    const [sh, sm] = schedule.start.split(":").map(Number);
    const [eh, em] = schedule.end.split(":").map(Number);

    let current = sh * 60 + sm;
    const end = eh * 60 + em;

    while (current < end) {
      const h = String(Math.floor(current / 60)).padStart(2, "0");
      const m = String(current % 60).padStart(2, "0");
      hours.push(`${h}:${m}`);
      current += schedule.slotMinutes;
    }
    return hours;
  };

  // ===== render operativo =====
  return (
    <div className="agenda">
      {professionals.map((p) => {
        const hours = buildHours(p.schedule);
        const professionalSlots = slots[p.id] || {};

        return (
          <div key={p.id} className="agenda-column">
            <div className="agenda-title">
              <strong>{p.name}</strong>
              {p.specialty && (
                <span className="agenda-subtitle">{p.specialty}</span>
              )}
            </div>

            {hours.map((time) => {
              const slotData = professionalSlots[time];
              const status = slotData?.status || "free";

              return (
                <Slot
                  key={`${p.id}-${time}`}
                  time={time}
                  status={status}
                  onSelect={() => {
                    // interacción se conecta después
                    // aquí NO se decide flujo clínico
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
