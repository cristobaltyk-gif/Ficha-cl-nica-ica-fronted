import { useState } from "react";
import AgendaToolbar from "./AgendaToolbar";
import AgendaColumn from "./AgendaColumn";
import AgendaSlotModal from "./AgendaSlotModal";

/*
Agenda (ORQUESTADOR)

- Muestra toolbar
- Valida contexto
- Renderiza columnas
- Abre modal al seleccionar slot
*/

const TIMES_15_MIN = (() => {
  const out = [];
  let cur = 9 * 60;   // 09:00
  const end = 18 * 60; // 18:00

  while (cur < end) {
    const hh = String(Math.floor(cur / 60)).padStart(2, "0");
    const mm = String(cur % 60).padStart(2, "0");
    out.push(`${hh}:${mm}`);
    cur += 15;
  }
  return out;
})();

export default function Agenda({
  loading,
  date,
  box,
  professionals,
  agendaData,
  onDateChange,
  onBoxChange,
  onProfessionalsChange
}) {
  // =========================
  // ESTADO MODAL
  // =========================
  const [selectedSlot, setSelectedSlot] = useState(null);

  // =========================
  // RENDER
  // =========================
  return (
    <div>
      {/* ===== CONTEXTO ===== */}
      <AgendaToolbar
        date={date}
        box={box}
        professionals={professionals}
        onDateChange={onDateChange}
        onBoxChange={onBoxChange}
        onProfessionalsChange={onProfessionalsChange}
      />

      {/* ===== ESTADOS ===== */}
      {loading && (
        <div className="agenda-state">Cargando agenda…</div>
      )}

      {!loading && (!date || !box || professionals.length === 0) && (
        <div className="agenda-state">
          Selecciona fecha, box y profesional(es)
        </div>
      )}

      {!loading && date && box && professionals.length > 0 && !agendaData && (
        <div className="agenda-state">
          Sin datos de agenda para el día seleccionado
        </div>
      )}

      {/* ===== AGENDA ===== */}
      {!loading && agendaData && agendaData.calendar && (
        <div className="agenda">
          {professionals.map((profId) => {
            const profCalendar =
              agendaData.calendar[profId] || { slots: {} };

            return (
              <AgendaColumn
                key={profId}
                professionalId={profId}
                box={box}
                times={TIMES_15_MIN}
                slots={profCalendar.slots}
                onSelectSlot={(slotInfo) => {
                  setSelectedSlot(slotInfo);
                }}
              />
            );
          })}
        </div>
      )}

      {/* ===== MODAL ===== */}
      <AgendaSlotModal
        open={!!selectedSlot}
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
        onReserve={() => {
          console.log("RESERVAR", selectedSlot);
          setSelectedSlot(null);
        }}
        onConfirm={() => {
          console.log("CONFIRMAR", selectedSlot);
          setSelectedSlot(null);
        }}
        onCancel={() => {
          console.log("ANULAR", selectedSlot);
          setSelectedSlot(null);
        }}
        onReschedule={() => {
          console.log("CAMBIAR HORA", selectedSlot);
          setSelectedSlot(null);
        }}
      />
    </div>
  );
}
