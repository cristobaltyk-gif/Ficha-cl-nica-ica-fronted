import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";

import Agenda from "../components/agenda/Agenda";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaPage — MÓDULO DIARIO (PRODUCCIÓN)

✔ Recibe professional + date desde Summary
✔ Lee agenda_future.json vía backend REAL
✔ NO inventa endpoints
✔ NO calcula
✔ Agenda es SOLO visual
✔ Backend es la verdad
*/

export default function AgendaPage({
  professional, // string (id profesional)
  date          // string YYYY-MM-DD
}) {
  const { session } = useAuth();

  const [loading, setLoading] = useState(false);
  const [agendaData, setAgendaData] = useState(null);

  // =========================
  // Guard rails
  // =========================
  if (!professional || !date) {
    return (
      <div className="agenda-page">
        <p>Selecciona un profesional y un día.</p>
      </div>
    );
  }

  // =========================
  // Fetch agenda diaria REAL
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadAgenda() {
      setLoading(true);
      setAgendaData(null);

      try {
        // ✅ ENDPOINT REAL (agenda.router)
        const res = await fetch(
          `${API_URL}/agenda?date=${encodeURIComponent(date)}`
        );

        if (!res.ok) {
          throw new Error("agenda");
        }

        const data = await res.json();
        if (cancelled) return;

        /**
         * Backend REAL:
         * {
         *   calendar: {
         *     [professionalId]: {
         *       slots: { "09:00": {...} }
         *     }
         *   }
         * }
         */

        setAgendaData({
          calendar: {
            [professional]: data.calendar?.[professional] || { slots: {} }
          }
        });
      } catch {
        if (!cancelled) {
          setAgendaData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAgenda();
    return () => {
      cancelled = true;
    };
  }, [professional, date]);

  // =========================
  // Render
  // =========================
  return (
    <div className="agenda-page">
      <Agenda
        loading={loading}
        date={date}
        professionals={[{ id: professional }]}
        agendaData={agendaData}
        user={session?.usuario}
        role={session?.role?.name}
      />
    </div>
  );
}
