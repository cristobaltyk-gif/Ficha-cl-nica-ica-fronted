import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import AgendaSummaryMedico from "../components/agenda/AgendaSummaryMedico";
import AgendaPage from "../pages/AgendaPage";

import "../styles/layout/medico.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
MedicoCerebro — PRODUCCIÓN REAL (CORREGIDO)

✔ Cerebro único del rol médico
✔ Un solo profesional (logueado)
✔ La RUTA es la fuente de verdad
✔ NO depende de estado volátil
✔ AgendaPage siempre recibe props válidas
*/

export default function MedicoCerebro() {
  const { professional } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // =========================
  // ESTADO
  // =========================
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

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
  // CARGA BASE (SCHEDULE)
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

        if (!cancelled) {
          setSchedule(prof?.schedule || null);
        }
      } catch {
        if (!cancelled) setSchedule(null);
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
  function handleSelectDay({ date }) {
    navigate("agenda/dia", {
      state: {
        professional,
        date
      }
    });
  }

  function goAgenda() {
    navigate("agenda");
  }

  // =========================
  // DATOS DESDE RUTA
  // =========================
  const routeState = location.state;
  const selectedProfessional = routeState?.professional;
  const selectedDate = routeState?.date;

  // =========================
  // RENDER
  // =========================
  return (
    <div className="medico-layout">

      {/* =========================
          HEADER
      ========================= */}
      <header className="medico-header">
        <h2>Agenda médica</h2>
        <button onClick={goAgenda}>Agenda</button>
      </header>

      {/* =========================
          CONTENIDO
      ========================= */}
      <main className="medico-content">
        <Routes>

          {/* DEFAULT */}
          <Route index element={<Navigate to="agenda" replace />} />

          {/* =========================
              SUMMARY MÉDICO
          ========================= */}
          <Route
            path="agenda"
            element={
              loading ? (
                <div className="agenda-placeholder">
                  Cargando agenda…
                </div>
              ) : (
                <AgendaSummaryMedico
                  professional={professional}
                  schedule={schedule}
                  onSelectDay={handleSelectDay}
                />
              )
            }
          />

          {/* =========================
              AGENDA DIARIA
          ========================= */}
          <Route
            path="agenda/dia"
            element={
              selectedProfessional && selectedDate ? (
                <AgendaPage
                  professional={selectedProfessional}
                  date={selectedDate}
                />
              ) : (
                <Navigate to="../agenda" replace />
              )
            }
          />

        </Routes>
      </main>
    </div>
  );
}
