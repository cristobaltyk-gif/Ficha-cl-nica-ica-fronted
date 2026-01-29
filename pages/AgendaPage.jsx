import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";

import Agenda from "../components/agenda/Agenda";

/*
AgendaPage — MÓDULO DIARIO (PRODUCCIÓN)

✔ NO summary
✔ NO calendario
✔ NO selector de profesionales
✔ SOLO agenda diaria
✔ Transaccional
✔ Reserva / anula / reprograma
✔ Backend es la verdad
*/

export default function AgendaPage({
  professional, // string (id profesional)
  date          // string YYYY-MM-DD
}) {
  const { session } = useAuth();

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
  // Render
  // =========================
  return (
    <div className="agenda-page">
      <Agenda
        professional={professional}
        date={date}
        user={session?.usuario}
        role={session?.role?.name}
      />
    </div>
  );
}
