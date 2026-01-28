import "../../styles/agenda/month-summary.css";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaMonthSummary (CANÓNICO FINAL)

✔ Muestra disponibilidad mensual de 1 profesional
✔ Secretaría puede ver hasta 4 porque el ORQUESTADOR lo repite
✔ Click en día → abre Agenda diaria
✔ NO combina médicos aquí
✔ NO inventa nombres
*/

export default function AgendaMonthSummary({
  professional,     // ID real del backend (ej: "dr_huerta")
  selectedDate,     // "2026-01-27"
  onSelectDate      // function(day)
}) {
  const [days, setDays] = useState({});
  const [loading, setLoading] = useState(false);

  // ============================
  // MES ACTUAL (si no hay fecha → hoy)
  // ============================
  const baseDate =
    selectedDate || new Date().toISOString().slice(0, 10);

  const month = baseDate.slice(0, 7); // YYYY-MM

  // ============================
  // FETCH SUMMARY MENSUAL
  // ============================
  useEffect(() => {
    if (!professional) {
      setDays({});
      return;
    }

    let cancelled = false;

    async function loadMonth() {
      setLoading(true);

      try {
        const res = await fetch(
          `${API_URL}/agenda/summary/month?professional=${professional}&month=${month}`
        );

        if (!res.ok) {
          setDays({});
          return;
        }

        const data = await res.json();

        if (!cancelled) {
          setDays(data.days || {});
        }
      } catch (err) {
        console.error("Error resumen mensual", err);
        setDays({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMonth();

    return () => {
      cancelled = true;
    };
  }, [professional, month]);

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
  // CLICK DÍA → ABRIR AGENDA
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
      <h3>📅 {professional}</h3>

      {/* Estado */}
      {loading && <p>Cargando disponibilidad…</p>}

      {!loading && Object.keys(days).length === 0 && (
        <p>No hay agenda para este mes.</p>
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
