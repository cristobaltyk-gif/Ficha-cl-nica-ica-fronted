import { useEffect, useMemo, useState } from "react";
import PublicBooking from "../pages/reservas/PublicBooking";

const API = import.meta.env.VITE_API_URL;

/*
BookingCerebro — ICA REAL (PÚBLICO)

✔ Usa /professionals
✔ Usa /agenda?date=YYYY-MM-DD  (MISMO QUE AgendaDayController REAL)
✔ Usa /agenda/create
✔ Construye slots desde schedule (igual que AgendaDayController)
✔ Overlay backendSlots desde calendar[professional].slots
✔ FILTRA SOLO "available" (cerebro decide)
✔ NO usa AuthContext (porque es público)
*/

export default function BookingCerebro() {
  // =========================
  // ESTADO
  // =========================
  const [professionals, setProfessionals] = useState([]);
  const [professionalsMap, setProfessionalsMap] = useState({});
  const [specialties, setSpecialties] = useState([]);

  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [slots, setSlots] = useState([]); // SOLO available (para PublicBooking)
  const [selectedTime, setSelectedTime] = useState("");

  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // =========================
  // HELPERS (IGUAL QUE AgendaDayController)
  // =========================
  function getWeekdayKey(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  }

  function buildSlotsFromSchedule(schedule, weekdayKey) {
    const slots = {};
    if (!schedule?.days?.[weekdayKey]) return slots;

    const interval = schedule.slotMinutes;

    schedule.days[weekdayKey].forEach(({ start, end }) => {
      let minutes =
        Number(start.split(":")[0]) * 60 + Number(start.split(":")[1]);

      const endMinutes =
        Number(end.split(":")[0]) * 60 + Number(end.split(":")[1]);

      while (minutes < endMinutes) {
        const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
        const mm = String(minutes % 60).padStart(2, "0");
        const time = `${hh}:${mm}`;

        slots[time] = {
          time,
          status: "available"
        };

        minutes += interval;
      }
    });

    return slots;
  }

  // =========================
  // LOAD PROFESSIONALS (MISMO ENDPOINT)
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadProfessionals() {
      try {
        const res = await fetch(`${API}/professionals`);
        if (!res.ok) throw new Error();

        const data = await res.json();

        if (cancelled) return;

        const mapped = (data || []).map((p) => ({
          id: p.id,
          name: p.name,
          specialty: p.specialty,
          schedule: p.schedule
        }));

        setProfessionals(mapped);

        const map = {};
        mapped.forEach((p) => (map[p.id] = p));
        setProfessionalsMap(map);

        const unique = [...new Set(mapped.map((p) => p.specialty).filter(Boolean))];
        setSpecialties(unique);
      } catch {
        if (!cancelled) {
          setProfessionals([]);
          setProfessionalsMap({});
          setSpecialties([]);
        }
      }
    }

    loadProfessionals();
    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // LOAD AGENDA (MISMO CONTRATO REAL: /agenda?date=)
  // y FILTRAR SOLO available (cerebro)
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadAgendaPublic() {
      if (!selectedProfessional || !selectedDate) return;

      const prof = professionalsMap[selectedProfessional];
      if (!prof) return;

      try {
        const res = await fetch(`${API}/agenda?date=${encodeURIComponent(selectedDate)}`);
        if (!res.ok) throw new Error();

        const data = await res.json();

        const weekdayKey = getWeekdayKey(selectedDate);

        // base schedule = available
        const baseSlots = buildSlotsFromSchedule(prof.schedule, weekdayKey);

        // overlay backend
        const backendSlots = data.calendar?.[selectedProfessional]?.slots || {};

        Object.entries(backendSlots).forEach(([time, slot]) => {
          baseSlots[time] = {
            time,
            status: slot.status,
            rut: slot.rut || null
          };
        });

        // ✅ SOLO AVAILABLE (para público)
        const disponibles = Object.entries(baseSlots)
          .filter(([, s]) => s.status === "available")
          .map(([time, s]) => ({ time, ...s }));

        if (!cancelled) setSlots(disponibles);
      } catch {
        if (!cancelled) setSlots([]);
      }
    }

    loadAgendaPublic();
    return () => {
      cancelled = true;
    };
  }, [selectedProfessional, selectedDate, professionalsMap]);

  // =========================
  // CONFIRMAR RESERVA (MISMO PAYLOAD SECRETARIA)
  // =========================
  async function handleConfirm() {
    if (!selectedTime) {
      setMessage("Debe seleccionar una hora.");
      return;
    }

    if (!rut) {
      setMessage("RUT obligatorio.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API}/agenda/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          professional: selectedProfessional,
          rut
        })
      });

      if (!res.ok) throw new Error();

      setMessage("Reserva confirmada correctamente.");

      // limpiar
      setSelectedTime("");
      setNombre("");
      setRut("");
      setTelefono("");
      setEmail("");

      // refrescar agenda pública (re-usa el effect cambiando un “tick” simple)
      // truco sin inventar estado extra: re-setea selectedDate al mismo valor
      setSelectedDate((d) => d);

    } catch {
      setMessage("La hora ya no está disponible.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // FILTRO PROFESIONALES (UI)
  // =========================
  const filteredProfessionals = useMemo(() => {
    return selectedSpecialty
      ? professionals.filter((p) => p.specialty === selectedSpecialty)
      : professionals;
  }, [professionals, selectedSpecialty]);

  // =========================
  // RENDER
  // =========================
  return (
    <PublicBooking
      professionals={filteredProfessionals}
      specialties={specialties}
      slots={slots}

      selectedSpecialty={selectedSpecialty}
      selectedProfessional={selectedProfessional}
      selectedDate={selectedDate}
      selectedTime={selectedTime}

      nombre={nombre}
      rut={rut}
      telefono={telefono}
      email={email}

      message={message}
      loading={loading}

      onSelectSpecialty={setSelectedSpecialty}
      onSelectProfessional={setSelectedProfessional}
      onSelectDate={setSelectedDate}
      onSelectTime={setSelectedTime}

      onChangeNombre={setNombre}
      onChangeRut={setRut}
      onChangeTelefono={setTelefono}
      onChangeEmail={setEmail}

      onConfirm={handleConfirm}
    />
  );
}
