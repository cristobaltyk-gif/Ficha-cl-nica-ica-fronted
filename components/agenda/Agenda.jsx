import "../../styles/agenda/agenda.css";
import AgendaColumn from "./AgendaColumn";

/*
Agenda — CEREBRO UI AGENDA DIARIA (PRODUCCIÓN REAL)

✔ SOLO UI
✔ NO backend
✔ NO estado local
✔ NO modal
✔ NO validaciones
✔ NO decisiones
✔ SOLO pinta lo que el Controller entrega
*/

export default function Agenda({
  loading = false,
  date,
  professionals = [],
  agendaData,
  onSelectSlot,
}) {
  return (
    <section className="agenda-page">
      <section className="agenda-container">

        <div className="agenda-grid">
          {professionals.map((prof) => {
            const profId = prof.id;
            const calendar = agendaData?.calendar?.[profId];

            return (
              <AgendaColumn
                key={profId}
                professional={prof}
                slots={calendar?.slots || {}}   // 👈 SI NO HAY, ES VACÍO
                onSelectSlot={(slot, time) =>
                  onSelectSlot?.({
                    professional: profId,
                    time,
                    ...slot
                  })
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
