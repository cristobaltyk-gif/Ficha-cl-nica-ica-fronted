import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaPage from "../pages/AgendaPage";

const API_URL = import.meta.env.VITE_API_URL;

/*
MedicoCerebro — PRODUCCIÓN REAL (FINAL)

✔ Cerebro único del rol médico
✔ Un solo profesional (logueado)
✔ Usa AgendaSummarySelector (MISMO que secretaría)
✔ NO inventa componentes
✔ NO importa CSS
✔ Backend es la verdad
✔ AgendaPage siempre recibe props válidas
*/

export default function MedicoCerebro() {
  const { professional } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // =========================
  // ESTADO
  // =========================
  const [professionals, setProfessionals] = useState([]);
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
          // MISMO FORMATO QUE SECRETARIA, PERO 1 SOLO
          setProfessionals([
            {
              id: prof.id,
              name: prof.name
            }
          ]);
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
  function handleSelectDay({ professional, date }) {
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

      {/* HEADER */}
      <header className="medico-header">
        <h2>Agenda médica</h2>
        <button onClick={goAgenda}>Agenda</button>
      </header>

      {/* CONTENIDO */}
      <main className="medico-content">
        <Routes>

          {/* DEFAULT */}
          <Route index element={<Navigate to="agenda" replace />} />

          {/* =========================
              AGENDA SUMMARY
          ========================= */}
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
