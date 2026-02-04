import { useEffect, useState, useCallback } from "react";
import Agenda from "./Agenda";
import { useAuth } from "../auth/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaDayController — PRODUCCIÓN REAL (CANÓNICO FINAL)

✔ Orquesta Agenda.jsx
✔ Construye slots desde schedule
✔ Backend = verdad
✔ NO decide flujos
✔ NO navega
✔ Emite eventos al cerebro
✔ Resuelve paciente SOLO si reservado / confirmado
*/

export default function AgendaDayController({
  professional,
  date,

  // 👇 DECIDE EL CEREBRO
  role, // "MEDICO" | "SECRETARIA"
  onAttend,
  onNoShow,
  onCancelFinal
}) {
  // 🔐 AUTH INTERNO (MISMO PATRÓN QUE PatientForm)
  const { session } = useAuth();
  const internalUser = session?.usuario;

  const [loading, setLoading] = useState(false);
  const [agendaData, setAgendaData] = useState(null);
  const [professionalsMap, setProfessionalsMap] = useState({});
  const [patientsCache, setPatientsCache] = useState({}); // cache por RUT

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
  // RESOLVER PACIENTES (SOLO LOS NECESARIOS)
  // =========================
  async function resolvePatients(slots) {
    if (!internalUser) return;

    const ruts = Object.values(slots)
      .filter(
        (s) =>
          (s.status === "reserved" || s.status === "confirmed") &&
          s.rut
      )
      .map((s) => s.rut);

    const uniqueRuts = [...new Set(ruts)];
    const missing = uniqueRuts.filter((rut) => !patientsCache[rut]);

    if (missing.length === 0) return;

    try {
      const results = await Promise.all(
        missing.map((rut) =>
          fetch(`${API_URL}/api/fichas/admin/${rut}`, {
            headers: {
              "X-Internal-User": internalUser
            }
          })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        )
      );

      setPatientsCache((prev) => {
        const copy = { ...prev };
        results.forEach((p) => {
          if (p?.rut) {
            copy[p.rut] = p;
          }
        });
        return copy;
      });
    } catch {}
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

      // 👉 SOLO AQUÍ resolvemos pacientes
      await resolvePatients(backendSlots);

      Object.entries(backendSlots).forEach(([time, slot]) => {
        baseSlots[time] = {
          time,
          status: slot.status,
          rut: slot.rut || null,
          patient: slot.rut ? patientsCache[slot.rut] || null : null,

          // info UI
          professional,
          professionalName:
            professionalsMap[professional]?.name || professional
        };
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
  }, [
    professional,
    date,
    professionalsMap,
    patientsCache,
    internalUser
  ]);

  useEffect(() => {
    loadAgenda();
  }, [loadAgenda]);

 // =========================
// REINYECTAR PACIENTES CUANDO CACHE SE ACTUALIZA
// =========================
useEffect(() => {
  if (!agendaData) return;

  setAgendaData(prev => {
    if (!prev) return prev;

    const calendar = { ...prev.calendar };
    const day = calendar[professional];
    if (!day) return prev;

    const slots = { ...day.slots };

    Object.entries(slots).forEach(([time, slot]) => {
      if (
        (slot.status === "reserved" || slot.status === "confirmed") &&
        slot.rut &&
        patientsCache[slot.rut]
      ) {
        slots[time] = {
          ...slot,
          patient: patientsCache[slot.rut]
        };
      }
    });

    return {
      ...prev,
      calendar: {
        ...calendar,
        [professional]: {
          ...day,
          slots
        }
      }
    };
  });
}, [patientsCache, professional]); 

  // =========================
  // SLOT CLICK → EMITE AL CEREBRO
  // =========================
  function handleSelectSlot(slot) {
    onAttend?.({
      ...slot,
      professional,
      date
    });
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
