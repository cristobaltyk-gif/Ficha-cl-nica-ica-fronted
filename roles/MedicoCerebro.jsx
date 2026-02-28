import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import HomeMedico from "../pages/home/HomeMedico";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaDayController from "../components/agenda/AgendaDayController";
import AgendaSlotModalMedico from "../components/agenda/AgendaSlotModalMedico";
import MedicoAtencionCerebro from "./AtencionClinicaCerebro.jsx";
import BusquedaCerebroPaciente from "./BusquedaCerebroPaciente.jsx";

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
✔ AgendaDayController SOLO emite eventos
*/

export default function MedicoCerebro() {
  const { professional } = useAuth();
  const navigate = useNavigate();

  // =========================
  // ESTADO
  // =========================
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(() => {
  const saved = sessionStorage.getItem("medico_selected_day");
  return saved ? JSON.parse(saved) : null;
});
  const [agendaReloadKey, setAgendaReloadKey] = useState(0);
 
  // MODAL MÉDICO (IGUAL A SECRETARÍA)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSlot, setModalSlot] = useState(null);

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
        const prof = data.find(p => p.id === professional);

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
  // AGENDA SUMMARY
  // =========================
  function handleSelectDay(payload) {
  setSelectedDay(payload);
  sessionStorage.setItem("medico_selected_day", JSON.stringify(payload));
  navigate("agenda/dia");
  }

  // =========================
  // SLOT CLICK (EVENTO PURO)
  // =========================
  function handleAttend(slot) {
    // AgendaDayController SOLO avisa
    setModalSlot(slot);
    setModalOpen(true);
  }
async function cancelSlot(slot) {
  if (!slot) return;

  const { date, time, professional } = slot;

  try {
    await fetch(`${API_URL}/agenda/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        date,
        time,
        professional
      })
    });

    // 🔄 refrescar agenda diaria
    setAgendaReloadKey(k => k + 1);

  } catch {
    // backend decide errores
  }
}
  // =========================
  // RENDER
  // =========================
  return (
    <>
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
  key={agendaReloadKey}
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
        <Route
  path="agenda/dia/atencion"
  element={<MedicoAtencionCerebro />}
/>

        {/* 📝 INFORMES */}
        <Route
          path="informes"
          element={<BusquedaCerebroPaciente />}
        />
        <Route
          path="pacientes"
          element={<BusquedaCerebroPaciente />}
        />
      </Routes>

      
      {/* MODAL MÉDICO — DECIDE EL CEREBRO */}
      <AgendaSlotModalMedico
        open={modalOpen}
        slot={modalSlot}
        onClose={() => {
          setModalOpen(false);
          setModalSlot(null);
        }}

        onAttend={(slot) => {
          setModalOpen(false);
          setModalSlot(null);

          navigate("agenda/dia/atencion", {
            state: {
              rut: slot.patient?.rut || slot.rut,
              date: selectedDay.date,
              time: slot.time,
              professional: selectedDay.professional
            }
          });
        }}

        onNoShow={() => {
          setModalOpen(false);
          setModalSlot(null);
        }}

      onCancel={() => {
  cancelSlot(modalSlot);
  setModalOpen(false);
  setModalSlot(null);
}}  
      />
    </>
  );
}
