import { useEffect, useState, useCallback } from "react";

import Agenda from "./Agenda";
import AgendaSlotModal from "./AgendaSlotModal";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaDayController — CEREBRO DE AGENDA DIARIA (PRODUCCIÓN REAL)

✔ Orquesta Agenda.jsx
✔ Lee horario REAL desde /professionals
✔ Preconstruye slots del día según schedule
✔ Backend = ocupación (verdad)
✔ Frontend = visualización
*/

export default function AgendaDayController({ professional, date }) {
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

    if (!schedule?.days?.[weekdayKey]) {
      return slots; // no agenda ese día
    }

    const interval = schedule.slotMinutes;

    schedule.days[weekdayKey].forEach(({ start, end }) => {
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);

      let minutes = sh * 60 + sm;
      const endMinutes = eh * 60 + em;

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
  // LOAD + ADAPT AGENDA
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

      // ⬅️ Slots BASE desde schedule
      const baseSlots = buildSlotsFromSchedule(
        prof.schedule,
        weekdayKey
      );

      // ⬅️ Ocupación real backend
      const backendSlots =
        data.calendar?.[professional]?.slots || {};

      // ⬅️ Backend solo sobrescribe
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
