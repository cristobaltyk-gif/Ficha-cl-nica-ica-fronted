import "../../styles/agenda/agenda.css";
import { useState } from "react";

import AgendaColumn from "./AgendaColumn";
import AgendaSlotModal from "./AgendaSlotModal";

/*
Agenda — CEREBRO UI AGENDA DIARIA (PRODUCCIÓN REAL)

✔ NO mock
✔ NO backend
✔ NO decide estados
✔ NO inventa slots
✔ SOLO pinta lo que el CONTROLLER entrega
✔ PASA OBJETOS COMPLETOS
*/

export default function Agenda({
  loading = false,
  date,
  professionals = [],          // [{ id, name }]
  agendaData,                  // { calendar: { [profId]: { slots } } }

  // Eventos hacia arriba (controller)
  onSelectSlot,
  onCloseSlot,
}) {
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Guard rails mínimos (SIN MENSAJES INVENTADOS)
  if (!date || !agendaData?.calendar || professionals.length === 0) {
    return null;
  }

  function handleSelectSlot(slot, time, professionalId) {
    if (!slot || !time) return;

    const payload = {
      professional: professionalId,
      time,
      ...slot,          // 👈 OBJETO COMPLETO
    };

    setSelectedSlot(payload);
    onSelectSlot?.(payload);
  }

  return (
    <section className="agenda-page">
      <section className="agenda-container">

        <div className="agenda-grid">
          {professionals.map((prof) => {
            const profId = prof.id;
            const calendar = agendaData.calendar[profId];

            if (!calendar || !calendar.slots) return null;

            return (
              <AgendaColumn
                key={profId}
                professional={prof}          // 👈 OBJETO COMPLETO
                slots={calendar.slots}       // 👈 SOLO backend
                onSelectSlot={(slot, time) =>
                  handleSelectSlot(slot, time, profId)
                }
              />
            );
          })}
        </div>

        {loading && (
          <div className="agenda-state agenda-loading">
            Cargando agenda…
          </div>
        )}
      </section>

      <AgendaSlotModal
        open={!!selectedSlot}
        slot={selectedSlot}
        onClose={() => {
          setSelectedSlot(null);
          onCloseSlot?.();
        }}
      />
    </section>
  );
}
