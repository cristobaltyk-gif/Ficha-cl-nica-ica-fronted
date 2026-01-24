import { useEffect, useState } from "react";
import Agenda from "../components/agenda/Agenda";

const API_URL = import.meta.env.VITE_API_URL;

/*
Orquestador de Agenda (CANÓNICO)
- Maneja contexto
- Decide cuándo cargar
- Refresca agenda tras acciones
*/

export default function AgendaPage() {
  // =========================
  // CONTEXTO
  // =========================

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [box, setBox] = useState(""); // box1 | box2 | box3
  const [professionals, setProfessionals] = useState([]); // 1 o 2 ids

  // =========================
  // DATA
  // =========================

  const [loading, setLoading] = useState(false);
  const [agendaData, setAgendaData] = useState(null);
  const [error, setError] = useState(null);

  // 🔑 CLAVE: disparador de recarga
  const [reloadKey, setReloadKey] = useState(0);

  // =========================
  // CARGA DE AGENDA
  // =========================

  useEffect(() => {
    let cancelled = false;

    // Regla dura: no cargar sin contexto completo
    if (!date || !box || professionals.length === 0) {
      setAgendaData(null);
      return;
    }

    async function loadAgenda() {
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

    loadAgenda();

    return () => {
      cancelled = true;
    };
  }, [date, box, professionals, reloadKey]); // 👈 AQUÍ ESTABA EL PROBLEMA

  // =========================
  // ERRORES
  // =========================

  if (error) {
    return <div className="agenda-state">Error: {error}</div>;
  }

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

      /* setters de contexto */
      onDateChange={setDate}
      onBoxChange={setBox}
      onProfessionalsChange={setProfessionals}

      /* 🔁 REFRESH REAL */
      onAgendaChanged={() => {
        setReloadKey((k) => k + 1);
      }}
    />
  );
}
