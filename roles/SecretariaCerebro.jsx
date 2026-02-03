import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import HomeSecretaria from "../pages/home/HomeSecretaria";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaDayController from "../components/agenda/AgendaDayController";
import PatientForm from "../components/patient/PatientForm";
import AgendaSlotModalSecretaria from "../components/agenda/AgendaSlotModalSecretaria";

const API_URL = import.meta.env.VITE_API_URL;

/*
SecretariaCerebro — PRODUCCIÓN REAL

✔ Cerebro único del rol secretaria
✔ SOLO navegación
✔ NO pinta UI
✔ NO botones
✔ NO sidebar
✔ HOME primero
*/

export default function SecretariaCerebro() {
  const navigate = useNavigate();

  // =========================
  // ESTADO
  // =========================
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  // MODAL AGENDA
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSlot, setModalSlot] = useState(null);

  // MODAL PACIENTE
  const [patientOpen, setPatientOpen] = useState(false);

  // 🔑 SLOT DISPONIBLE PENDIENTE DE RESERVA
  const [pendingSlot, setPendingSlot] = useState(null);
 
  // 🔄 fuerza recarga de AgendaDayController
const [agendaReloadKey, setAgendaReloadKey] = useState(0);

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
        if (!cancelled) {
          setProfessionals(
            data.map((p) => ({ id: p.id, name: p.name }))
          );
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
  // AGENDA SUMMARY
  // =========================
  function handleSelectDay(payload) {
    setSelectedDay(payload);
    navigate("agenda/dia");
  }

  // =========================
  // SLOT CLICK (DECISIÓN FINAL)
  // =========================
  function handleAttend(slot) {
    // ✅ DISPONIBLE → FORMULARIO PACIENTE
    if (slot.status === "available") {
      setPendingSlot(slot);      // 👈 CLAVE
      setPatientOpen(true);
      return;
    }

    // ❌ NO TOCAR ESTE FLUJO
    setModalSlot(slot);
    setModalOpen(true);
  }

  // =========================
  // RESERVA REAL (AGENDA)
  // =========================
  async function reserveSlot(rut) {
    if (!pendingSlot) return;

    const { date, time, professional } = pendingSlot;

    try {
      await fetch(`${API_URL}/agenda/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          date,
          time,
          professional,
          rut
        })
      });
      setAgendaReloadKey(k => k + 1);
    } catch {
      // backend decide errores
    } finally {
      setPendingSlot(null);
    }
  }

  // =========================
  // RENDER
  // =========================
  return (
    <>
      <Routes>

        {/* HOME */}
        <Route index element={<HomeSecretaria />} />

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
                role="SECRETARIA"
                onAttend={handleAttend}
              />
            ) : (
              <div className="agenda-placeholder">
                Selecciona un día
              </div>
            )
          }
        />

      </Routes>

      {/* MODAL PACIENTE */}
      <PatientForm
        open={patientOpen}
        onConfirm={(patient) => {
          reserveSlot(patient.rut);
          setPatientOpen(false);
        }}
        onCreate={(patient) => {
          reserveSlot(patient.rut);
          setPatientOpen(false);
        }}
        onCancel={() => {
          setPendingSlot(null);
          setPatientOpen(false);
        }}
      />

      {/* MODAL SECRETARIA — AGENDA (INTOCABLE) */}
      <AgendaSlotModalSecretaria
        open={modalOpen}
        slot={modalSlot}
        onClose={() => {
          setModalOpen(false);
          setModalSlot(null);
        }}
        onReserve={() => {
          setModalOpen(false);
          setModalSlot(null);
        }}
        onConfirm={() => {
          setModalOpen(false);
          setModalSlot(null);
        }}
        onCancel={() => {
          setModalOpen(false);
          setModalSlot(null);
        }}
        onReschedule={() => {
          setModalOpen(false);
          setModalSlot(null);
        }}
      />
    </>
  );
}
