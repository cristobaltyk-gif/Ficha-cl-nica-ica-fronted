import { useEffect, useState } from "react";
import Agenda from "../components/agenda/Agenda";

const API_URL = import.meta.env.VITE_API_URL;

/*
Orquestador de Agenda (CANÓNICO)
- Maneja contexto
- Decide cuándo cargar
- Refresca agenda tras acciones
*/

export default function AgendaPage({
  forcedDate,
  onProfessionalsLoaded
}) {
  // =========================
  // CONTEXTO
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

  // 🔑 CLAVE: disparador de recarga
  const [reloadKey, setReloadKey] = useState(0);

  // =========================
  // SI CAMBIA forcedDate → actualizar date
  // =========================
  useEffect(() => {
    if (forcedDate) {
      setDate(forcedDate);
    }
  }, [forcedDate]);

  // =========================
  // CARGAR PROFESIONALES (REAL)
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadProfessionals() {
      try {
        const res = await fetch(`${API_URL}/agenda/professionals`);

        if (!res.ok) return;

        const data = await res.json();

        if (!cancelled) {
          setProfessionals(data);

          // 🔥 PASAR LISTA AL DASHBOARD
          onProfessionalsLoaded?.(data);
        }
      } catch {
        // silencio
      }
    }

    loadProfessionals();

    return () => {
      cancelled = true;
    };
  }, []);

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
  }, [date, box, professionals, reloadKey]);

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
