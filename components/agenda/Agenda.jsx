import "../../styles/agenda/agenda.css";
import { useState } from "react";

import AgendaToolbar from "./AgendaToolbar";
import AgendaColumn from "./AgendaColumn";
import AgendaSlotModal from "./AgendaSlotModal";

import { createSlot, cancelSlot } from "../../services/agendaApi";

// =========================
// HORARIOS CANÓNICOS
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

export default function Agenda({
  loading,
  date,
  box,
  professionals,
  agendaData,
  onDateChange,
  onBoxChange,
  onProfessionalsChange,
  onAgendaChanged,
}) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // =========================
  // CAN RENDER (NO SE DESMONTA CON LOADING)
  // =========================
  const canRenderAgenda =
    date &&
    professionals.length > 0 &&
    agendaData &&
    agendaData.calendar;

  // =========================
  // SELECT SLOT (DEFENSIVO)
  // =========================
  function handleSelectSlot(slotInfo, profId) {
    if (actionLoading) return;
    if (!slotInfo || !slotInfo.time) return;

    setSelectedSlot({
      ...slotInfo,
      professional: profId,
    });
  }

  return (
    <section className="agenda-page">
      {/* =========================
          TOOLBAR (FILTROS)
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
        {/* ===== MENSAJES DE ESTADO ===== */}
        {!date || professionals.length === 0 ? (
          <div className="agenda-state">
            Selecciona fecha y profesional
          </div>
        ) : !agendaData ? (
          <div className="agenda-state">
            Sin datos de agenda para el día seleccionado
          </div>
        ) : null}

        {/* ===== GRID PRINCIPAL (NUNCA SE DESMONTA POR LOADING) ===== */}
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

        {/* ===== OVERLAY LOADING ===== */}
        {loading && (
          <div className="agenda-state agenda-loading">
            Cargando agenda…
          </div>
        )}
      </section>

      {/* =========================
          MODAL
         ========================= */}
      <AgendaSlotModal
        open={!!selectedSlot}
        slot={selectedSlot}
        loading={actionLoading}
        onClose={() => {
          if (!actionLoading) setSelectedSlot(null);
        }}
        onReserve={async ({ slot, patient }) => {
          try {
            setActionLoading(true);

            await createSlot({
              date,
              box,
              professional: slot.professional,
              time: slot.time,
              rut: patient.rut,
              status: "reserved",
            });

            onAgendaChanged?.();
          } finally {
            setActionLoading(false);
            setSelectedSlot(null);
          }
        }}
        onConfirm={async ({ slot, patient }) => {
          try {
            setActionLoading(true);

            await createSlot({
              date,
              box,
              professional: slot.professional,
              time: slot.time,
              rut: patient.rut,
              status: "confirmed",
            });

            onAgendaChanged?.();
          } finally {
            setActionLoading(false);
            setSelectedSlot(null);
          }
        }}
        onCancel={async () => {
          try {
            setActionLoading(true);

            await cancelSlot({
              date,
              professional: selectedSlot.professional,
              time: selectedSlot.time,
            });

            onAgendaChanged?.();
          } finally {
            setActionLoading(false);
            setSelectedSlot(null);
          }
        }}
        onReschedule={async () => {
          alert("Reprogramación pendiente");
          setSelectedSlot(null);
        }}
      />
    </section>
  );
}
