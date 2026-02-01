import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaPage from "../pages/AgendaPage";

const API_URL = import.meta.env.VITE_API_URL;

/*
MedicoCerebro — PRODUCCIÓN REAL (CORREGIDO)

✔ Cerebro único del rol médico
✔ Un solo profesional (logueado)
✔ Usa MISMO AgendaSummarySelector
✔ NO duplica lógica
✔ NO inventa componentes
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
          // 🔑 MISMO FORMATO QUE SECRETARIA, PERO 1 SOLO
          setProfessionals([
            { id: prof.id, name: prof.name }
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
  function handleSelectDay(payload) {
    setSelectedDay(payload);
    navigate("agenda/dia");
  }

  function goAgenda() {
    navigate("agenda");
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="medico-layout">

      <header className="medico-header">
        <h2>Agenda médica</h2>
        <button onClick={goAgenda}>Agenda</button>
      </header>

      <main className="medico-content">
        <Routes>

          {/* DEFAULT */}
          <Route index element={<Navigate to="agenda" replace />} />

          {/* =========================
              AGENDA SUMMARY (MISMO COMPONENTE)
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
              selectedDay ? (
                <AgendaPage
                  professional={selectedDay.professional}
                  date={selectedDay.date}
                />
              ) : (
                <div className="agenda-placeholder">
                  Selecciona un día
                </div>
              )
            }
          />

        </Routes>
      </main>
    </div>
  );
}
