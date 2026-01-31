import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";

import AgendaDayController from "../components/agenda/AgendaDayController";
import AgendaMedicoController from "../components/agenda/AgendaMedicoController";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaPage — ROUTER DE AGENDA (PRODUCCIÓN REAL)

✔ Decide flujo por ROL
✔ Secretaria → AgendaDayController (selector manda)
✔ Médico → AgendaMedicoController (control propio)
✔ NO pinta agenda
✔ NO decide clínica
✔ NO rompe contratos existentes
*/

export default function AgendaPage({
  professional, // string (id profesional)
  date          // string YYYY-MM-DD
}) {
  const { session } = useAuth();
  const role = session?.role?.name;

  const [loading, setLoading] = useState(false);
  const [agendaData, setAgendaData] = useState(null);

  // =========================
  // GUARD RAILS
  // =========================
  if (!professional || !date) {
    return (
      <div className="agenda-page">
        <p>Selecciona un profesional y un día.</p>
      </div>
    );
  }

  // =========================
  // 🔐 FLUJO MÉDICO
  // =========================
  if (role === "MEDICO") {
    return (
      <div className="agenda-page">
        <AgendaMedicoController />
      </div>
    );
  }

  // =========================
  // 📅 FLUJO SECRETARIA / ADMIN
  // (MISMO DE SIEMPRE)
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

  return (
    <div className="agenda-page">
      <AgendaDayController
        professional={professional}
        date={date}
        preload={agendaData}   // backward-compatible
        loading={loading}
        user={session?.usuario}
        role={role}
      />
    </div>
  );
}
