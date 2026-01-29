import "../../styles/agenda/agenda.css";
import { useState } from "react";

import AgendaToolbar from "./AgendaToolbar";
import AgendaColumn from "./AgendaColumn";
import AgendaSlotModal from "./AgendaSlotModal";

// =========================
// HORARIOS CANÓNICOS (UI)
// =========================
const TIMES_15_MIN = (() => {
  const out = [];
  let cur = 9 * 60;
  const end = 18 * 60;

  while (cur < end) {
    const hh = String(Math.floor(cur / 60)).padStart(2, "0");
    const mm = String(cur % 60).padStart(2, "0");
    out.push(`${hh}:${mm}`);
    cur += 15;
  }

  return out;
})();

/*
Agenda — MÓDULO VISUAL DE AGENDA DIARIA

✔ Genérico
✔ Reutilizable
✔ Sin backend
✔ Sin reglas
✔ Sin fetch
✔ Sin estado global
✔ Orquesta UI y emite eventos
*/

export default function Agenda({
  loading = false,
  date,
  box,
  professionals = [],        // [{ id, name }]
  agendaData,               // { calendar: { [profId]: { slots } } }

  // Toolbar
  onDateChange,
  onBoxChange,
  onProfessionalsChange,

  // Eventos de slots (cerebro decide)
  onSelectSlot,              // ({ professional, time, status, slot })
  onCloseSlot,
}) {
  // =========================
  // Estado UI local
  // =========================
  const [selectedSlot, setSelectedSlot] = useState(null);

  // =========================
  // Condición render
  // =========================
  const canRenderAgenda =
    date &&
    professionals.length > 0 &&
    agendaData &&
    agendaData.calendar;

  // =========================
  // Slot seleccionado (UI)
  // =========================
  function handleSelectSlot(slotInfo, profId) {
    if (!slotInfo || !slotInfo.time) return;

    const payload = {
      ...slotInfo,
      professional: profId,
    };

    setSelectedSlot(payload);
    onSelectSlot?.(payload);
  }

  return (
    <section className="agenda-page">
      {/* =========================
          TOOLBAR (VISUAL)
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
        {!date || professionals.length === 0 ? (
          <div className="agenda-state">
            Selecciona fecha y profesional
          </div>
        ) : !agendaData ? (
          <div className="agenda-state">
            Sin datos de agenda para el día seleccionado
          </div>
        ) : null}

        {/* ===== GRID ===== */}
        {canRenderAgenda && (
          <div className="agenda-grid">
            {professionals.map((prof) => {
              const profId = prof.id;

              const profCalendar =
                agendaData.calendar[profId] || { slots: {} };

              return (
                <AgendaColumn
                  key={profId}
                  professionalId={profId}
                  box={box}
                  times={TIMES_15_MIN}
                  slots={profCalendar.slots}
                  onSelectSlot={(slotInfo) =>
                    handleSelectSlot(slotInfo, profId)
                  }
                />
              );
            })}
          </div>
        )}

        {/* ===== LOADING VISUAL ===== */}
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
