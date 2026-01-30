import "../../styles/agenda/agenda.css";
import { useState } from "react";

import AgendaColumn from "./AgendaColumn";
import AgendaSlotModal from "./AgendaSlotModal";

/*
Agenda — MÓDULO VISUAL DE AGENDA DIARIA (PRODUCCIÓN REAL)

✔ NO mock
✔ NO backend
✔ NO decide estados
✔ NO inventa mensajes
✔ SOLO pinta slots reales del día
*/

export default function Agenda({
  loading = false,
  date,
  professionals = [],        // [{ id, name }]
  agendaData,               // { calendar: { [profId]: { slots } } }

  // Eventos de slots (cerebro externo)
  onSelectSlot,
  onCloseSlot,
}) {
  const [selectedSlot, setSelectedSlot] = useState(null);

  // =========================
  // Guard rails mínimos
  // =========================
  if (!date || professionals.length === 0 || !agendaData?.calendar) {
    return null;
  }

  // =========================
  // Slot seleccionado
  // =========================
  function handleSelectSlot(slot, time, professionalId) {
    if (!slot || !time) return;

    const payload = {
      professional: professionalId,
      time,
      status: slot.status,
      slot
    };

    setSelectedSlot(payload);
    onSelectSlot?.(payload);
  }

  return (
    <section className="agenda-page">
      <section className="agenda-container">

        {/* ===== GRID REAL ===== */}
        <div className="agenda-grid">
          {professionals.map((prof) => {
            const profId = prof.id;
            const profCalendar = agendaData.calendar[profId];

            if (!profCalendar || !profCalendar.slots) {
              return null; // 👈 NO inventa mensajes
            }

            return (
              <AgendaColumn
                key={profId}
                professionalId={profId}
                slots={profCalendar.slots} // 👈 SOLO backend
                onSelectSlot={(slot, time) =>
                  handleSelectSlot(slot, time, profId)
                }
              />
            );
          })}
        </div>

        {/* ===== LOADING ===== */}
        {loading && (
          <div className="agenda-state agenda-loading">
            Cargando agenda…
          </div>
        )}
      </section>

      {/* ===== MODAL ===== */}
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
