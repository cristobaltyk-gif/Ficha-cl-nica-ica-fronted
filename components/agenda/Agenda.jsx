import "../../styles/agenda/agenda.css";
import AgendaColumn from "./AgendaColumn";

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

        {loading ? (
          <div className="agenda-state agenda-loading">
            <span className="agenda-loading-spinner"/>
            <span>Cargando agenda…</span>
          </div>
        ) : professionals.length === 0 ? (
          <div className="agenda-state">
            No hay profesionales disponibles
          </div>
        ) : (
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
        )}

      </section>
    </section>
  );
}
