import "../../styles/agenda/agenda.css";
import { useState } from "react";

import AgendaToolbar from "./AgendaToolbar";
import AgendaColumn from "./AgendaColumn";
import AgendaSlotModal from "./AgendaSlotModal";

/*
Agenda — MÓDULO VISUAL DE AGENDA DIARIA (PRODUCCIÓN REAL)

✔ NO mock
✔ NO horarios hardcodeados
✔ NO backend
✔ NO lógica clínica
✔ SOLO pinta lo que el backend entrega
✔ Si no viene → no existe
*/

export default function Agenda({
  loading = false,
  date,
  box,
  professionals = [],        // [{ id, name }]
  agendaData,               // { calendar: { [profId]: { slots } } }

  // Toolbar (solo visual)
  onDateChange,
  onBoxChange,
  onProfessionalsChange,

  // Eventos de slots (cerebro externo)
  onSelectSlot,              // ({ professional, time, status, slot })
  onCloseSlot,
}) {
  // =========================
  // Estado UI local
  // =========================
  const [selectedSlot, setSelectedSlot] = useState(null);

  // =========================
  // Condición render REAL
  // =========================
  const canRenderAgenda =
    date &&
    professionals.length === 1 &&
    agendaData &&
    agendaData.calendar;

  // =========================
  // Slot seleccionado (UI)
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

      {/* =========================
          TOOLBAR (SOLO VISUAL)
      ========================= */}
      <AgendaToolbar
        date={date}
        box={box}
        professionals={professionals}
        onDateChange={onDateChange}
        onBoxChange={onBoxChange}
        onProfessionalsChange={onProfessionalsChange}
      />

      {/* =========================
          CONTENEDOR AGENDA
      ========================= */}
      <section className="agenda-container">

        {/* ===== MENSAJES ===== */}
        {!date || professionals.length !== 1 ? (
          <div className="agenda-state">
            Selecciona un profesional y un día
          </div>
        ) : !agendaData ? (
          <div className="agenda-state">
            Sin datos de agenda para el día seleccionado
          </div>
        ) : null}

        {/* ===== GRID REAL ===== */}
        {canRenderAgenda && (
          <div className="agenda-grid">
            {professionals.map((prof) => {
              const profId = prof.id;

              const profCalendar =
                agendaData.calendar[profId];

              if (!profCalendar || !profCalendar.slots) {
                return (
                  <div key={profId} className="agenda-state">
                    Sin agenda definida para este profesional
                  </div>
                );
              }

              return (
                <AgendaColumn
                  key={profId}
                  professionalId={profId}
                  box={box}
                  slots={profCalendar.slots} // 👈 SOLO backend
                  onSelectSlot={(slot, time) =>
                    handleSelectSlot(slot, time, profId)
                  }
                />
              );
            })}
          </div>
        )}

        {/* ===== LOADING ===== */}
        {loading && (
          <div className="agenda-state agenda-loading">
            Cargando agenda…
          </div>
        )}
      </section>

      {/* =========================
          MODAL (VISUAL)
      ========================= */}
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
