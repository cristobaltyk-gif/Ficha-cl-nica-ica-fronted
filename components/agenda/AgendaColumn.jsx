import Slot from "./Slot";

/*
AgendaColumn (UX FINAL)

✔ Renderiza columna profesional
✔ Slots coloreados según status
✔ Bloquea slots no clickeables
✔ Muestra info mínima si está ocupado
✔ No toca backend
*/

function prettyName(id) {
  if (!id) return "Profesional";
  return id.replaceAll("_", " ").toUpperCase();
}

export default function AgendaColumn({
  professionalId,
  box,
  times,      // ["09:00", "09:15", ...]
  slots,      // { "09:15": { status, rut? }, ... }
  onSelectSlot
}) {
  const boxLabel = box ? box.replace("box", "") : "?";

  return (
    <div className="agenda-column">
      {/* ===== HEADER ===== */}
      <div className="agenda-title">
        <strong>{prettyName(professionalId)}</strong>

        <span className="agenda-subtitle">
          Box {boxLabel}
        </span>
      </div>

      {/* ===== SLOTS ===== */}
      {times.map((time) => {
        const slot = slots?.[time];
        const status = slot?.status || "available";

        // Slots que NO deben permitir click
        const disabled =
          status === "blocked" ||
          status === "cancelled";

        return (
          <Slot
            key={`${professionalId}-${time}`}
            time={time}
            status={status}
            disabled={disabled}

            // Tooltip simple si está ocupado
            label={
              slot?.rut
                ? `RUT: ${slot.rut}`
                : null
            }

            onSelect={() => {
              if (disabled) return;

              if (typeof onSelectSlot === "function") {
                onSelectSlot({
                  time,
                  status,
                  slot
                });
              }
            }}
          />
        );
      })}
    </div>
  );
}
