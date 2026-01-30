import { useEffect, useState, useCallback } from "react";

import Agenda from "./Agenda";
import AgendaSlotModal from "./AgendaSlotModal";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaDayController — CEREBRO DE AGENDA DIARIA (PRODUCCIÓN REAL)

✔ Orquesta Agenda.jsx
✔ Controla modal
✔ Lee backend REAL
✔ Ejecuta mutaciones reales
✔ Backend es la verdad
*/

export default function AgendaDayController({ professional, date }) {
  const [loading, setLoading] = useState(false);
  const [agendaData, setAgendaData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const canLoad = professional && date;

  // =========================
  // LOAD AGENDA REAL
  // =========================
  const loadAgenda = useCallback(async () => {
    if (!canLoad) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/agenda?date=${encodeURIComponent(date)}`
      );

      if (!res.ok) throw new Error("agenda");

      const data = await res.json();

      // ✅ OBJETO COMPLETO, SIN RECORTES
      setAgendaData(data);
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
  // MUTACIONES REALES
  // =========================
  async function setSlot({ status, patient }) {
    if (!selectedSlot) return;

    setLoading(true);

    try {
      await fetch(`${API_URL}/agenda/set_slot`, {
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
      await fetch(`${API_URL}/agenda/clear_slot`, {
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

  if (!canLoad) {
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

      {/* ✅ UN SOLO MODAL, CONTROLADO AQUÍ */}
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
