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

  // 👇 MODAL SLOT (EXISTENTE)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSlot, setModalSlot] = useState(null);

  // 👇 MODAL PACIENTE (NUEVO, ÚNICO CAMBIO)
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [patientSlot, setPatientSlot] = useState(null);

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
  // SLOT CLICK (ÚNICO CAMBIO REAL)
  // =========================
  function handleAttend(slot) {
    // ✅ DISPONIBLE → PatientForm COMO MODAL
    if (slot.status === "available") {
      setPatientSlot(slot);
      setPatientModalOpen(true);
      return;
    }

    // ✅ RESERVED / CONFIRMED → MODAL SLOT (EXISTENTE)
    setModalSlot(slot);
    setModalOpen(true);
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

      {/* MODAL PACIENTE — CONTROLADO POR EL CEREBRO */}
      {patientModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <PatientForm
              onConfirm={(paciente) => {
                setPatientModalOpen(false);
                setPatientSlot(null);
              }}
              onCreate={(paciente) => {
                setPatientModalOpen(false);
                setPatientSlot(null);
              }}
              onCancel={() => {
                setPatientModalOpen(false);
                setPatientSlot(null);
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL SECRETARIA — EXISTENTE */}
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
