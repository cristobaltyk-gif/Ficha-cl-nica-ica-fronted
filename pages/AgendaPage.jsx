import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";

import AgendaDayController from "../components/agenda/AgendaDayController";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaPage — MÓDULO DIARIO (PRODUCCIÓN)

✔ Recibe professional + date desde Summary
✔ Orquesta carga diaria
✔ NO pinta agenda
✔ NO es cerebro clínico
✔ Delegación correcta al controller
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
  // (se mantiene para backward-compat / preload)
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadAgenda() {
      setLoading(true);
      setAgendaData(null);

      try {
        const res = await fetch(
          `${API_URL}/agenda?date=${encodeURIComponent(date)}`
        );

        if (!res.ok) throw new Error("agenda");

        const data = await res.json();
        if (cancelled) return;

        setAgendaData({
          calendar: {
            [professional]: data.calendar?.[professional] || { slots: {} }
          }
        });
      } catch {
        if (!cancelled) setAgendaData(null);
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
  // 🔁 CAMBIO ÚNICO Y REAL
  // =========================
  return (
    <div className="agenda-page">
      <AgendaDayController
        professional={professional}
        date={date}
        preload={agendaData}   // 👈 opcional, NO rompe nada
        loading={loading}
        user={session?.usuario}
        role={session?.role?.name}
      />
    </div>
  );
}
