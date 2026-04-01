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
  onVerPagos,
}) {
  return (
    <section className="agenda-page">
      <section className="agenda-container">

        {onVerPagos && date && (
          <div className="agenda-pagos-btn">
            <button onClick={onVerPagos}>
              💰 Pagos del día
            </button>
          </div>
        )}

        <div className="agenda-grid">
          {professionals.map((prof) => {
            const profId = prof.id;
            const calendar = agendaData?.calendar?.[profId];

            return (
              <AgendaColumn
                key={profId}
                professional={prof}
                slots={calendar?.slots || {}}
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
