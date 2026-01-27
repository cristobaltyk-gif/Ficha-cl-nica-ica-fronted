import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";

import "../../styles/agenda/summary.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaWeekSummary (REAL – FINAL)

✔ Ruta: /pages/agenda/AgendaWeekSummary.jsx
✔ Endpoint: GET /agenda/summary/week
✔ Uso: Médico (vista semanal)
✔ NO depende de AgendaPage
✔ NO imprime JSON
✔ Tabla clínica simple
*/

export default function AgendaWeekSummary() {
  const { session } = useAuth();

  // Profesional = usuario logeado
  const professional = session?.usuario;

  // =========================
  // Semana actual (lunes)
  // =========================
  function getMonday() {
    const d = new Date();
    const day = d.getDay(); // 0 domingo

    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);

    return d.toISOString().slice(0, 10);
  }

  const [weekStart] = useState(getMonday);

  // =========================
  // Estado
  // =========================
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // Load weekly summary
  // =========================
  useEffect(() => {
    if (!professional) return;

    let cancelled = false;

    async function loadWeekSummary() {
      setLoading(true);

      try {
        const res = await fetch(
          `${API_URL}/agenda/summary/week?professional=${professional}&week_start=${weekStart}`
        );

        if (!res.ok) return;

        const data = await res.json();

        if (!cancelled) {
          setSummary(data);
        }
      } catch {
        setSummary(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadWeekSummary();

    return () => {
      cancelled = true;
    };
  }, [professional, weekStart]);

  // =========================
  // Render
  // =========================
  if (loading) {
    return (
      <div className="summary-box">
        Cargando resumen semanal…
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="summary-box">
        No hay resumen semanal disponible.
      </div>
    );
  }

  const days = summary.days || {};

  return (
    <div className="summary-box">
      <h3>🗓️ Semana del Médico</h3>
      <p className="summary-sub">
        Desde {weekStart}
      </p>

      <table className="summary-table">
        <thead>
          <tr>
            <th>Día</th>
            <th>Ocupados</th>
          </tr>
        </thead>

        <tbody>
          {Object.keys(days).map((date) => (
            <tr key={date}>
              <td>{date}</td>
              <td>{days[date]?.busy || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
