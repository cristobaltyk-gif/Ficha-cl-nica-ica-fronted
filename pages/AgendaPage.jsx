import { useEffect, useState } from "react";
import Agenda from "../components/agenda/Agenda.jsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function AgendaPage({ forcedDate, professionals = [] }) {
  // =========================
  // FECHA
  // =========================
  const [date, setDate] = useState(
    forcedDate || new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    if (forcedDate) {
      setDate(forcedDate);
    }
  }, [forcedDate]);

  const [box, setBox] = useState("");

  // =========================
  // DATA AGENDA
  // =========================
  const [loading, setLoading] = useState(false);
  const [agendaData, setAgendaData] = useState(null);
  const [error, setError] = useState(null);

  const [reloadKey, setReloadKey] = useState(0);

  // =========================
  // CARGA AGENDA
  // =========================
  useEffect(() => {
    if (!date) return;

    const controller = new AbortController();

    async function loadAgenda() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${API_URL}/agenda?date=${date}`,
          { signal: controller.signal }
        );

        const data = await res.json();
        setAgendaData(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Error cargando agenda");
          // ❌ NO limpiar agendaData
        }
      } finally {
        setLoading(false);
      }
    }

    loadAgenda();

    return () => controller.abort();
  }, [date, reloadKey]);

  // =========================
  // RENDER
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
      onAgendaChanged={() => setReloadKey((k) => k + 1)}
    />
  );
}
