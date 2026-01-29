import Slot from "./Slot";

/*
AgendaColumn — COLUMNA DE AGENDA DIARIA

✔ Visual
✔ Reutilizable
✔ Sin backend
✔ Sin lógica de negocio
✔ Emite eventos hacia arriba
*/

export default function AgendaColumn({
  professionalId,      // string (id del profesional)
  box,                 // string (solo visual)
  times = [],          // ["09:00", "09:15", ...]
  slots = {},          // { "09:15": { status, ... } }
  onSelectSlot         // function(payload)
}) {
  return (
    <article className="agenda-column">
      {/* =====================
          HEADER COLUMNA
         ===================== */}
      <header className="agenda-title">
        <strong>{professionalId}</strong>
        <span className="agenda-subtitle">
          {box ? `Box ${box.replace("box", "")}` : ""}
        </span>
      </header>

      {/* =====================
          SLOTS
         ===================== */}
      <section className="agenda-slots">
        {times.map((time) => {
          const slot = slots?.[time];
          const status = slot?.status || "available";

          return (
            <Slot
              key={`${professionalId}-${time}`}
              time={time}
              status={status}
              onSelect={(selectedTime) => {
                if (typeof onSelectSlot === "function") {
                  onSelectSlot({
                    professional: professionalId,
                    time: selectedTime,
                    status,
                    slot
                  });
                }
              }}
            />
          );
        })}
      </section>
    </article>
  );
}
