import Slot from "./Slot";

export default function AgendaColumn({
  professional,
  slots = {},
  onSelectSlot
}) {
  const times = Object.keys(slots).sort();

  if (times.length === 0) return null;

  const total     = times.length;
  const available = times.filter(t => slots[t].status === "available").length;
  const reserved  = times.filter(t => slots[t].status === "reserved").length;
  const confirmed = times.filter(t => slots[t].status === "confirmed").length;

  return (
    <article className="agenda-column">

      <header className="agenda-col-header">
        <div className="agenda-col-identity">
          <div className="agenda-col-avatar">
            {professional.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="agenda-col-name">{professional.name}</p>
            <p className="agenda-col-meta">{total} horas en agenda</p>
          </div>
        </div>

        <div className="agenda-col-stats">
          <span className="agenda-stat agenda-stat--available">{available} libre{available !== 1 ? "s" : ""}</span>
          {reserved > 0  && <span className="agenda-stat agenda-stat--reserved">{reserved} res.</span>}
          {confirmed > 0 && <span className="agenda-stat agenda-stat--confirmed">{confirmed} conf.</span>}
        </div>
      </header>

      <section className="agenda-slots">
        {times.map((time) => {
          const slot = slots[time];
          return (
            <Slot
              key={`${professional.id}-${time}`}
              time={time}
              status={slot.status}
              rut={slot.rut}
              patient={slot.patient}
              cajaStatus={slot.cajaStatus}
              gratuito={slot.gratuito}
              gratuito_confirmado={slot.gratuito_confirmado}
              gratuito_aceptado={slot.gratuito_aceptado}
              onSelect={() => onSelectSlot?.(slot, time)}
            />
          );
        })}
      </section>

    </article>
  );
}
