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
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 16px 0" }}>
            <button
              onClick={onVerPagos}
              style={{
                padding: "7px 14px",
                background: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                color: "#166534",
                cursor: "pointer",
              }}
            >
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
