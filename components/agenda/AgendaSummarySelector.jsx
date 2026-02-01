import { useState, useEffect } from "react";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaSummary — COMPONENTE PURO

✔ SOLO UI
✔ SOLO pinta lo que recibe
✔ Schedule viene desde cerebro
✔ EMPTY = fuera de schedule
*/

export default function AgendaSummary({
  professionals = [],      // [{ id, name, schedule }]
  mode = "monthly",        // weekly | monthly
  startDate,
  onSelectDay
}) {
  const [daysByProfessional, setDaysByProfessional] = useState({});
  const [loading, setLoading] = useState(false);

  function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  const baseDate = startDate || todayISO();

  function weekdayKey(dateStr) {
    return new Date(dateStr)
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
  }

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setLoading(true);
      const result = {};

      const endpoint =
        mode === "weekly"
          ? "/agenda/summary/week"
          : "/agenda/summary/month";

      for (const prof of professionals) {
        const { id, schedule } = prof;
        if (!schedule?.days) continue;

        const res = await fetch(
          `${API_URL}${endpoint}?professional=${id}&start_date=${baseDate}`
        );
        if (!res.ok) continue;

        const data = await res.json();
        const backendDays = data.days || {};
        const finalDays = {};

        for (const [date, status] of Object.entries(backendDays)) {
          const wk = weekdayKey(date);
          const worksThatDay = !!schedule.days[wk];

          finalDays[date] = worksThatDay ? status : "empty";
        }

        result[id] = finalDays;
      }

      if (!cancelled) setDaysByProfessional(result);
      setLoading(false);
    }

    loadSummary();
    return () => (cancelled = true);
  }, [professionals, mode, baseDate]);

  if (loading) return <p>Cargando agenda…</p>;

  return (
    <>
      {professionals.map((p) => {
        const days = daysByProfessional[p.id];
        if (!days) return null;

        return (
          <div key={p.id} className="month-calendar">
            <h4>{p.name}</h4>

            <div className="month-grid">
              {Object.entries(days).map(([date, status]) => (
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
          </div>
        );
      })}
    </>
  );
}
