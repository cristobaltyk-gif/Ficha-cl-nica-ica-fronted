import Slot from "./Slot";

/*
AgendaColumn — VISUAL PURO
*/

export default function AgendaColumn({
  professional,     // { id, name }
  slots = {},       // { "09:00": { status, patient, ... } }
  onSelectSlot
}) {
  const times = Object.keys(slots).sort();

  if (times.length === 0) return null;

  return (
    <article className="agenda-column">
      <header className="agenda-title">
        <strong>{professional.name}</strong>
      </header>

      <section className="agenda-slots">
        {times.map((time) => {
          const slot = slots[time];

          return (
            <Slot
              key={`${professional.id}-${time}`}
              time={time}
              status={slot.status}
              patient={slot.patient}
              onSelect={() => onSelectSlot?.(slot, time)}
            />
          );
        })}
      </section>
    </article>
  );
}
