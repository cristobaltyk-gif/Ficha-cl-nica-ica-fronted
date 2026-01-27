import Slot from "./Slot";

/*
AgendaColumn (UX FINAL REAL)

✔ Card clínica por profesional
✔ Header fijo (nombre + box)
✔ Slots agrupados visualmente
✔ No toca backend
✔ No cambia Slot.jsx
*/

function prettyName(id) {
  if (!id) return "Profesional";
  return id.replaceAll("_", " ").toUpperCase();
}

export default function AgendaColumn({
  professionalId,
  box,
  times,
  slots,
  onSelectSlot
}) {
  const boxLabel = box ? box.replace("box", "") : "?";

  return (
    <article className="agenda-column">

      {/* =====================
          HEADER PROFESIONAL
         ===================== */}
      <header className="agenda-title">
        <strong>{prettyName(professionalId)}</strong>
        <span className="agenda-subtitle">
          Box {boxLabel}
        </span>
      </header>

      {/* =====================
          LISTA DE SLOTS
         ===================== */}
      <section className="agenda-slots">
        {times.map((time) => {
          const slot = slots?.[time];
          const status = slot?.status || "available";

          const disabled =
            status === "blocked" ||
            status === "cancelled";

          return (
            <Slot
              key={`${professionalId}-${time}`}
              time={time}
              status={status}
              disabled={disabled}
              label={slot?.rut ? `RUT: ${slot.rut}` : null}
              onSelect={() => {
                if (disabled) return;

                onSelectSlot?.({
                  time,
                  status,
                  slot
                });
              }}
            />
          );
        })}
      </section>

    </article>
  );
}
