import { useEffect, useState } from "react";
import PublicBooking from "../pages/reservas/PublicBooking";
import AgendaDayController from "../components/agenda/AgendaDayController";

const API = import.meta.env.VITE_API_URL;

/*
BookingCerebro — ICA REAL

✔ Usa /professionals
✔ Usa AgendaDayController (NO duplica agenda)
✔ professional = ID puro
✔ SOLO permite seleccionar "available"
✔ Backend decide todo
✔ Toda la lógica está aquí (cerebro)
*/

export default function BookingCerebro() {

  /* ===============================
     ESTADOS
  =============================== */

  const [professionals, setProfessionals] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [selectedTime, setSelectedTime] = useState("");

  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ===============================
     LOAD PROFESSIONALS
     MISMO ENDPOINT QUE SECRETARIA
  =============================== */

  useEffect(() => {
    let cancelled = false;

    async function loadProfessionals() {
      try {
        const res = await fetch(`${API}/professionals`);
        if (!res.ok) throw new Error();

        const data = await res.json();

        if (!cancelled) {
          const mapped = (data || []).map((p) => ({
            id: p.id,
            name: p.name,
            specialty: p.specialty
          }));

          setProfessionals(mapped);

          const unique = [
            ...new Set(mapped.map((p) => p.specialty).filter(Boolean))
          ];

          setSpecialties(unique);
        }
      } catch {
        if (!cancelled) {
          setProfessionals([]);
          setSpecialties([]);
        }
      }
    }

    loadProfessionals();
    return () => { cancelled = true; };

  }, []);

  /* ===============================
     RESERVA (MISMO PAYLOAD SECRETARIA)
  =============================== */

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

      setSelectedTime("");
      setNombre("");
      setRut("");
      setTelefono("");
      setEmail("");

    } catch {
      setMessage("La hora ya no está disponible.");
    } finally {
      setLoading(false);
    }
  }

  /* ===============================
     FILTRO PROFESIONALES
  =============================== */

  const filteredProfessionals = selectedSpecialty
    ? professionals.filter((p) => p.specialty === selectedSpecialty)
    : professionals;

  /* ===============================
     MANEJO SLOT (LÓGICA DEL CEREBRO)
  =============================== */

  function handleSlotClick(slot) {
    // 🔒 SOLO DISPONIBLES
    if (slot.status !== "available") return;

    setSelectedTime(slot.time);
    setMessage("");
  }

  /* ===============================
     RENDER
  =============================== */

  return (
    <>
      <PublicBooking
        professionals={filteredProfessionals}
        specialties={specialties}

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

      {/* AGENDA REAL */}
      {selectedProfessional && selectedDate && (
        <AgendaDayController
          professional={selectedProfessional}
          date={selectedDate}
          role="PUBLIC"
          onAttend={handleSlotClick}
        />
      )}
    </>
  );
}
