import { useState, useEffect } from "react";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaSummary — COMPONENTE PURO (FINAL)

✔ Funciona con 1 o muchos profesionales
✔ Backend es la verdad
✔ NO lógica clínica
✔ NO cerebro
✔ Auto-selecciona SOLO si hay 1 profesional y 1 día disponible
*/

export default function AgendaSummary({
  professionals = [],
  mode = "monthly",
  startDate,
  onSelectDay
}) {
  const [daysByProfessional, setDaysByProfessional] = useState({});
  const [loading, setLoading] = useState(false);

  const baseDate = startDate || new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setLoading(true);
      const result = {};

      const endpoint =
        mode === "weekly"
          ? "/agenda/summary/week"
          : "/agenda/summary/month";

      for (const { id } of professionals) {
        const res = await fetch(
          `${API_URL}${endpoint}?professional=${id}&start_date=${baseDate}`
        );
        if (!res.ok) {
          result[id] = {};
          continue;
        }

        const data = await res.json();
        result[id] = data.days || {};
      }

      if (!cancelled) {
        setDaysByProfessional(result);
        setLoading(false);
      }
    }

    if (professionals.length > 0) {
      loadSummary();
    }

    return () => (cancelled = true);
  }, [professionals, mode, baseDate]);

  /* =========================
     AUTO-SELECCIÓN (1 médico)
     ========================= */
  useEffect(() => {
    if (professionals.length !== 1) return;

    const prof = professionals[0];
    const days = daysByProfessional[prof.id];
    if (!days) return;

    const available = Object.entries(days).filter(
      ([_, status]) => status !== "empty"
    );

    if (available.length === 1) {
      const [date] = available[0];
      onSelectDay({ professional: prof.id, date });
    }
  }, [daysByProfessional, professionals, onSelectDay]);

  if (loading) return <p>Cargando agenda…</p>;

  return (
    <>
      {professionals.map((p) => {
        const days = daysByProfessional[p.id];
        if (!days) return null;

        const entries = Object.entries(days);

        return (
          <div key={p.id} className="month-calendar">
            <h4>{p.name}</h4>

            {entries.length === 0 ? (
              <p className="agenda-empty">
                Sin disponibilidad para este período
              </p>
            ) : (
              <div className="month-grid">
                {entries.map(([date, status]) => (
                  <button
                    key={date}
                    className={`day-cell ${status}`}
                    disabled={status === "empty"}
                    onClick={() =>
                      status !== "empty" &&
                      onSelectDay({ professional: p.id, date })
                    }
                  >
                    {date.slice(-2)}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
