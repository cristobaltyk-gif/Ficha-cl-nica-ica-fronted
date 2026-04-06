import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import HomeSecretaria from "../pages/home/HomeSecretaria";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaDayController from "../components/agenda/AgendaDayController";
import PatientForm from "../components/patient/PatientForm";
import AgendaSlotModalSecretaria from "../components/agenda/AgendaSlotModalSecretaria";
import PagoModal from "../components/caja/PagoModal";
import AnulacionModal from "../components/caja/AnulacionModal";
import CajaResumenController from "../components/caja/CajaResumenController";
import PacientesSecretaria from "./PacientesSecretaria.jsx";
import MedicosSecretaria from "./MedicosSecretaria.jsx";
import ConfiguracionSecretaria from "./ConfiguracionSecretaria.jsx";
import { useAuth } from "../auth/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function SecretariaCerebro() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [professionals,   setProfessionals]   = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [selectedDay,     setSelectedDay]     = useState(null);
  const [modalOpen,       setModalOpen]       = useState(false);
  const [modalSlot,       setModalSlot]       = useState(null);
  const [patientOpen,     setPatientOpen]     = useState(false);
  const [pendingSlot,     setPendingSlot]     = useState(null);
  const [agendaReloadKey, setAgendaReloadKey] = useState(0);
  const [pagoOpen,        setPagoOpen]        = useState(false);
  const [anulacionOpen,   setAnulacionOpen]   = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfessionals() {
      setLoading(true);
      try {
        // 1. Obtener región de la secretaria desde sedes.json
        let region = null;
        const usuario = session?.usuario;

        if (usuario) {
          try {
            const sedeRes = await fetch(`${API_URL}/geo/sedes/${usuario}`);
            if (sedeRes.ok) {
              const sedeData = await sedeRes.json();
              const regiones = sedeData?.regiones || {};
              // Tomar la primera región configurada
              const primeraRegion = Object.keys(regiones)[0];
              if (primeraRegion) region = primeraRegion;
            }
          } catch {}
        }

        // 2. Cargar profesionales filtrando por región y excluyendo IA
        const params = new URLSearchParams({ public: "true" });
        if (region) params.set("region", region);

        const res = await fetch(`${API_URL}/professionals?${params.toString()}`);
        if (!res.ok) throw new Error("professionals");
        const data = await res.json();

        if (!cancelled) {
          setProfessionals(data.map(p => ({ id: p.id, name: p.name })));
        }
      } catch {
        if (!cancelled) setProfessionals([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfessionals();
    return () => { cancelled = true; };
  }, [session]);

  function handleSelectDay(payload) {
    setSelectedDay(payload);
    navigate("agenda/dia");
  }

  function handleAttend(slot) {
    if (slot.status === "available") {
      setPendingSlot(slot);
      setPatientOpen(true);
      return;
    }
    setModalSlot(slot);
    setModalOpen(true);
  }

  async function reserveSlot(rut) {
    if (!pendingSlot) return;
    const { date, time, professional } = pendingSlot;
    try {
      await fetch(`${API_URL}/agenda/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, professional, rut })
      });
      setAgendaReloadKey(k => k + 1);
    } catch {
    } finally {
      setPendingSlot(null);
    }
  }

  async function confirmSlot() {
    if (!modalSlot) return;
    const { date, time, professional } = modalSlot;
    try {
      await fetch(`${API_URL}/agenda/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, professional })
      });
      setAgendaReloadKey(k => k + 1);
    } catch {
    } finally {
      closeModal();
    }
  }

  async function cancelAgenda(slot) {
    if (!slot) return;
    const { date, time, professional } = slot;
    try {
      await fetch(`${API_URL}/agenda/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, professional })
      });
    } catch {}
  }

  async function clearCaja(slot) {
    if (!slot) return;
    const { date, time, professional } = slot;
    try {
      await fetch(`${API_URL}/api/caja/slot`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, professional })
      });
    } catch {}
  }

  async function cancelSlot(slot) {
    await clearCaja(slot);
    await cancelAgenda(slot);
    setAgendaReloadKey(k => k + 1);
  }

  function handleCancelRequest() {
    if (modalSlot?.cajaStatus === "paid" || modalSlot?.pagado) {
      setAnulacionOpen(true);
    } else {
      cancelSlot(modalSlot);
      closeModal();
    }
  }

  function closeModal() {
    setModalOpen(false);
    setModalSlot(null);
  }

  return (
    <>
      <Routes>

        <Route index element={<HomeSecretaria />} />

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
                role="SECRETARIA"
                onAttend={handleAttend}
              />
            ) : (
              <div className="agenda-placeholder">Selecciona un día</div>
            )
          }
        />

        <Route
          path="caja"
          element={<CajaResumenController professionals={professionals} />}
        />

        <Route
          path="pacientes"
          element={<PacientesSecretaria />}
        />

        <Route
          path="medicos"
          element={<MedicosSecretaria />}
        />

        <Route
          path="administracion"
          element={<ConfiguracionSecretaria />}
        />

      </Routes>

      <PatientForm
        open={patientOpen}
        onConfirm={patient => { reserveSlot(patient.rut); setPatientOpen(false); }}
        onCreate={patient  => { reserveSlot(patient.rut); setPatientOpen(false); }}
        onCancel={() => { setPendingSlot(null); setPatientOpen(false); }}
      />

      <AgendaSlotModalSecretaria
        open={modalOpen}
        slot={modalSlot}
        onClose={closeModal}
        onConfirm={confirmSlot}
        onCancel={handleCancelRequest}
        onReschedule={closeModal}
        onConfirmarLlegada={() => setPagoOpen(true)}
      />

      <PagoModal
        open={pagoOpen}
        slot={modalSlot}
        onClose={() => setPagoOpen(false)}
        onSuccess={() => {
          setPagoOpen(false);
          setAgendaReloadKey(k => k + 1);
          closeModal();
        }}
      />

      <AnulacionModal
        open={anulacionOpen}
        slot={modalSlot}
        onClose={() => setAnulacionOpen(false)}
        onSuccess={() => {
          setAnulacionOpen(false);
          cancelSlot(modalSlot);
          closeModal();
        }}
      />
    </>
  );
}
