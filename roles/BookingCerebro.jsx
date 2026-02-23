import { useEffect, useState } from "react";
import PublicBooking from "../pages/reservas/PublicBooking";

const API = import.meta.env.VITE_API_URL;

/*
BookingCerebro — ICA REAL

✔ Vive en roles
✔ Controla estado
✔ Hace fetch
✔ UI pura recibe props
✔ Sin estructura inventada
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
        const data = await res.json();

        setProfessionals(data || []);

        const uniqueSpecialties = [
          ...new Set((data || []).map(p => p.specialty))
        ];

        setSpecialties(uniqueSpecialties);

      } catch (err) {
        console.error("Error cargando profesionales", err);
      }
    }

    loadProfessionals();
  }, []);

  /* ===============================
     CARGAR AGENDA
  =============================== */

  useEffect(() => {
    if (!selectedProfessional || !selectedDate) return;

    async function loadAgenda() {
      try {
        const res = await fetch(
          `${API}/agenda?professional=${selectedProfessional}&date=${selectedDate}`
        );

        const data = await res.json();

        const disponibles = (data || []).filter(
          slot => slot.status === "disponible"
        );

        setSlots(disponibles);

      } catch (err) {
        console.error("Error cargando agenda", err);
      }
    }

    loadAgenda();
  }, [selectedProfessional, selectedDate]);

  /* ===============================
     CONFIRMAR RESERVA
  =============================== */

  async function handleConfirm() {

    if (!selectedTime) {
      setMessage("Debe seleccionar una hora.");
      return;
    }

    if (!nombre || !rut) {
      setMessage("Nombre y RUT son obligatorios.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API}/agenda/reservar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          professional: selectedProfessional,
          date: selectedDate,
          time: selectedTime,
          nombre,
          rut,
          telefono,
          email
        })
      });

      if (!res.ok) {
        throw new Error("Reserva fallida");
      }

      setMessage("Reserva confirmada correctamente.");

      // limpiar formulario
      setSelectedTime("");
      setNombre("");
      setRut("");
      setTelefono("");
      setEmail("");

      // recargar agenda
      const refresh = await fetch(
        `${API}/agenda?professional=${selectedProfessional}&date=${selectedDate}`
      );

      const updated = await refresh.json();

      const disponibles = (updated || []).filter(
        slot => slot.status === "disponible"
      );

      setSlots(disponibles);

    } catch (err) {
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
