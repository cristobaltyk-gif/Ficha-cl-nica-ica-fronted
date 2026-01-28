import Slot from "./Slot";

/*
AgendaColumn
- Renderiza una columna completa de agenda
- NO decide reglas
- NO conoce backend
- NO conoce otros profesionales
*/

export default function AgendaColumn({
  professionalId,
  box,
  times,      // ["09:00", "09:15", ...]
  slots,      // { "09:15": { status, rut? }, ... }
  onSelectSlot
}) {
  return (
    <div className="agenda-column">
      {/* Header columna */}
      <div className="agenda-title">
        <strong>{professionalId}</strong>
        <span className="agenda-subtitle">
          Box {box.replace("box", "")}
        </span>
      </div>

      {/* Slots */}
      {times.map((time) => {
        const slot = slots?.[time];
        const status = slot?.status || "available";

        return (
          <Slot
            key={`${professionalId}-${time}`}
            time={time}
            status={status}
            onSelect={() => {
              if (typeof onSelectSlot === "function") {
                onSelectSlot({
                  professional: professionalId,
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
