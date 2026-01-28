import { useEffect, useState } from "react";
import Agenda from "../components/agenda/Agenda";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaPage FIX REAL
- Separa lista TOTAL de profesionales vs selección
- Toolbar usa TODOS
- Agenda usa SOLO seleccionados
*/

export default function AgendaPage({ forcedDate, onProfessionalsLoaded }) {
  // =========================
  // FECHA
  // =========================
  const [date, setDate] = useState(
    forcedDate || new Date().toISOString().slice(0, 10)
  );

  const [box, setBox] = useState("");

  // 🔴 separación correcta
  const [allProfessionals, setAllProfessionals] = useState([]);
  const [selectedProfessionals, setSelectedProfessionals] = useState([]);

  // =========================
  // DATA AGENDA
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
        const res = await fetch(`${API_URL}/professionals`);
        const data = await res.json();

        // ✅ lista completa
        setAllProfessionals(data);

        // ✅ por defecto todos seleccionados
        setSelectedProfessionals(data);

        // dashboard
        onProfessionalsLoaded?.(data);
      } catch {
        setAllProfessionals([]);
        setSelectedProfessionals([]);
        onProfessionalsLoaded?.([]);
      }
    }

    loadProfessionals();
  }, []);

  // =========================
  // AGENDA (SIEMPRE)
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

      /* 🔴 SOLO seleccionados */
      professionals={selectedProfessionals}

      agendaData={agendaData}
      onDateChange={setDate}
      onBoxChange={setBox}

      /* 🔴 Toolbar modifica SOLO selección */
      onProfessionalsChange={setSelectedProfessionals}

      onAgendaChanged={() => setReloadKey((k) => k + 1)}

      /* 🔴 Toolbar necesita la lista completa */
      allProfessionals={allProfessionals}
    />
  );
}
