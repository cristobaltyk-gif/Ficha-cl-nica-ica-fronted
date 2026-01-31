import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";

import CalendarWeekView from "./CalendarWeekView";
import AgendaDayController from "./AgendaDayController";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaMedicoController — PRODUCCIÓN REAL (CONTROLLER REAL)

✔ Hace la pega (como secretaria)
✔ Normaliza semana a LUNES
✔ Calcula weekdays
✔ Decide estados (free / empty / etc)
✔ CalendarWeekView = vista pura
✔ Agenda diaria se mantiene igual
*/

export default function AgendaMedicoController() {
  const { professional } = useAuth();
  // professional === "huerta"

  // =========================
  // ESTADO
  // =========================
  const [selectedDate, setSelectedDate] = useState(null);
  const [weekDays, setWeekDays] = useState([]); // [{ date, weekday, status }]

  // =========================
  // SEGURIDAD
  // =========================
  if (!professional) {
    return (
      <div className="agenda-placeholder">
        Médico sin profesional asignado
      </div>
    );
  }

  // =========================
  // FECHA BASE
  // =========================
  const today = new Date().toISOString().slice(0, 10);

  // =========================
  // HELPERS (copiados del patrón BUENO)
  // =========================
  function getMonday(dateISO) {
    const d = new Date(dateISO);
    const jsDay = d.getDay(); // 0 dom, 1 lun
    const diff = jsDay === 0 ? -6 : 1 - jsDay;
    d.setDate(d.getDate() + diff);
    return d;
  }

  function weekdayFromDate(d) {
    return d.toLocaleDateString("es-CL", { weekday: "short" });
  }

  // =========================
  // CARGAR SUMMARY SEMANAL
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadWeek() {
      try {
        const res = await fetch(
          `${API_URL}/agenda/summary/week` +
            `?professional=${encodeURIComponent(professional)}` +
            `&start_date=${encodeURIComponent(today)}`
        );

        if (!res.ok) return;

        const data = await res.json();
        const summary = data?.days || {};

        // 🔑 NORMALIZAR SEMANA A LUNES
        const monday = getMonday(today);
        const days = [];

        for (let i = 0; i < 7; i++) {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);

          const iso = d.toISOString().slice(0, 10);

          days.push({
            date: iso,
            weekday: weekdayFromDate(d),
            status: summary[iso] || "empty", // 👈 VERDE SI VIENE "free"
          });
        }

        if (!cancelled) {
          setWeekDays(days);
        }
      } catch (e) {
        if (!cancelled) setWeekDays([]);
      }
    }

    loadWeek();
    return () => {
      cancelled = true;
    };
  }, [professional, today]);

  // =========================
  // AUTO-SELECCIÓN INICIAL
  // =========================
  useEffect(() => {
    setSelectedDate({
      date: today,
      key: Date.now(),
    });
  }, [today]);

  // =========================
  // RENDER
  // =========================
  return (
    <section className="agenda-medico">

      {/* =========================
          RESUMEN SEMANAL (YA PROCESADO)
          LUNES + WEEKDAY + STATUS
      ========================= */}
      <CalendarWeekView
        days={weekDays}
        selectedDate={selectedDate}
        onSelectDate={({ date }) =>
          setSelectedDate({
            date,
            key: Date.now(),
          })
        }
      />

      {/* =========================
          AGENDA DIARIA REAL
      ========================= */}
      {selectedDate && (
        <AgendaDayController
          key={selectedDate.key}
          professional={professional}
          date={selectedDate.date}
        />
      )}
    </section>
  );
}
