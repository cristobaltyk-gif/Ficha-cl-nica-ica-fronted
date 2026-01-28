import "../../styles/agenda/month-summary.css";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaMonthSummary (CANÓNICO)

✔ Soporta hasta 4 médicos seleccionados
✔ Pinta disponibilidad mensual real
✔ Click en día → abre Agenda diaria
✔ NO usa medico1/medico2
✔ Usa selectedDate + onSelectDate
*/

export default function AgendaMonthSummary({
  professionals = [],         // ["dr_huerta","dr_espinoza"]
  selectedDate,               // "2026-01-27"
  onSelectDate                // function(day)
}) {
  const [days, setDays] = useState({});
  const [loading, setLoading] = useState(false);

  // ============================
  // MES ACTUAL (si no hay fecha, hoy)
  // ============================
  const baseDate =
    selectedDate || new Date().toISOString().slice(0, 10);

  const month = baseDate.slice(0, 7); // YYYY-MM

  // ============================
  // FETCH SUMMARY MENSUAL
  // ============================
  useEffect(() => {
    if (!professionals.length) {
      setDays({});
      return;
    }

    let cancelled = false;

    async function loadMonth() {
      setLoading(true);

      try {
        // 🔥 Traemos resumen del primer médico seleccionado
        // (después puedes combinar varios)
        const mainProfessional = professionals[0];

        const res = await fetch(
          `${API_URL}/agenda/summary/month?professional=${mainProfessional}&month=${month}`
        );

        if (!res.ok) return;

        const data = await res.json();

        if (!cancelled) {
          setDays(data.days || {});
        }
      } catch {
        setDays({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMonth();

    return () => {
      cancelled = true;
    };
  }, [professionals, month]);

  // ============================
  // HELPERS UI
  // ============================
  function getClass(status) {
    if (status === "free") return "day free";
    if (status === "low") return "day low";
    if (status === "full") return "day full";
    return "day empty";
  }

  // ============================
  // CLICK DÍA → AGENDA
  // ============================
  function handleClick(day) {
    if (typeof onSelectDate === "function") {
      onSelectDate(day);
    }
  }

  // ============================
  // RENDER
  // ============================
  return (
    <div className="month-summary">
      <h3>📅 Resumen mensual</h3>

      {/* Estado */}
      {loading && <p>Cargando disponibilidad…</p>}

      {!loading && Object.keys(days).length === 0 && (
        <p>No hay datos de agenda para este mes.</p>
      )}

      {/* Calendario */}
      <div className="month-grid">
        {Object.entries(days).map(([day, status]) => {
          const active = selectedDate === day;

          return (
            <button
              key={day}
              className={`${getClass(status)} ${
                active ? "selected" : ""
              }`}
              onClick={() => handleClick(day)}
            >
              {day.slice(-2)}
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="legend">
        <span><b className="dot free"></b> Libre</span>
        <span><b className="dot low"></b> Pocos</span>
        <span><b className="dot full"></b> Lleno</span>
        <span><b className="dot empty"></b> Sin agenda</span>
      </div>
    </div>
  );
}
