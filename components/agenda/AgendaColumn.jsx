import Slot from "./Slot";

/*
AgendaColumn — COLUMNA DE AGENDA DIARIA (PRODUCCIÓN REAL)

✔ SOLO visual
✔ NO horarios hardcodeados
✔ NO rellena slots
✔ Pinta SOLO lo que el backend entrega
*/

export default function AgendaColumn({
  professionalId,   // string
  box,              // string (solo visual)
  slots = {},       // { "09:15": { status, ... } }
  onSelectSlot
}) {
  const times = Object.keys(slots).sort();

  if (times.length === 0) {
    return (
      <article className="agenda-column">
        <header className="agenda-title">
          <strong>{professionalId}</strong>
        </header>
        <div className="agenda-state">
          Sin slots disponibles
        </div>
      </article>
    );
  }

  return (
    <article className="agenda-column">
      {/* HEADER */}
      <header className="agenda-title">
        <strong>{professionalId}</strong>
        <span className="agenda-subtitle">
          {box ? `Box ${box.replace("box", "")}` : ""}
        </span>
      </header>

      {/* SLOTS REALES */}
      <section className="agenda-slots">
        {times.map((time) => {
          const slot = slots[time];

          return (
            <Slot
              key={`${professionalId}-${time}`}
              time={time}
              status={slot.status}
              onSelect={() => {
                onSelectSlot?.(slot, time);
              }}
            />
          );
        })}
      </section>
    </article>
  );
}
