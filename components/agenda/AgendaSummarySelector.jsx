import { useEffect, useMemo, useState } from "react";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/*
AgendaSummarySelector — PRODUCCIÓN REAL (ORDENADO)

✔ 1 médico: carga directa, sin selector
✔ >1 médicos: selector + botón Aplicar
✔ Semana Lun–Dom
✔ Mes alineado a lunes, con vacíos
✔ NO auto-selecciona día
✔ Emite { professional, date } SOLO por click
*/

export default function AgendaSummarySelector({
  professionals = [],
  mode = "monthly",
  startDate,
  onSelectDay
}) {
  const [loading, setLoading] = useState(false);
  const [daysByProfessional, setDaysByProfessional] = useState({});

  // ===== FECHA BASE =====
  const baseDate = startDate || new Date().toISOString().slice(0, 10);

  // ===== SELECTOR (solo secretaría) =====
  const isSingle = professionals.length === 1;

  const [selectedProfessionalId, setSelectedProfessionalId] = useState(
    professionals[0]?.id || ""
  );
  const [appliedProfessionalId, setAppliedProfessionalId] = useState(
    isSingle ? professionals[0]?.id : ""
  );

  useEffect(() => {
    const first = professionals[0]?.id || "";
    setSelectedProfessionalId(first);
    setAppliedProfessionalId(isSingle ? first : "");
  }, [professionals, isSingle]);

  function handleApply() {
    setAppliedProfessionalId(selectedProfessionalId);
  }

  // ===== GRILLA MENSUAL (LUNES) =====
  const month = useMemo(() => {
    const y = Number(baseDate.slice(0, 4));
    const m = Number(baseDate.slice(5, 7));

    const first = new Date(Date.UTC(y, m - 1, 1));
    const last = new Date(Date.UTC(y, m, 0));

    const jsDay = first.getUTCDay(); // 0=Dom
    const offset = (jsDay + 6) % 7;  // Lun=0

    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= last.getUTCDate(); d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return { y, m, cells };
  }, [baseDate]);

  function isoForDay(d) {
    const mm = String(month.m).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${month.y}-${mm}-${dd}`;
  }

  // ===== BACKEND =====
  useEffect(() => {
    let cancelled = false;

    async function load(professionalId) {
      setLoading(true);

      const endpoint =
        mode === "weekly"
          ? "/agenda/summary/week"
          : "/agenda/summary/month";

      try {
        const res = await fetch(
          `${API_URL}${endpoint}?professional=${professionalId}&start_date=${baseDate}`
        );

        const data = res.ok ? await res.json() : { days: {} };

        if (!cancelled) {
          setDaysByProfessional((prev) => ({
            ...prev,
            [professionalId]: data.days || {}
          }));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (isSingle) {
      load(professionals[0].id);
    } else if (appliedProfessionalId) {
      load(appliedProfessionalId);
    }

    return () => (cancelled = true);
  }, [professionals, appliedProfessionalId, baseDate, mode, isSingle]);

  // ===== QUIÉN SE MUESTRA =====
  const visibleProfessionals = isSingle
    ? professionals
    : appliedProfessionalId
      ? professionals.filter((p) => p.id === appliedProfessionalId)
      : [];

  // ===== UI =====
  return (
    <div className="agenda-summary-root">

      {!isSingle && (
        <div className="agenda-summary-toolbar">
          <select
            value={selectedProfessionalId}
            onChange={(e) => setSelectedProfessionalId(e.target.value)}
          >
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button onClick={handleApply} disabled={!selectedProfessionalId}>
            Aplicar
          </button>
        </div>
      )}

      {loading && <p>Cargando agenda…</p>}

      {!isSingle && !appliedProfessionalId && !loading && (
        <p className="agenda-empty">
          Selecciona un médico y presiona “Aplicar”.
        </p>
      )}

      {visibleProfessionals.map((p) => {
        const backendDays = daysByProfessional[p.id] || {};

        return (
          <div key={p.id} className="month-calendar">
            <h4>{p.name}</h4>

            <div className="month-weekdays">
              {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
            </div>

            <div className="month-grid">
              {month.cells.map((day, i) => {
                if (!day) {
                  return <div key={i} className="day-cell empty" />;
                }

                const dateISO = isoForDay(day);
                const status = backendDays[dateISO] || "empty";

                return (
                  <button
                    key={dateISO}
                    className={`day-cell ${status}`}
                    disabled={status === "empty"}
                    onClick={() =>
                      onSelectDay({ professional: p.id, date: dateISO })
                    }
                  >
                    {String(day).padStart(2, "0")}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
