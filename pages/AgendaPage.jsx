import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import Agenda from "../components/agenda/Agenda";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaPage (CANÓNICO FINAL)

✔ Agenda diaria intacta
✔ Secretaría → summary mensual SOLO
✔ Médico → summary semanal SOLO
✔ NO carga ambos
*/

export default function AgendaPage() {
  const { role } = useAuth();

  // =========================
  // CONTEXTO
  // =========================

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [box, setBox] = useState("");
  const [professionals, setProfessionals] = useState([]);

  // =========================
  // DATA PRINCIPAL (día)
  // =========================

  const [loading, setLoading] = useState(false);
  const [agendaData, setAgendaData] = useState(null);
  const [error, setError] = useState(null);

  // =========================
  // SUMMARY (según rol)
  // =========================

  const [monthSummary, setMonthSummary] = useState(null);
  const [weekSummary, setWeekSummary] = useState(null);

  // 🔑 refresco real
  const [reloadKey, setReloadKey] = useState(0);

  // =========================
  // AGENDA DIARIA (NO TOCAR)
  // =========================

  useEffect(() => {
    let cancelled = false;

    if (!date || !box || professionals.length === 0) {
      setAgendaData(null);
      return;
    }

    async function loadAgendaDay() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${API_URL}/agenda?date=${date}`
        );

        if (!res.ok) throw new Error("No se pudo cargar agenda");

        const data = await res.json();

        if (!cancelled) setAgendaData(data);

      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setAgendaData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAgendaDay();

    return () => {
      cancelled = true;
    };
  }, [date, box, professionals, reloadKey]);

  // =========================
  // SUMMARY SEGÚN ROL (CORRECTO)
  // =========================

  useEffect(() => {
    let cancelled = false;

    // reset siempre
    setMonthSummary(null);
    setWeekSummary(null);

    if (!role || professionals.length === 0) return;

    const professional = professionals[0];

    // =========================
    // SECRETARIA → MONTH ONLY
    // =========================
    if (role.name === "secretaria") {
      const month = date.slice(0, 7);

      async function loadMonth() {
        try {
          const res = await fetch(
            `${API_URL}/agenda/summary/month?professional=${professional}&month=${month}`
          );

          if (!res.ok) return;

          const data = await res.json();

          if (!cancelled) setMonthSummary(data);

        } catch {
          setMonthSummary(null);
        }
      }

      loadMonth();
    }

    // =========================
    // MEDICO → WEEK ONLY
    // =========================
    if (role.name === "medico") {
      async function loadWeek() {
        try {
          const res = await fetch(
            `${API_URL}/agenda/summary/week?professional=${professional}&week_start=${date}`
          );

          if (!res.ok) return;

          const data = await res.json();

          if (!cancelled) setWeekSummary(data);

        } catch {
          setWeekSummary(null);
        }
      }

      loadWeek();
    }

    return () => {
      cancelled = true;
    };
  }, [date, professionals, role, reloadKey]);

  // =========================
  // ERROR
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

      onDateChange={setDate}
      onBoxChange={setBox}
      onProfessionalsChange={setProfessionals}

      // ✅ SOLO UNO llegará según rol
      monthSummary={monthSummary}
      weekSummary={weekSummary}

      onAgendaChanged={() => {
        setReloadKey((k) => k + 1);
      }}
    />
  );
      }
