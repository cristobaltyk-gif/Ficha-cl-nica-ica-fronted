import "../../styles/agenda/agenda.css";

import AgendaColumn from "./AgendaColumn";

/*
Agenda — CEREBRO UI AGENDA DIARIA (PRODUCCIÓN REAL)

✔ NO mock
✔ NO backend
✔ NO estado local
✔ NO modal
✔ NO decide lógica
✔ NO inventa mensajes
✔ SOLO pinta lo que el CONTROLLER entrega
✔ CLICK → sube payload COMPLETO al controller
*/

export default function Agenda({
  loading = false,
  date,
  professionals = [],          // [{ id, name }]
  agendaData,                  // { calendar: { [profId]: { slots } } }

  // Eventos hacia arriba (controller)
  onSelectSlot,
}) {
  // Guard rails mínimos (silenciosos)
  if (!date || !agendaData?.calendar || professionals.length === 0) {
    return null;
  }

  // CLICK DE SLOT → SUBE TODO AL CONTROLLER
  function handleSelectSlot(slot, time, professionalId) {
    if (!slot || !time) return;

    onSelectSlot?.({
      professional: professionalId,
      time,
      ...slot        // 👈 OBJETO COMPLETO DEL BACKEND
    });
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
                professional={prof}            // 👈 objeto completo
                slots={calendar.slots}         // 👈 SOLO backend
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
    </section>
  );
}
