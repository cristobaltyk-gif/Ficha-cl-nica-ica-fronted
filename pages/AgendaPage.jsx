import { useEffect, useState } from "react";
import Agenda from "../components/agenda/Agenda.jsx";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaPage — PRODUCCIÓN

✔ Recibe profesionales ya seleccionados
✔ Carga SOLO agenda diaria
✔ No decide selección global
*/

export default function AgendaPage({ forcedDate, professionals }) {
  // =========================
  // FECHA
  // =========================
  const [date, setDate] = useState(
    forcedDate || new Date().toISOString().slice(0, 10)
  );

  const [box, setBox] = useState("");

  // =========================
  // DATA AGENDA
  // =========================
  const [loading, setLoading] = useState(false);
  const [agendaData, setAgendaData] = useState(null);
  const [error, setError] = useState(null);

  const [reloadKey, setReloadKey] = useState(0);

  // =========================
  // AGENDA (POR FECHA)
  // =========================
  useEffect(() => {
    async function loadAgenda() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/agenda?date=${date}`);
        const data = await res.json();
        setAgendaData(data);
      } catch {
        setError("Error cargando agenda");
        setAgendaData(null);
      } finally {
        setLoading(false);
      }
    }

    loadAgenda();
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
