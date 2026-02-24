import { useEffect, useState } from "react";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaDayController from "../components/agenda/AgendaDayController";
import PatientForm from "../components/patient/PatientForm";

const API_URL = import.meta.env.VITE_API_URL;

/*
BookingCerebro — SUBDOMINIO RESERVAS (SIN ROUTER)

✔ No usa BrowserRouter
✔ No usa Routes
✔ No usa navigate
✔ Mismo flujo que Secretaria
✔ Solo oculta reservados/confirmados
*/

export default function BookingCerebro() {

  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDay, setSelectedDay] = useState(null);

  const [patientOpen, setPatientOpen] = useState(false);
  const [pendingSlot, setPendingSlot] = useState(null);

  const [agendaReloadKey, setAgendaReloadKey] = useState(0);

  // =========================
  // LOAD PROFESSIONALS
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
    return () => { cancelled = true; };
  }, []);

  // =========================
  // SLOT CLICK (PUBLIC)
  // =========================

  function handleAttend(slot) {
    if (slot.status !== "available") return;
    setPendingSlot(slot);
    setPatientOpen(true);
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
        body: JSON.stringify({
          date,
          time,
          professional,
          rut
        })
      });

      setAgendaReloadKey(k => k + 1);

    } catch {}

    setPendingSlot(null);
  }

  // =========================
  // RENDER SIMPLE
  // =========================

  if (!selectedDay) {
    return loading ? (
      <div className="agenda-placeholder">Cargando agenda…</div>
    ) : (
      <AgendaSummarySelector
        professionals={professionals}
        onSelectDay={setSelectedDay}
      />
    );
  }

  return (
    <>
      <AgendaDayController
        key={agendaReloadKey}
        professional={selectedDay.professional}
        date={selectedDay.date}
        role="PUBLIC"
        onAttend={handleAttend}
      />

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
