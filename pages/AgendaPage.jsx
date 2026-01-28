import { useEffect, useState } from "react";
import Agenda from "../components/agenda/Agenda";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaPage SIN BLOQUEOS
- Siempre usa fecha actual
- Siempre carga agenda
- Siempre entrega profesionales al dashboard
- NO hay condiciones de carga
*/

export default function AgendaPage({ forcedDate, onProfessionalsLoaded }) {
  // =========================
  // FECHA SIEMPRE ACTUAL
  // =========================

  const [date, setDate] = useState(
    forcedDate || new Date().toISOString().slice(0, 10)
  );

  const [box, setBox] = useState("");
  const [professionals, setProfessionals] = useState([]);

  // =========================
  // DATA
  // =========================

  const [loading, setLoading] = useState(false);
  const [agendaData, setAgendaData] = useState(null);
  const [error, setError] = useState(null);

  const [reloadKey, setReloadKey] = useState(0);

  // =========================
  // PROFESIONALES (SIEMPRE)
  // =========================
  useEffect(() => {
    async function loadProfessionals() {
      try {
        const res = await fetch(`${API_URL}/agenda/professionals`);
        const data = await res.json();

        setProfessionals(data);

        // ✅ SIEMPRE entregar al dashboard
        onProfessionalsLoaded?.(data);
      } catch {
        setProfessionals([]);

        // ✅ incluso si falla
        onProfessionalsLoaded?.([]);
      }
    }

    loadProfessionals();
  }, []);

  // =========================
  // AGENDA (SIEMPRE SIN IF)
  // =========================
  useEffect(() => {
    async function loadAgenda() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/agenda?date=${date}`);
        const data = await res.json();

        setAgendaData(data);
      } catch (err) {
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
      onProfessionalsChange={setProfessionals}
      onAgendaChanged={() => setReloadKey((k) => k + 1)}
    />
  );
}
