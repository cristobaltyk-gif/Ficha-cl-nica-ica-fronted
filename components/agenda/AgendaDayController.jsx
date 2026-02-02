import { useEffect, useState, useCallback } from "react";

import Agenda from "./Agenda";

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
  // SLOT CLICK (PURO → EMITE)
  // =========================
  function handleSelectSlot(slot) {
    // 👉 el cerebro decide qué hacer
    if (slot?.status === "available") {
  onAttend?.(slot);
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
    <Agenda
      loading={loading}
      date={date}
      professionals={[{ id: professional }]}
      agendaData={agendaData}
      onSelectSlot={handleSelectSlot}
    />
  );
}
