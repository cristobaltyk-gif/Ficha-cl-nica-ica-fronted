import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaDayController from "../components/agenda/AgendaDayController";
import PatientForm from "../components/patient/PatientForm";

const API_URL = import.meta.env.VITE_API_URL;

/*
BookingCerebro — PRODUCCIÓN REAL (ALINEADO A SECRETARIA)

✔ Usa AgendaSummarySelector (calendario real con colores)
✔ Usa AgendaDayController (agenda real)
✔ Usa /agenda/create (mismo payload)
✔ NO reconstruye schedule
✔ NO inventa agenda paralela
✔ Solo permite reservar "available"
✔ No muestra reservados ni confirmados
✔ Pide RUT y usa PatientForm
*/

export default function BookingCerebro() {

  const navigate = useNavigate();

  // =========================
  // ESTADO
  // =========================

  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDay, setSelectedDay] = useState(null);

  const [patientOpen, setPatientOpen] = useState(false);
  const [pendingSlot, setPendingSlot] = useState(null);

  const [agendaReloadKey, setAgendaReloadKey] = useState(0);

  // =========================
  // LOAD PROFESSIONALS (IGUAL SECRETARIA)
  // =========================

  useEffect(() => {
    let cancelled = false;

    async function loadProfessionals() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/professionals`);
        if (!res.ok) throw new Error();

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
  // SELECT DAY (MISMO FLUJO)
  // =========================

  function handleSelectDay(payload) {
    setSelectedDay(payload);
    navigate("dia");
  }

  // =========================
  // SLOT CLICK (PÚBLICO)
  // =========================

  function handleAttend(slot) {

    // 🔒 Público solo puede tomar available
    if (slot.status !== "available") {
      return;
    }

    setPendingSlot(slot);
    setPatientOpen(true);
  }

  // =========================
  // RESERVA REAL (MISMO PAYLOAD SECRETARIA)
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

      // 🔄 recargar agenda
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

        {/* CALENDARIO (MISMO COMPONENTE QUE SECRETARIA) */}
        <Route
          index
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
          path="dia"
          element={
            selectedDay ? (
              <AgendaDayController
                key={agendaReloadKey}
                professional={selectedDay.professional}
                date={selectedDay.date}
                role="PUBLIC"
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

      {/* FORMULARIO PACIENTE */}
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
    </>
  );
}
