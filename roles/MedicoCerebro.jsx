import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import HomeMedico from "../pages/home/HomeMedico";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaDayController from "../components/agenda/AgendaDayController";
import AgendaSlotModalMedico from "../components/agenda/AgendaSlotModalMedico";
import MedicoAtencionCerebro from "./AtencionClinicaCerebro.jsx";
import BusquedaCerebroPaciente from "./BusquedaCerebroPaciente.jsx";
import InformesCerebroMedico from "./InformesCerebroMedico.jsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function MedicoCerebro() {
  const { professional } = useAuth();
  const navigate = useNavigate();

  const [professionals,   setProfessionals]   = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [selectedDay,     setSelectedDay]     = useState(() => {
    const saved = sessionStorage.getItem("medico_selected_day");
    return saved ? JSON.parse(saved) : null;
  });
  const [agendaReloadKey, setAgendaReloadKey] = useState(0);
  const [modalOpen,       setModalOpen]       = useState(false);
  const [modalSlot,       setModalSlot]       = useState(null);

  if (!professional) {
    return <div className="agenda-placeholder">Médico sin profesional asignado</div>;
  }

  useEffect(() => {
    let cancelled = false;
    async function loadProfessional() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/professionals`);
        if (!res.ok) throw new Error("professionals");
        const data = await res.json();
        const prof = data.find(p => p.id === professional);
        if (!cancelled && prof) setProfessionals([{ id: prof.id, name: prof.name }]);
      } catch {
        if (!cancelled) setProfessionals([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadProfessional();
    return () => { cancelled = true; };
  }, [professional]);

  function handleSelectDay(payload) {
    setSelectedDay(payload);
    sessionStorage.setItem("medico_selected_day", JSON.stringify(payload));
    navigate("agenda/dia");
  }

  function handleAttend(slot) {
    setModalSlot(slot);
    setModalOpen(true);
  }

  async function cancelSlot(slot) {
    if (!slot) return;
    const { date, time, professional } = slot;
    try {
      await fetch(`${API_URL}/agenda/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, professional })
      });
      setAgendaReloadKey(k => k + 1);
    } catch {}
  }

  return (
    <>
      <Routes>

        <Route index element={<HomeMedico />} />

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

        <Route
          path="agenda/dia"
          element={
            selectedDay ? (
              <AgendaDayController
                key={agendaReloadKey}
                professional={selectedDay.professional}
                date={selectedDay.date}
                role="MEDICO"
                onAttend={handleAttend}
              />
            ) : (
              <div className="agenda-placeholder">Selecciona un día</div>
            )
          }
        />

        <Route
          path="agenda/dia/atencion"
          element={<MedicoAtencionCerebro />}
        />

        <Route
          path="informes"
          element={<InformesCerebroMedico />}
        />

        <Route
          path="pacientes"
          element={<BusquedaCerebroPaciente />}
        />

      </Routes>

      <AgendaSlotModalMedico
        open={modalOpen}
        slot={modalSlot}
        onClose={() => { setModalOpen(false); setModalSlot(null); }}
        onAttend={(slot) => {
          setModalOpen(false);
          setModalSlot(null);
          navigate("agenda/dia/atencion", {
            state: {
              rut:          slot.patient?.rut || slot.rut,
              date:         selectedDay.date,
              time:         slot.time,
              professional: selectedDay.professional,
              origin:       "agenda"
            }
          });
        }}
        onNoShow={() => { setModalOpen(false); setModalSlot(null); }}
        onCancel={() => {
          cancelSlot(modalSlot);
          setModalOpen(false);
          setModalSlot(null);
        }}
      />
    </>
  );
}
