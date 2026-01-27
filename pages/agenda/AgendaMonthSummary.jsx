import "../../styles/agenda/month-summary.css";
import { useEffect, useState } from "react";


const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaMonthSummary (REAL)

✔ Calendario mensual visual
✔ Endpoint: GET /agenda/summary/month
✔ Secretaría / Reserva Online / Administrador
✔ NO depende de AgendaPage
✔ NO imprime JSON
*/

export default function AgendaMonthSummary({
  professional, // ej: "medico1"
  date          // ej: "2026-01-27"
}) {
  const [days, setDays] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH SUMMARY MENSUAL
  // =========================
  useEffect(() => {
    if (!professional || !date) {
      setDays(null);
      return;
    }

    const month = date.slice(0, 7); // YYYY-MM
    let cancelled = false;

    async function loadMonth() {
      setLoading(true);

      try {
        const res = await fetch(
          `${API_URL}/agenda/summary/month?professional=${professional}&month=${month}`
        );

        if (!res.ok) return;

        const data = await res.json();

        if (!cancelled) {
          setDays(data.days); // 👈 contrato esperado
        }
      } catch {
        setDays(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMonth();

    return () => {
      cancelled = true;
    };
  }, [professional, date]);

  // =========================
  // HELPERS UI
  // =========================
  function getColor(status) {
    if (status === "free") return "day free";
    if (status === "low") return "day low";
    if (status === "full") return "day full";
    return "day empty";
  }

  // =========================
  // RENDER
  // =========================
  if (loading) {
    return (
      <div className="month-summary">
        <h3>📅 Calendario mensual</h3>
        <p>Cargando…</p>
      </div>
    );
  }

  if (!days) return null;

  return (
    <div className="month-summary">
      <h3>📅 Disponibilidad mensual</h3>

      <div className="month-grid">
        {Object.entries(days).map(([day, status]) => (
          <div key={day} className={getColor(status)}>
            <span className="day-number">{day}</span>
          </div>
        ))}
      </div>

      {/* LEYENDA */}
      <div className="legend">
        <span><b className="dot free"></b> Libre</span>
        <span><b className="dot low"></b> Pocos cupos</span>
        <span><b className="dot full"></b> Lleno</span>
        <span><b className="dot empty"></b> Sin agenda</span>
      </div>
    </div>
  );
}
