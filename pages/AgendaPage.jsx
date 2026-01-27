import { useEffect, useState } from "react";
import Agenda from "../components/agenda/Agenda";

const API_URL = import.meta.env.VITE_API_URL;

/*
Orquestador de Agenda (CANÓNICO)

✔ Mantiene carga diaria intacta
✔ No rompe nada existente
✔ Integra Summary mensual/semanal (nuevo)
✔ Preparado para calendario visual futuro
*/

export default function AgendaPage() {
  // =========================
  // CONTEXTO
  // =========================

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [box, setBox] = useState(""); // box1 | box2 | box3
  const [professionals, setProfessionals] = useState([]); // ["medico1"]

  // =========================
  // DATA PRINCIPAL (día)
  // =========================

  const [loading, setLoading] = useState(false);
  const [agendaData, setAgendaData] = useState(null);
  const [error, setError] = useState(null);

  // =========================
  // SUMMARY (nuevo)
  // =========================

  const [monthSummary, setMonthSummary] = useState(null);
  const [weekSummary, setWeekSummary] = useState(null);

  // 🔑 disparador de recarga
  const [reloadKey, setReloadKey] = useState(0);

  // =========================
  // CARGA AGENDA DIARIA (igual que antes)
  // =========================

  useEffect(() => {
    let cancelled = false;

    // Regla dura: no cargar sin contexto completo
    if (!date || !box || professionals.length === 0) {
      setAgendaData(null);
      return;
    }

    async function loadAgendaDay() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${API_URL}/agenda?date=${date}`,
          { headers: { Accept: "application/json" } }
        );

        if (!res.ok) {
          throw new Error("No se pudo cargar agenda");
        }

        const data = await res.json();

        if (!cancelled) {
          setAgendaData(data);
        }

      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setAgendaData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAgendaDay();

    return () => {
      cancelled = true;
    };
  }, [date, box, professionals, reloadKey]);

  // =========================
  // SUMMARY MENSUAL (nuevo)
  // =========================

  useEffect(() => {
    let cancelled = false;

    if (professionals.length === 0) {
      setMonthSummary(null);
      return;
    }

    const professional = professionals[0];
    const month = date.slice(0, 7); // YYYY-MM

    async function loadMonthSummary() {
      try {
        const res = await fetch(
          `${API_URL}/agenda/summary/month?professional=${professional}&month=${month}`
        );

        if (!res.ok) return;

        const data = await res.json();

        if (!cancelled) {
          setMonthSummary(data);
        }
      } catch {
        setMonthSummary(null);
      }
    }

    loadMonthSummary();

    return () => {
      cancelled = true;
    };
  }, [date, professionals, reloadKey]);

  // =========================
  // SUMMARY SEMANAL (nuevo)
  // =========================

  useEffect(() => {
    let cancelled = false;

    if (professionals.length === 0) {
      setWeekSummary(null);
      return;
    }

    const professional = professionals[0];

    async function loadWeekSummary() {
      try {
        const res = await fetch(
          `${API_URL}/agenda/summary/week?professional=${professional}&week_start=${date}`
        );

        if (!res.ok) return;

        const data = await res.json();

        if (!cancelled) {
          setWeekSummary(data);
        }
      } catch {
        setWeekSummary(null);
      }
    }

    loadWeekSummary();

    return () => {
      cancelled = true;
    };
  }, [date, professionals, reloadKey]);

  // =========================
  // ERRORES
  // =========================

  if (error) {
    return <div className="agenda-state">Error: {error}</div>;
  }

  // =========================
  // RENDER FINAL
  // =========================

  return (
    <Agenda
      loading={loading}
      date={date}
      box={box}
      professionals={professionals}
      agendaData={agendaData}

      /* setters contexto */
      onDateChange={setDate}
      onBoxChange={setBox}
      onProfessionalsChange={setProfessionals}

      /* 🔥 summary integrado (nuevo) */
      monthSummary={monthSummary}
      weekSummary={weekSummary}

      /* refresh real */
      onAgendaChanged={() => {
        setReloadKey((k) => k + 1);
      }}
    />
  );
}
