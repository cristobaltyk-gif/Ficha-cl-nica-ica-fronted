import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaPage from "../pages/AgendaPage";

import "../styles/layout/secretaria.css";

const API_URL = import.meta.env.VITE_API_URL;

/*
SecretariaCerebro — PRODUCCIÓN REAL

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
  // ESTADO GLOBAL SECRETARIA
  // =========================
  const [professionals, setProfessionals] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  const [selectedDay, setSelectedDay] = useState(null);
  // { professional, date }

  // =========================
  // CARGA INICIAL (BACKEND)
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadBaseData() {
      setLoading(true);

      try {
        // 1️⃣ PROFESIONALES
        const profRes = await fetch(`${API_URL}/professionals`);
        if (!profRes.ok) throw new Error("professionals");
        const profData = await profRes.json();

        // 2️⃣ SCHEDULES (desde professionals.json)
        const schedulesMap = {};
        profData.forEach((p) => {
          schedulesMap[p.id] = p.schedule || null;
        });

        if (!cancelled) {
          setProfessionals(profData);
          setSchedules(schedulesMap);
        }
      } catch (e) {
        if (!cancelled) {
          setProfessionals([]);
          setSchedules({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBaseData();
    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // HANDLERS DE NAVEGACIÓN
  // =========================
  function goAgenda() {
    navigate("agenda");
  }

  function goPacientes() {
    navigate("pacientes");
  }

  // =========================
  // HANDLER SELECCIÓN DÍA
  // =========================
  function handleSelectDay(payload) {
    // payload = { professional, date }
    setSelectedDay(payload);
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="secretaria-layout">

      {/* =========================
          SIDEBAR
      ========================= */}
      <aside className="secretaria-sidebar">
        <h2>Secretaría</h2>

        <button onClick={goAgenda}>Agenda</button>
        <button onClick={goPacientes}>Pacientes</button>
      </aside>

      {/* =========================
          CONTENIDO
      ========================= */}
      <main className="secretaria-content">
        <Routes>

          {/* DEFAULT */}
          <Route index element={<Navigate to="agenda" replace />} />

          {/* =========================
              AGENDA (SUMMARY)
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
                  schedules={schedules}
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

          {/* =========================
              PACIENTES
          ========================= */}
          <Route
            path="pacientes"
            element={<div>Pacientes (pendiente)</div>}
          />

        </Routes>
      </main>
    </div>
  );
}
