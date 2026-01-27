import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaMonthSummary (MÓDULO INDEPENDIENTE)

✔ Endpoint: GET /agenda/summary/month
✔ Uso: Secretaría / Reserva Online / Administrador
✔ NO depende de AgendaPage
✔ NO muta agenda
*/

export default function AgendaMonthSummary({
  professional, // ej: "medico1"
  date          // ej: "2026-01-27"
}) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!professional || !date) {
      setSummary(null);
      return;
    }

    const month = date.slice(0, 7); // YYYY-MM

    let cancelled = false;

    async function loadMonthSummary() {
      setLoading(true);

      try {
        const res = await fetch(
          `${API_URL}/agenda/summary/month?professional=${professional}&month=${month}`
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

    loadMonthSummary();

    return () => {
      cancelled = true;
    };
  }, [professional, date]);

  // =========================
  // RENDER
  // =========================

  if (loading) {
    return (
      <div className="summary-box">
        Cargando resumen mensual…
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="summary-box">
      <h3>📅 Resumen mensual</h3>

      {/* DEBUG SIMPLE (por ahora) */}
      <pre style={{ fontSize: 12 }}>
        {JSON.stringify(summary, null, 2)}
      </pre>
    </div>
  );
}
