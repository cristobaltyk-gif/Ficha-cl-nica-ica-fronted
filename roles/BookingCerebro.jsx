import { useEffect, useState } from "react";
import PublicBooking from "../pages/reservas/PublicBooking";

const API = import.meta.env.VITE_API_URL;

/*
BookingCerebro — ICA REAL (ALINEADO A SECRETARIA)

✔ Usa /professionals
✔ Usa /agenda
✔ Usa /agenda/create
✔ Filtra SOLO "available"
✔ NO muestra ocupados
✔ NO muestra nombres
✔ Backend decide todo
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
  const [slots, setSlots] = useState([]);

  const [selectedTime, setSelectedTime] = useState("");

  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ===============================
     CARGAR PROFESIONALES
  =============================== */

  useEffect(() => {
    async function loadProfessionals() {
      try {
        const res = await fetch(`${API}/professionals`);
        if (!res.ok) throw new Error();

        const data = await res.json();

        setProfessionals(data || []);

        const uniqueSpecialties = [
          ...new Set((data || []).map(p => p.specialty))
        ];

        setSpecialties(uniqueSpecialties);

      } catch {
        setProfessionals([]);
      }
    }

    loadProfessionals();
  }, []);

  /* ===============================
     CARGAR AGENDA (SOLO AVAILABLE)
  =============================== */

  useEffect(() => {
    if (!selectedProfessional || !selectedDate) return;

    async function loadAgenda() {
      try {
        const res = await fetch(
          `${API}/agenda?professional=${selectedProfessional}&date=${selectedDate}`
        );

        if (!res.ok) throw new Error();

        const data = await res.json();

        // 👇 MISMO STATUS QUE SECRETARIA
        const disponibles = (data || []).filter(
          slot => slot.status === "available"
        );

        setSlots(disponibles);

      } catch {
        setSlots([]);
      }
    }

    loadAgenda();
  }, [selectedProfessional, selectedDate]);

  /* ===============================
     CONFIRMAR RESERVA (MISMO ENDPOINT QUE SECRETARIA)
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          professional: selectedProfessional,
          rut
        })
      });

      if (!res.ok) {
        throw new Error();
      }

      setMessage("Reserva confirmada correctamente.");

      // limpiar
      setSelectedTime("");
      setNombre("");
      setRut("");
      setTelefono("");
      setEmail("");

      // refrescar agenda
      const refresh = await fetch(
        `${API}/agenda?professional=${selectedProfessional}&date=${selectedDate}`
      );

      const updated = await refresh.json();

      const disponibles = (updated || []).filter(
        slot => slot.status === "available"
      );

      setSlots(disponibles);

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
    ? professionals.filter(p => p.specialty === selectedSpecialty)
    : professionals;

  /* ===============================
     RENDER
  =============================== */

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
