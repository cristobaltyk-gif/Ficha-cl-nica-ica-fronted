import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import HomeSecretaria from "../pages/home/HomeSecretaria";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaDayController from "../components/agenda/AgendaDayController";
import PatientForm from "../components/patient/PatientForm";

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
  // AGENDA SUMMARY
  // =========================
  function handleSelectDay(payload) {
    setSelectedDay(payload);
    navigate("agenda/dia");
  }

  // =========================
  // SLOT CLICK (DECISIÓN FINAL)
  // =========================
  function handleAttend(slot) {
    // ✅ DISPONIBLE → PatientForm
    if (slot.status === "available") {
      navigate("pacientes", { state: slot });
    }
    // ❌ reserved / confirmed → NO navega
  }

  // =========================
  // RENDER
  // =========================
  return (
    <Routes>

      {/* HOME */}
      <Route index element={<HomeSecretaria />} />

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
              role="SECRETARIA"
              onAttend={handleAttend}
            />
          ) : (
            <div className="agenda-placeholder">
              Selecciona un día
            </div>
          )
        }
      />

      {/* PATIENT FORM (SOLO DISPONIBLE) */}
      <Route
        path="pacientes"
        element={
          <PatientForm
            onSubmit={() => navigate("agenda")}
            onCancel={() => navigate("agenda")}
          />
        }
      />

    </Routes>
  );
}
