import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import HomeSecretaria from "../pages/home/HomeSecretaria";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaDayController from "../components/agenda/AgendaDayController";
import PatientForm from "../components/patient/PatientForm";
import AgendaSlotModalSecretaria from "../components/agenda/AgendaSlotModalSecretaria";
import PagoModal from "../components/caja/PagoModal";

const API_URL = import.meta.env.VITE_API_URL;

export default function SecretariaCerebro() {
  const navigate = useNavigate();

  const [professionals,   setProfessionals]   = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [selectedDay,     setSelectedDay]     = useState(null);
  const [modalOpen,       setModalOpen]       = useState(false);
  const [modalSlot,       setModalSlot]       = useState(null);
  const [patientOpen,     setPatientOpen]     = useState(false);
  const [pendingSlot,     setPendingSlot]     = useState(null);
  const [agendaReloadKey, setAgendaReloadKey] = useState(0);
  const [pagoOpen,        setPagoOpen]        = useState(false);
  const [pagoSlot,        setPagoSlot]        = useState(null);

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
        if (!cancelled) setProfessionals(data.map(p => ({ id: p.id, name: p.name })));
      } catch {
        if (!cancelled) setProfessionals([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadProfessionals();
    return () => { cancelled = true; };
  }, []);

  // =========================
  // AGENDA SUMMARY
  // =========================
  function handleSelectDay(payload) {
    setSelectedDay(payload);
    navigate("agenda/dia");
  }

  // =========================
  // SLOT CLICK
  // =========================
  function handleAttend(slot) {
    if (slot.status === "available") {
      setPendingSlot(slot);
      setPatientOpen(true);
      return;
    }
    setModalSlot(slot);
    setModalOpen(true);
  }

  // =========================
  // CONFIRMAR LLEGADA → abre PagoModal
  // =========================
  function handleConfirmarLlegada() {
    setPagoSlot(modalSlot);
    setPagoOpen(true);
  }

  // =========================
  // RESERVA
  // =========================
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

  // =========================
  // ANULAR
  // =========================
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
    } catch {
    }
  }

  function closeModal() {
    setModalOpen(false);
    setModalSlot(null);
  }

  // =========================
  // RENDER
  // =========================
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

      </Routes>

      {/* MODAL PACIENTE */}
      <PatientForm
        open={patientOpen}
        onConfirm={patient => { reserveSlot(patient.rut); setPatientOpen(false); }}
        onCreate={patient  => { reserveSlot(patient.rut); setPatientOpen(false); }}
        onCancel={() => { setPendingSlot(null); setPatientOpen(false); }}
      />

      {/* MODAL SECRETARIA */}
      <AgendaSlotModalSecretaria
        open={modalOpen}
        slot={modalSlot}
        onClose={closeModal}
        onReserve={closeModal}
        onConfirm={closeModal}
        onCancel={() => { cancelSlot(modalSlot); closeModal(); }}
        onReschedule={closeModal}
        onConfirmarLlegada={handleConfirmarLlegada}
      />

      {/* PAGO MODAL — al nivel raíz, nunca queda tapado */}
      <PagoModal
        open={pagoOpen}
        slot={pagoSlot}
        onClose={() => setPagoOpen(false)}
        onSuccess={() => {
          setPagoOpen(false);
          setAgendaReloadKey(k => k + 1);
          closeModal();
        }}
      />
    </>
  );
}
