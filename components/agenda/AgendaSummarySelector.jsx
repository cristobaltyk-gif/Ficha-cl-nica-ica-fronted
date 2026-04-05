import { useEffect, useMemo, useState } from "react";
import "../../styles/agenda/agenda-summary-selector.css";

const API_URL = import.meta.env.VITE_API_URL;

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function AgendaSummarySelector({
  professionals = [],
  mode = "monthly",
  startDate,
  onSelectDay,
  preselectedId = null,  // ← NUEVO: preselecciona médico desde URL
}) {
  const [loading, setLoading] = useState(false);
  const [daysByProfessional, setDaysByProfessional] = useState({});

  function getLocalISODate() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 10);
  }

  const baseDate = getLocalISODate();

  // ← Si viene preselectedId y existe en la lista, usarlo directamente
  const preselectedProfessional = useMemo(() => {
    if (!preselectedId) return null;
    return professionals.find((p) => p.id === preselectedId) || null;
  }, [professionals, preselectedId]);

  const isSingle = professionals.length === 1 || !!preselectedProfessional;

  const initialIds = useMemo(() => {
    if (preselectedProfessional) return [preselectedProfessional.id];
    if (professionals.length === 1) return [professionals[0]?.id];
    return [];
  }, [professionals, preselectedProfessional]);

  const [selectedIds, setSelectedIds] = useState(initialIds);
  const [appliedIds, setAppliedIds]   = useState(initialIds);

  useEffect(() => {
    if (preselectedProfessional) {
      setSelectedIds([preselectedProfessional.id]);
      setAppliedIds([preselectedProfessional.id]);
    } else if (professionals.length === 1 && professionals[0]?.id) {
      setSelectedIds([professionals[0].id]);
      setAppliedIds([professionals[0].id]);
    }
  }, [professionals, preselectedProfessional]);

  function toggleProfessional(id) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }

  function handleApply() {
    setAppliedIds(selectedIds);
  }

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
    for (let i = 0; i < offset; i++) cells.push(null);
    days.forEach((d) => cells.push(d));
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [baseDate]);

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
      const id = preselectedProfessional?.id || professionals[0]?.id;
      if (id) loadMany([id]);
    } else {
      loadMany(appliedIds);
    }

    return () => (cancelled = true);
  }, [professionals, appliedIds, baseDate, mode, isSingle, preselectedProfessional]);

  const visibleProfessionals = isSingle
    ? (preselectedProfessional ? [preselectedProfessional] : professionals.slice(0, 1))
    : professionals.filter((p) => appliedIds.includes(p.id));

  return (
    <div className="agenda-summary-selector">

      {/* ← Ocultar selector si viene preselectedId */}
      {!isSingle && (
        <>
          <div className="summary-professionals">
            {professionals.map((p) => {
              const active   = selectedIds.includes(p.id);
              const disabled = !active && selectedIds.length >= 4;

              return (
                <label
                  key={p.id}
                  className={`professional-item ${active ? "active" : ""} ${disabled ? "disabled" : ""}`}
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
                const mm   = String(dateObj.getMonth() + 1).padStart(2, "0");
                const dd   = String(dateObj.getDate()).padStart(2, "0");
                const dateISO = `${yyyy}-${mm}-${dd}`;
                const status  = backendDays[dateISO] || "empty";

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
