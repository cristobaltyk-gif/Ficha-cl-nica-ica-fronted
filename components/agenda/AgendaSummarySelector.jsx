import { useEffect, useMemo, useState } from "react";
import "../../styles/agenda/calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaSummarySelector — PRODUCCIÓN REAL

✔ 1 médico: NO muestra selector (automático)
✔ muchos médicos: muestra selector + botón "Aplicar"
✔ pinta semana Lun–Dom
✔ grilla mensual parte en LUNES y rellena vacíos
✔ NO auto-selecciona día (el día lo elige el usuario en el calendario)
✔ Emite { professional, date } SOLO por click del usuario
*/

export default function AgendaSummarySelector({
  professionals = [], // [{id, name}]
  mode = "monthly",
  startDate,
  onSelectDay
}) {
  const [loading, setLoading] = useState(false);

  // id -> { "YYYY-MM-DD": "empty"|"free"|"busy"|... }
  const [daysByProfessional, setDaysByProfessional] = useState({});

  // Selector (solo para secretaría con >1)
  const initialSelected = professionals?.[0]?.id || "";
  const [selectedProfessionalId, setSelectedProfessionalId] = useState(initialSelected);
  const [appliedProfessionalId, setAppliedProfessionalId] = useState(
    professionals.length === 1 ? initialSelected : ""
  );

  const baseDate = startDate || new Date().toISOString().slice(0, 10);

  // mantener selector consistente si cambia professionals
  useEffect(() => {
    const first = professionals?.[0]?.id || "";
    setSelectedProfessionalId((prev) => (prev ? prev : first));

    if (professionals.length === 1) {
      setAppliedProfessionalId(first);
    } else {
      // secretaría: no aplicar automático
      setAppliedProfessionalId("");
    }
  }, [professionals]);

  function handleApply() {
    setAppliedProfessionalId(selectedProfessionalId);
  }

  // =========================
  // UTIL: GRILLA MES (LUNES=0)
  // =========================
  const monthInfo = useMemo(() => {
    // baseDate "YYYY-MM-DD"
    const y = Number(baseDate.slice(0, 4));
    const m = Number(baseDate.slice(5, 7)); // 1-12

    const firstDay = new Date(Date.UTC(y, m - 1, 1));
    const lastDay = new Date(Date.UTC(y, m, 0)); // último día del mes
    const daysInMonth = lastDay.getUTCDate();

    // JS: 0=Dom ... 6=Sáb
    const jsDow = firstDay.getUTCDay();
    // convertimos a Lunes=0..Dom=6
    const mondayIndex = (jsDow + 6) % 7;

    // build lista de celdas: null = vacío, number = día del mes
    const cells = [];
    for (let i = 0; i < mondayIndex; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    // completar a múltiplo de 7 (para que cierre la grilla)
    while (cells.length % 7 !== 0) cells.push(null);

    return { y, m, daysInMonth, cells };
  }, [baseDate]);

  function isoForDay(dayNumber) {
    const y = monthInfo.y;
    const m = String(monthInfo.m).padStart(2, "0");
    const d = String(dayNumber).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // =========================
  // CARGA RESUMEN DESDE BACKEND
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadSummaryFor(ids) {
      setLoading(true);
      const result = {};

      const endpoint =
        mode === "weekly"
          ? "/agenda/summary/week"
          : "/agenda/summary/month";

      for (const id of ids) {
        try {
          const res = await fetch(
            `${API_URL}${endpoint}?professional=${id}&start_date=${baseDate}`
          );

          if (!res.ok) {
            result[id] = {};
            continue;
          }

          const data = await res.json();
          result[id] = data.days || {};
        } catch {
          result[id] = {};
        }
      }

      if (!cancelled) {
        setDaysByProfessional((prev) => ({ ...prev, ...result }));
        setLoading(false);
      }
    }

    if (professionals.length === 0) return;

    // Médico: 1 profesional -> cargar directo
    if (professionals.length === 1) {
      loadSummaryFor([professionals[0].id]);
      return () => (cancelled = true);
    }

    // Secretaría: solo cargar cuando se "aplica"
    if (appliedProfessionalId) {
      loadSummaryFor([appliedProfessionalId]);
    }

    return () => {
      cancelled = true;
    };
  }, [professionals, mode, baseDate, appliedProfessionalId]);

  // =========================
  // A QUIÉN SE MUESTRA
  // =========================
  const visibleProfessionals =
    professionals.length === 1
      ? professionals
      : appliedProfessionalId
        ? professionals.filter((p) => p.id === appliedProfessionalId)
        : [];

  // =========================
  // UI
  // =========================
  const showSelector = professionals.length > 1;

  return (
    <div className="agenda-summary-root">
      {/* Selector SOLO si hay muchos (secretaría) */}
      {showSelector && (
        <div className="agenda-summary-toolbar">
          <select
            value={selectedProfessionalId}
            onChange={(e) => setSelectedProfessionalId(e.target.value)}
          >
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleApply}
            disabled={!selectedProfessionalId}
          >
            Aplicar
          </button>
        </div>
      )}

      {loading && <p>Cargando agenda…</p>}

      {/* Si secretaría y aún no aplicó */}
      {showSelector && !appliedProfessionalId && !loading && (
        <p className="agenda-empty">Selecciona un médico y presiona “Aplicar”.</p>
      )}

      {/* Calendarios */}
      {visibleProfessionals.map((p) => {
        const backendDays = daysByProfessional[p.id] || {};

        return (
          <div key={p.id} className="month-calendar">
            <h4>{p.name}</h4>

            {/* Cabecera semana */}
            <div className="month-weekdays">
              <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
            </div>

            <div className="month-grid">
              {monthInfo.cells.map((dayNumber, idx) => {
                if (!dayNumber) {
                  return (
                    <div
                      key={`blank-${idx}`}
                      className="day-cell empty"
                      aria-hidden="true"
                    />
                  );
                }

                const dateISO = isoForDay(dayNumber);
                const status = backendDays[dateISO] || "empty"; // si no existe, lo tratamos como empty
                const disabled = status === "empty";

                return (
                  <button
                    key={dateISO}
                    className={`day-cell ${status}`}
                    disabled={disabled}
                    onClick={() =>
                      !disabled &&
                      onSelectDay({
                        professional: p.id,
                        date: dateISO
                      })
                    }
                  >
                    {String(dayNumber).padStart(2, "0")}
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
