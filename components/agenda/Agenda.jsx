import "../../styles/agenda/agenda.css";
import { useState } from "react";

import AgendaToolbar from "./AgendaToolbar";
import AgendaColumn from "./AgendaColumn";
import AgendaSlotModal from "./AgendaSlotModal";

// API agenda (YA EXISTE)
import {
  createSlot,
  cancelSlot
} from "../../services/agendaApi";

/*
Agenda (ORQUESTADOR REAL – UX LIMPIA)

✔ Mantiene lógica intacta
✔ NO incluye resumen superior (eso vive en Dashboard)
✔ Layout limpio boutique
✔ No toca backend
*/

// =========================
// HORARIOS CANÓNICOS
// =========================
const TIMES_15_MIN = (() => {
  const out = [];
  let cur = 9 * 60;     // 09:00
  const end = 18 * 60;  // 18:00

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
  onAgendaChanged
}) {
  // =========================
  // ESTADOS INTERNOS
  // =========================
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // =========================
  // VALIDACIÓN DE RENDER
  // =========================
  const canRenderAgenda =
    !loading &&
    date &&
    box &&
    professionals.length > 0 &&
    agendaData &&
    agendaData.calendar;

  // =========================
  // SLOT CLICK (bloqueado si guardando)
  // =========================
  function handleSelectSlot(slotInfo, profId) {
    if (actionLoading) return;

    setSelectedSlot({
      ...slotInfo,
      professional: profId
    });
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="agenda-page">
      {/* ===== TOOLBAR ===== */}
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
        <div className="agenda-state">
          Cargando agenda…
        </div>
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

      {/* ===== GRID PRINCIPAL ===== */}
      {canRenderAgenda && (
        <div className="agenda-grid">
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
                onSelectSlot={(slotInfo) =>
                  handleSelectSlot(slotInfo, profId)
                }
              />
            );
          })}
        </div>
      )}

      {/* ===== MODAL ===== */}
      <AgendaSlotModal
        open={!!selectedSlot}
        slot={selectedSlot}
        loading={actionLoading}
        onClose={() => {
          if (!actionLoading) setSelectedSlot(null);
        }}

        // =========================
        // RESERVAR
        // =========================
        onReserve={async ({ slot, patient }) => {
          try {
            setActionLoading(true);

            await createSlot({
              date,
              box,
              professional: slot.professional,
              time: slot.time,
              rut: patient.rut,
              status: "reserved"
            });

            onAgendaChanged?.();
          } finally {
            setActionLoading(false);
            setSelectedSlot(null);
          }
        }}

        // =========================
        // CONFIRMAR
        // =========================
        onConfirm={async ({ slot, patient }) => {
          try {
            setActionLoading(true);

            await createSlot({
              date,
              box,
              professional: slot.professional,
              time: slot.time,
              rut: patient.rut,
              status: "confirmed"
            });

            onAgendaChanged?.();
          } finally {
            setActionLoading(false);
            setSelectedSlot(null);
          }
        }}

        // =========================
        // ANULAR
        // =========================
        onCancel={async () => {
          try {
            setActionLoading(true);

            await cancelSlot({
              date,
              professional: selectedSlot.professional,
              time: selectedSlot.time
            });

            onAgendaChanged?.();
          } finally {
            setActionLoading(false);
            setSelectedSlot(null);
          }
        }}

        // =========================
        // REPROGRAMAR (pendiente)
        // =========================
        onReschedule={async () => {
          alert("Reprogramación pendiente de UI");
          setSelectedSlot(null);
        }}
      />
    </div>
  );
}
