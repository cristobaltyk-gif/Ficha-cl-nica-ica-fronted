import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";

import AgendaDayController from "../components/agenda/AgendaDayController";
import AgendaMedicoController from "../components/agenda/AgendaMedicoController";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaPage — ROUTER DE AGENDA (PRODUCCIÓN REAL)

✔ Hooks SIEMPRE arriba
✔ Médico → AgendaMedicoController
✔ Secretaria/Admin → AgendaDayController
✔ NO rompe reglas de React
*/

export default function AgendaPage({
  professional, // SOLO secretaria/admin
  date          // SOLO secretaria/admin
}) {
  const { session } = useAuth();
  const role = session?.role?.name;

  const [loading, setLoading] = useState(false);
  const [agendaData, setAgendaData] = useState(null);

  // =========================
  // 📅 CARGA AGENDA (SOLO SECRETARIA / ADMIN)
  // =========================
  useEffect(() => {
    if (role === "MEDICO") return;
    if (!professional || !date) return;

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
            [professional]:
              data.calendar?.[professional] || { slots: {} }
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
  }, [role, professional, date]);

  // =========================
  // 🧭 RENDER POR ROL
  // =========================
  if (role === "MEDICO") {
    return (
      <div className="agenda-page">
        <AgendaMedicoController />
      </div>
    );
  }

  if (!professional || !date) {
    return (
      <div className="agenda-page">
        <p>Selecciona un profesional y un día.</p>
      </div>
    );
  }

  return (
    <div className="agenda-page">
      <AgendaDayController
        professional={professional}
        date={date}
        preload={agendaData}
        loading={loading}
        user={session?.usuario}
        role={role}
      />
    </div>
  );
}
