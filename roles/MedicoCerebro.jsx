import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import HomeMedico from "../pages/home/HomeMedico";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaDayController from "../components/agenda/AgendaDayController";

const API_URL = import.meta.env.VITE_API_URL;

/*
MedicoCerebro — PRODUCCIÓN REAL (CANÓNICO)

✔ Cerebro único del rol médico
✔ SOLO navegación
✔ NO pinta UI
✔ NO header
✔ NO botones
✔ NO sidebar
✔ HOME primero
✔ 1 profesional automático
✔ MISMO AgendaSummarySelector que secretaría
*/

export default function MedicoCerebro() {
  const { professional } = useAuth();
  const navigate = useNavigate();

  // =========================
  // ESTADO
  // =========================
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  // { professional, date }

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
  // CARGA PROFESIONAL ÚNICO
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadProfessional() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/professionals`);
        if (!res.ok) throw new Error("professionals");

        const data = await res.json();
        const prof = data.find((p) => p.id === professional);

        if (!cancelled && prof) {
          setProfessionals([{ id: prof.id, name: prof.name }]);
        }
      } catch {
        if (!cancelled) setProfessionals([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfessional();
    return () => {
      cancelled = true;
    };
  }, [professional]);

  // =========================
  // HANDLERS
  // =========================
  function handleSelectDay(payload) {
    setSelectedDay(payload);
    navigate("agenda/dia");
  }

  function handleAttend(slot) {
    // DISPONIBLE → médico no hace nada
    if (slot.status === "available") return;

    // RESERVADO / CONFIRMADO → ATENCIÓN
    navigate("/medico/atencion", {
      state: {
        rut: slot.rut,
        date: selectedDay.date,
        time: slot.time,
        professional: selectedDay.professional
      }
    });
  }

  // =========================
  // RENDER (SOLO ROUTER)
  // =========================
  return (
    <Routes>

      {/* HOME */}
      <Route index element={<HomeMedico />} />

      {/* AGENDA SUMMARY */}
      <Route
        path="agenda"
        element={
          loading ? (
            <div className="agenda-placeholder">Cargando agenda…</div>
          ) : (
            <AgendaSummarySelector
              professionals={professionals}
              onSelectDay={handleSelectDay}
            />
          )
        }
      />

      {/* AGENDA DIARIA */}
      <Route
        path="agenda/dia"
        element={
          selectedDay ? (
            <AgendaDayController
              professional={selectedDay.professional}
              date={selectedDay.date}
              role="MEDICO"
              onAttend={handleAttend}
            />
          ) : (
            <div className="agenda-placeholder">
              Selecciona un día
            </div>
          )
        }
      />

    </Routes>
  );
}
