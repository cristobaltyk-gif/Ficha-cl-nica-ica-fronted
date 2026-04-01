import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import HomeKinesiologia from "../pages/home/HomeKinesiologia";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaDayController from "../components/agenda/AgendaDayController";
import AgendaSlotModalMedico from "../components/agenda/AgendaSlotModalMedico";
import AtencionKineCerebro from "./AtencionKineCerebro.jsx";
import BusquedaCerebroPaciente from "./BusquedaCerebroPaciente.jsx";
import ConfiguracionMedico from "./ConfiguracionMedico.jsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function KineCerebro() {
  const { professional } = useAuth();
  const navigate = useNavigate();

  const [professionals, setProfessionals] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedDay,   setSelectedDay]   = useState(() => {
    const saved = sessionStorage.getItem("kine_selected_day");
    return saved ? JSON.parse(saved) : null;
  });
  const [agendaReloadKey, setAgendaReloadKey] = useState(0);
  const [modalOpen,       setModalOpen]       = useState(false);
  const [modalSlot,       setModalSlot]       = useState(null);

  if (!professional) {
    return <div className="agenda-placeholder">Kinesiólogo sin profesional asignado</div>;
  }

  useEffect(() => {
    let cancelled = false;
    async function loadProfessional() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/professionals`);
        if (!res.ok) throw new Error();
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
    sessionStorage.setItem("kine_selected_day", JSON.stringify(payload));
    navigate("agenda/dia");
  }

  function handleAttend(slot) {
    setModalSlot(slot);
    setModalOpen(true);
  }

  async function cancelSlot(slot) {
    if (!slot) return;
    try {
      await fetch(`${API_URL}/agenda/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: slot.date, time: slot.time, professional: slot.professional })
      });
      setAgendaReloadKey(k => k + 1);
    } catch {}
  }

  return (
    <>
      <Routes>
        <Route index element={<HomeKinesiologia />} />

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
          element={<AtencionKineCerebro />}
        />

        <Route path="pacientes"     element={<BusquedaCerebroPaciente />} />
        <Route path="configuracion" element={<ConfiguracionMedico />} />

        <Route
          path="informes"
          element={<div className="agenda-placeholder">Informes kinésicos — próximamente</div>}
        />
        <Route
          path="informes-kine"
          element={<div className="agenda-placeholder">Informes kinésicos — próximamente</div>}
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
