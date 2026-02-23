import { useEffect, useState } from "react";
import PublicBooking from "../pages/reservas/PublicBooking";

const API = import.meta.env.VITE_API_URL;

/*
BookingCerebro — ICA REAL (ALINEADO EXACTO A SECRETARIA)

✔ Usa /professionals
✔ Usa /agenda
✔ Usa /agenda/create
✔ professional = ID PURO (igual que secretaria)
✔ Filtra SOLO "available"
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
     MISMO CONTRATO QUE SECRETARIA
  =============================== */

  useEffect(() => {
    let cancelled = false;

    async function loadProfessionals() {
      try {
        const res = await fetch(`${API}/professionals`);
        if (!res.ok) throw new Error();

        const data = await res.json();

        if (!cancelled) {

          // 🔑 EXACTAMENTE COMO SECRETARIA
          const mapped = (data || []).map((p) => ({
            id: p.id,
            name: p.name,
            specialty: p.specialty
          }));

          setProfessionals(mapped);

          const uniqueSpecialties = [
            ...new Set(mapped.map(p => p.specialty).filter(Boolean))
          ];

          setSpecialties(uniqueSpecialties);
        }

      } catch {
        if (!cancelled) {
          setProfessionals([]);
          setSpecialties([]);
        }
      }
    }

    loadProfessionals();

    return () => {
      cancelled = true;
    };

  }, []);

  /* ===============================
     CARGAR AGENDA
     MISMO ENDPOINT QUE SECRETARIA
  =============================== */

  useEffect(() => {

    if (!selectedProfessional || !selectedDate) return;

    let cancelled = false;

    async function loadAgenda() {
      try {
        const res = await fetch(
          `${API}/agenda?professional=${selectedProfessional}&date=${selectedDate}`
        );

        if (!res.ok) throw new Error();

        const data = await res.json();

        if (!cancelled) {

          // 🔑 MISMO STATUS QUE SECRETARIA
          const disponibles = (data || []).filter(
            slot => slot.status === "available"
          );

          setSlots(disponibles);
        }

      } catch {
        if (!cancelled) setSlots([]);
      }
    }

    loadAgenda();

    return () => {
      cancelled = true;
    };

  }, [selectedProfessional, selectedDate]);

  /* ===============================
     CONFIRMAR RESERVA
     MISMO PAYLOAD QUE SECRETARIA
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

      await fetch(`${API}/agenda/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          professional: selectedProfessional, // 🔑 SOLO ID
          rut
        })
      });

      setMessage("Reserva confirmada correctamente.");

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
      onSelectProfessional={(id) => setSelectedProfessional(id)} // 🔑 SOLO ID
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
