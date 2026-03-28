import "../../styles/agenda/agenda.css";
import AgendaColumn from "./AgendaColumn";

export default function Agenda({
  loading = false,
  date,
  professionals = [],
  agendaData,
  onSelectSlot,
  onVerPagos,   // opcional — si viene, muestra botón
}) {
  return (
    <section className="agenda-page">
      <section className="agenda-container">

        {/* BOTÓN PAGOS DEL DÍA — solo si viene prop */}
        {!loading && onVerPagos && date && (
          <div style={{
            padding: "10px 16px 0",
            display: "flex",
            justifyContent: "flex-end",
          }}>
            <button
              onClick={onVerPagos}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                background: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                color: "#166534",
                cursor: "pointer",
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}
            >
              💰 Pagos del día
            </button>
          </div>
        )}

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
              const profId  = prof.id;
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
