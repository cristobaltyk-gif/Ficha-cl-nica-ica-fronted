import { useEffect, useState, useCallback } from "react";

import Agenda from "./Agenda";
import AgendaSlotModal from "./AgendaSlotModal";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaDayController — CEREBRO DE AGENDA DIARIA (PRODUCCIÓN REAL)

✔ Orquesta Agenda.jsx
✔ Interpreta backend
✔ Preconstruye slots del día
✔ Backend = ocupación (verdad)
✔ Frontend = visualización
*/

export default function AgendaDayController({ professional, date }) {
  const [loading, setLoading] = useState(false);
  const [agendaData, setAgendaData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // =========================
  // CONFIG HORARIA (CLÍNICA)
  // =========================
  const START = "09:00";
  const END = "18:00";
  const INTERVAL = 15;

  function buildDaySlots() {
    const slots = {};
    const [sh, sm] = START.split(":").map(Number);
    const [eh, em] = END.split(":").map(Number);

    let minutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    while (minutes < endMinutes) {
      const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
      const mm = String(minutes % 60).padStart(2, "0");
      slots[`${hh}:${mm}`] = { status: "available" };
      minutes += INTERVAL;
    }

    return slots;
  }

  // =========================
  // LOAD + ADAPT AGENDA
  // =========================
  const loadAgenda = useCallback(async () => {
    if (!professional || !date) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/agenda?date=${encodeURIComponent(date)}`
      );
      if (!res.ok) throw new Error("agenda");

      const data = await res.json();

      const backendSlots =
        data.calendar?.[professional]?.slots || {};

      // 🔥 REGLA CLAVE:
      // Backend vacío = TODO DISPONIBLE
      const fullDaySlots = buildDaySlots();

      // Sobrescribe con ocupación real
      Object.entries(backendSlots).forEach(([time, slot]) => {
        fullDaySlots[time] = slot;
      });

      setAgendaData({
        calendar: {
          [professional]: {
            slots: fullDaySlots
          }
        }
      });
    } catch {
      setAgendaData(null);
    } finally {
      setLoading(false);
    }
  }, [professional, date]);

  useEffect(() => {
    loadAgenda();
  }, [loadAgenda]);

  // =========================
  // SLOT UI
  // =========================
  function handleSelectSlot(payload) {
    setSelectedSlot(payload);
  }

  function handleCloseModal() {
    setSelectedSlot(null);
  }

  // =========================
  // MUTACIONES
  // =========================
  async function setSlot({ status, patient }) {
    if (!selectedSlot) return;

    setLoading(true);
    try {
      await fetch(`${API_URL}/agenda/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          time: selectedSlot.time,
          professional,
          status,
          rut: patient?.rut || null
        })
      });

      await loadAgenda();
      setSelectedSlot(null);
    } finally {
      setLoading(false);
    }
  }

  async function clearSlot() {
    if (!selectedSlot) return;

    setLoading(true);
    try {
      await fetch(`${API_URL}/agenda/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          time: selectedSlot.time,
          professional
        })
      });

      await loadAgenda();
      setSelectedSlot(null);
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // RENDER
  // =========================
  if (!professional || !date) {
    return (
      <div className="agenda-placeholder">
        Selecciona un profesional y un día
      </div>
    );
  }

  return (
    <>
      <Agenda
        loading={loading}
        date={date}
        professionals={[{ id: professional }]}
        agendaData={agendaData}
        onSelectSlot={handleSelectSlot}
      />

      <AgendaSlotModal
        open={!!selectedSlot}
        slot={selectedSlot}
        loading={loading}
        onClose={handleCloseModal}
        onReserve={({ patient }) =>
          setSlot({ status: "reserved", patient })
        }
        onConfirm={({ patient }) =>
          setSlot({ status: "confirmed", patient })
        }
        onCancel={clearSlot}
        onReschedule={clearSlot}
      />
    </>
  );
}
