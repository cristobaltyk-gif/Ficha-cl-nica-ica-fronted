import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import HomeSecretaria from "../pages/home/HomeSecretaria";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaDayController from "../components/agenda/AgendaDayController";

const API_URL = import.meta.env.VITE_API_URL;

/*
SecretariaCerebro — PRODUCCIÓN REAL

✔ Cerebro único del rol secretaria
✔ SOLO navegación
✔ NO pinta UI
✔ NO botones
✔ NO sidebar
✔ HOME primero
*/

export default function SecretariaCerebro() {
  const navigate = useNavigate();

  // =========================
  // ESTADO
  // =========================
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  // { professional, date }

  // =========================
  // CARGA PROFESIONALES
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadProfessionals() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/professionals`);
        if (!res.ok) throw new Error("professionals");

        const data = await res.json();
        if (!cancelled) {
          setProfessionals(
            data.map((p) => ({ id: p.id, name: p.name }))
          );
        }
      } catch {
        if (!cancelled) setProfessionals([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfessionals();
    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // HANDLER AGENDA SUMMARY
  // =========================
  function handleSelectDay(payload) {
    setSelectedDay(payload);
    navigate("agenda/dia");
  }

  // =========================
  // HANDLERS CONTRATO (NAV)
  // =========================

  // 👉 En el futuro: slot disponible → formulario paciente
  function handleAttend(slot) {
    navigate("/pacientes/nuevo", {
      state: {
        slot,
        date: selectedDay?.date,
        professional: selectedDay?.professional
      }
    });
  }

  function handleNoShow(slot) {
    navigate("/pacientes/no-show", {
      state: {
        slot,
        date: selectedDay?.date,
        professional: selectedDay?.professional
      }
    });
  }

  function handleCancelFinal(slot) {
    // Solo navegación post-cancel (si se requiere)
    navigate("agenda");
  }

  // =========================
  // RENDER (SOLO ROUTER)
  // =========================
  return (
    <Routes>
      {/* HOME — ÚNICO DEFAULT */}
      <Route index element={<HomeSecretaria />} />

      {/* AGENDA SUMMARY */}
      <Route
        path="agenda"
        element={
          loading ? (
            <div className="agenda-placeholder">
              Cargando agenda…
            </div>
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
              role="SECRETARIA"
              onAttend={handleAttend}
              onNoShow={handleNoShow}
              onCancelFinal={handleCancelFinal}
            />
          ) : (
            <div className="agenda-placeholder">
              Selecciona un día
            </div>
          )
        }
      />

      {/* PACIENTES */}
      <Route
        path="pacientes"
        element={<div>Pacientes (pendiente)</div>}
      />
    </Routes>
  );
}
