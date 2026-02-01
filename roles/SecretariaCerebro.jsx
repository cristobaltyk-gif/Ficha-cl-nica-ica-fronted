import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaPage from "../pages/AgendaPage";

import "../styles/layout/secretaria.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
SecretariaCerebro — PRODUCCIÓN REAL (CORREGIDO)

✔ Cerebro único del rol secretaria
✔ Orquesta datos
✔ Llama backend
✔ Entrega datos a módulos
✔ NO lógica visual
✔ NO lógica clínica
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

        // 🔑 TRANSFORMACIÓN CANÓNICA PARA AgendaSummary
        const mapped = data.map((p) => ({
          id: p.id,
          name: p.name
        }));

        if (!cancelled) {
          setProfessionals(mapped);
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
  // HANDLERS
  // =========================
  function handleSelectDay(payload) {
    // payload = { professional, date }
    setSelectedDay(payload);
    navigate("agenda/dia");
  }

  function goAgenda() {
    navigate("agenda");
  }

  function goPacientes() {
    navigate("pacientes");
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="secretaria-layout">

      {/* SIDEBAR */}
      <aside className="secretaria-sidebar">
        <h2>Secretaría</h2>
        <button onClick={goAgenda}>Agenda</button>
        <button onClick={goPacientes}>Pacientes</button>
      </aside>

      {/* CONTENIDO */}
      <main className="secretaria-content">
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
                <AgendaSummary
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

          {/* PACIENTES */}
          <Route
            path="pacientes"
            element={<div>Pacientes (pendiente)</div>}
          />

        </Routes>
      </main>
    </div>
  );
}
