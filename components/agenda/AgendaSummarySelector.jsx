import { useEffect, useMemo, useState } from "react";
import "../../styles/agenda/agenda-summary-selector.css";

const API_URL = import.meta.env.VITE_API_URL;

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function AgendaSummarySelector({
  professionals = [],
  mode = "monthly",
  startDate, // 🔒 no se elimina (no rompemos contrato)
  onSelectDay
}) {
  const [loading, setLoading] = useState(false);
  const [daysByProfessional, setDaysByProfessional] = useState({});

  /* =====================================================
     ✅ BASE DATE = HOY LOCAL (SIN BUG UTC)
  ===================================================== */
  function getLocalISODate() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 10);
  }

  const baseDate = getLocalISODate();

  const isSingle = professionals.length === 1;

  /* ========= SELECTOR (SIN CAMBIOS) ========= */
  const [selectedIds, setSelectedIds] = useState(
    isSingle ? [professionals[0]?.id] : []
  );
  const [appliedIds, setAppliedIds] = useState(
    isSingle ? [professionals[0]?.id] : []
  );

  useEffect(() => {
    if (isSingle && professionals[0]?.id) {
      setSelectedIds([professionals[0].id]);
      setAppliedIds([professionals[0].id]);
    }
  }, [professionals, isSingle]);

  function toggleProfessional(id) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }

  function handleApply() {
    setAppliedIds(selectedIds);
  }

  /* =====================================================
     ✅ GRILLA RANGO MÓVIL (30 DÍAS DESDE HOY)
     ALINEADO CON BACKEND
  ===================================================== */
  const rangeCells = useMemo(() => {
    const start = new Date(baseDate);
    const days = [];

    for (let i = 0; i < 30; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }

    const firstDay = days[0];
    const offset = (firstDay.getDay() + 6) % 7;

    const cells = [];

    for (let i = 0; i < offset; i++) {
      cells.push(null);
    }

    days.forEach((d) => cells.push(d));

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [baseDate]);

  /* ========= BACKEND (SIN CAMBIOS) ========= */
  useEffect(() => {
    let cancelled = false;

    async function loadMany(ids) {
      if (!ids.length) return;
      setLoading(true);

      const endpoint =
        mode === "weekly"
          ? "/agenda/summary/week"
          : "/agenda/summary/month";

      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const res = await fetch(
                `${API_URL}${endpoint}?professional=${id}&start_date=${baseDate}`
              );
              const data = res.ok ? await res.json() : { days: {} };
              return [id, data.days || {}];
            } catch {
              return [id, {}];
            }
          })
        );

        if (!cancelled) {
          setDaysByProfessional((prev) => {
            const next = { ...prev };
            results.forEach(([id, days]) => (next[id] = days));
            return next;
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (isSingle) {
      loadMany([professionals[0].id]);
    } else {
      loadMany(appliedIds);
    }

    return () => (cancelled = true);
  }, [professionals, appliedIds, baseDate, mode, isSingle]);

  const visibleProfessionals = isSingle
    ? professionals
    : professionals.filter((p) => appliedIds.includes(p.id));

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <div className="agenda-summary-selector">

      {!isSingle && (
        <>
          <div className="summary-professionals">
            {professionals.map((p) => {
              const active = selectedIds.includes(p.id);
              const disabled = !active && selectedIds.length >= 4;

              return (
                <label
                  key={p.id}
                  className={`professional-item ${active ? "active" : ""} ${
                    disabled ? "disabled" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    disabled={disabled}
                    onChange={() => toggleProfessional(p.id)}
                  />
                  {p.name}
                </label>
              );
            })}
          </div>

          <div className="summary-footer">
            <span>{selectedIds.length} / 4 seleccionados</span>
            <button
              className="apply-btn"
              onClick={handleApply}
              disabled={selectedIds.length === 0}
            >
              Aplicar
            </button>
          </div>
        </>
      )}

      {loading && <p>Cargando agenda…</p>}

      {visibleProfessionals.map((p) => {
        const backendDays = daysByProfessional[p.id] || {};

        return (
          <div key={p.id} className="month-calendar">
            <h4>{p.name}</h4>

            <div className="month-weekdays">
              {WEEKDAYS.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="month-grid">
              {rangeCells.map((dateObj, i) => {
                if (!dateObj)
                  return <div key={i} className="day-cell empty" />;

                const yyyy = dateObj.getFullYear();
                const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
                const dd = String(dateObj.getDate()).padStart(2, "0");

                const dateISO = `${yyyy}-${mm}-${dd}`;
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
                    {dd}
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
