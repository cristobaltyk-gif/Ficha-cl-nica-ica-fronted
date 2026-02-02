import { useEffect, useState, useCallback } from "react";

import Agenda from "./Agenda";
import AgendaSlotModal from "./AgendaSlotModal";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaDayController — PRODUCCIÓN REAL (CANÓNICO FINAL)

✔ Orquesta Agenda.jsx
✔ Construye slots desde schedule
✔ Backend = verdad
✔ NO decide flujos
✔ NO navega
✔ Emite eventos al cerebro
*/

export default function AgendaDayController({
  professional,
  date,

  // 👇 DECIDE EL CEREBRO
  role,              // "MEDICO" | "SECRETARIA"
  onAttend,
  onNoShow,
  onCancelFinal
}) {
  const [loading, setLoading] = useState(false);
  const [agendaData, setAgendaData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [professionalsMap, setProfessionalsMap] = useState({});

  // =========================
  // LOAD PROFESSIONALS (1 VEZ)
  // =========================
  useEffect(() => {
    async function loadProfessionals() {
      try {
        const res = await fetch(`${API_URL}/professionals`);
        if (!res.ok) return;

        const data = await res.json();
        const map = {};
        data.forEach((p) => {
          map[p.id] = p;
        });
        setProfessionalsMap(map);
      } catch {}
    }

    loadProfessionals();
  }, []);

  // =========================
  // HELPERS
  // =========================
  function getWeekdayKey(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
  }

  function buildSlotsFromSchedule(schedule, weekdayKey) {
    const slots = {};

    if (!schedule?.days?.[weekdayKey]) return slots;

    const interval = schedule.slotMinutes;

    schedule.days[weekdayKey].forEach(({ start, end }) => {
      let minutes =
        Number(start.split(":")[0]) * 60 +
        Number(start.split(":")[1]);

      const endMinutes =
        Number(end.split(":")[0]) * 60 +
        Number(end.split(":")[1]);

      while (minutes < endMinutes) {
        const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
        const mm = String(minutes % 60).padStart(2, "0");
        slots[`${hh}:${mm}`] = { status: "available" };
        minutes += interval;
      }
    });

    return slots;
  }

  // =========================
  // LOAD AGENDA
  // =========================
  const loadAgenda = useCallback(async () => {
    if (!professional || !date) return;

    const prof = professionalsMap[professional];
    if (!prof) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/agenda?date=${encodeURIComponent(date)}`
      );
      if (!res.ok) throw new Error("agenda");

      const data = await res.json();
      const weekdayKey = getWeekdayKey(date);

      const baseSlots = buildSlotsFromSchedule(
        prof.schedule,
        weekdayKey
      );

      const backendSlots =
        data.calendar?.[professional]?.slots || {};

      Object.entries(backendSlots).forEach(([time, slot]) => {
        baseSlots[time] = slot;
      });

      setAgendaData({
        calendar: {
          [professional]: {
            slots: baseSlots
          }
        }
      });
    } catch {
      setAgendaData(null);
    } finally {
      setLoading(false);
    }
  }, [professional, date, professionalsMap]);

  useEffect(() => {
    loadAgenda();
  }, [loadAgenda]);

  // =========================
  // SLOT CLICK (PURO)
  // =========================
  function handleSelectSlot(slot) {
    setSelectedSlot(slot);
  }

  function handleCloseModal() {
    setSelectedSlot(null);
  }

  // =========================
  // MUTACIONES SECRETARIA
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

      onCancelFinal?.(selectedSlot);
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
        role={role}
        loading={loading}
        onClose={handleCloseModal}

        // SECRETARIA
        onReserve={({ patient }) =>
          setSlot({ status: "reserved", patient })
        }
        onConfirm={({ patient }) =>
          setSlot({ status: "confirmed", patient })
        }
        onReschedule={clearSlot}
        onCancel={clearSlot}

        // MÉDICO (DECIDE CEREBRO)
        onAttend={onAttend}
        onNoShow={onNoShow}
      />
    </>
  );
}
