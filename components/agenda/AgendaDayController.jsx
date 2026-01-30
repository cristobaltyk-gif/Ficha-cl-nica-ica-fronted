import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import Agenda from "../components/agenda/Agenda";
import AgendaSlotModal from "../components/agenda/AgendaSlotModal";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaDayController — CEREBRO DE AGENDA DIARIA

✔ Recibe professional + date desde Summary
✔ Lee agenda_future.json vía backend REAL
✔ Decide acciones según status del slot
✔ Llama backend para reservar / confirmar / anular / mover
✔ Recarga agenda después de cada acción
✔ Agenda.jsx es SOLO visual
*/

export default function AgendaDayController({
  professional, // string
  date          // YYYY-MM-DD
}) {
  const { session } = useAuth();

  const [loading, setLoading] = useState(false);
  const [agendaData, setAgendaData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // =========================
  // GUARD RAIL
  // =========================
  if (!professional || !date) {
    return (
      <div className="agenda-page">
        Selecciona un profesional y un día
      </div>
    );
  }

  // =========================
  // CARGA AGENDA REAL
  // =========================
  async function loadAgenda() {
    setLoading(true);
    setAgendaData(null);

    try {
      // 🔴 ENDPOINT REAL EXISTENTE
      const res = await fetch(
        `${API_URL}/agenda?date=${encodeURIComponent(date)}`
      );

      if (!res.ok) throw new Error("agenda");

      const data = await res.json();

      /**
       * Backend REAL:
       * {
       *   calendar: {
       *     [professionalId]: {
       *       slots: {
       *         "09:00": { status, rut?, ... }
       *       }
       *     }
       *   }
       * }
       */

      setAgendaData({
        calendar: {
          [professional]: data.calendar?.[professional] || { slots: {} }
        }
      });
    } catch (e) {
      setAgendaData(null);
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // INIT / CHANGE
  // =========================
  useEffect(() => {
    loadAgenda();
  }, [professional, date]);

  // =========================
  // SLOT CLICK (desde Agenda.jsx)
  // =========================
  function handleSelectSlot(payload) {
    // payload = { professional, time, status, slot }
    setSelectedSlot(payload);
  }

  // =========================
  // ACCIONES BACKEND
  // =========================
  async function callBackend(path, body) {
    setActionLoading(true);

    try {
      const res = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(path);

      await loadAgenda();
    } finally {
      setActionLoading(false);
      setSelectedSlot(null);
    }
  }

  // =========================
  // ACCIONES DE SLOT
  // =========================
  function handleReserve({ slot, patient }) {
    return callBackend("/agenda/reserve", {
      date,
      professional,
      time: slot.time,
      patient,
      user: session?.usuario
    });
  }

  function handleConfirm({ slot, patient }) {
    return callBackend("/agenda/confirm", {
      date,
      professional,
      time: slot.time,
      patient,
      user: session?.usuario
    });
  }

  function handleCancel() {
    return callBackend("/agenda/cancel", {
      date,
      professional,
      time: selectedSlot.time,
      user: session?.usuario
    });
  }

  function handleReschedule() {
    return callBackend("/agenda/reschedule", {
      date,
      professional,
      time: selectedSlot.time,
      user: session?.usuario
    });
  }

  // =========================
  // RENDER
  // =========================
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
        loading={actionLoading}
        onClose={() => setSelectedSlot(null)}
        onReserve={handleReserve}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onReschedule={handleReschedule}
      />
    </>
  );
}
