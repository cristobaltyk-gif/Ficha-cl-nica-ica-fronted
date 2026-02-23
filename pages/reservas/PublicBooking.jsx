import "../../styles/reservas/public-booking.css";

/*
PublicBooking — PRODUCCIÓN REAL (ICA)

✔ UI pura
✔ Sin fetch
✔ Sin lógica
✔ Cerebro Booking controla todo
✔ Lista para escalar (pagos / IA / validaciones)
*/

export default function PublicBooking({

  /* ===============================
     DATOS
  =============================== */
  professionals,
  specialties,
  slots,

  selectedSpecialty,
  selectedProfessional,
  selectedDate,
  selectedTime,

  nombre,
  rut,
  telefono,
  email,

  message,
  loading,

  /* ===============================
     HANDLERS
  =============================== */
  onSelectSpecialty,
  onSelectProfessional,
  onSelectDate,
  onSelectTime,

  onChangeNombre,
  onChangeRut,
  onChangeTelefono,
  onChangeEmail,

  onConfirm
}) {
  return (
    <div className="booking booking-public">

      {/* ===============================
          HEADER
      =============================== */}
      <header className="booking-header">
        <h1>Reserva tu hora online</h1>
      </header>

      {/* ===============================
          FILTROS
      =============================== */}
      <section className="booking-filters">

        <div className="booking-field">
          <label>Especialidad</label>
          <select
            value={selectedSpecialty}
            onChange={(e) => onSelectSpecialty(e.target.value)}
          >
            <option value="">Seleccionar</option>
            {specialties.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="booking-field">
          <label>Profesional</label>
          <select
            value={selectedProfessional}
            onChange={(e) => onSelectProfessional(e.target.value)}
          >
            <option value="">Seleccionar</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} – {p.specialty}
              </option>
            ))}
          </select>
        </div>

        <div className="booking-field">
          <label>Fecha</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onSelectDate(e.target.value)}
          />
        </div>

      </section>

      {/* ===============================
          HORAS DISPONIBLES
      =============================== */}
      <section className="booking-slots">

        {slots.map((slot) => (
          <button
            key={slot.time}
            className={
              selectedTime === slot.time
                ? "slot-button selected"
                : "slot-button"
            }
            onClick={() => onSelectTime(slot.time)}
          >
            {slot.time}
          </button>
        ))}

      </section>

      {/* ===============================
          FORMULARIO PACIENTE
      =============================== */}
      {selectedTime && (
        <section className="booking-form">

          <h3>Datos del paciente</h3>

          <input
            value={nombre}
            onChange={(e) => onChangeNombre(e.target.value)}
            placeholder="Nombre completo"
          />

          <input
            value={rut}
            onChange={(e) => onChangeRut(e.target.value)}
            placeholder="RUT"
          />

          <input
            value={telefono}
            onChange={(e) => onChangeTelefono(e.target.value)}
            placeholder="Teléfono"
          />

          <input
            value={email}
            onChange={(e) => onChangeEmail(e.target.value)}
            placeholder="Email"
          />

          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Reservando..." : "Confirmar Reserva"}
          </button>

        </section>
      )}

      {message && (
        <div className="booking-message">
          {message}
        </div>
      )}

      {/* ===============================
          IA
      =============================== */}
      <section className="booking-ia">
        <h3>¿Necesitas ayuda con la reserva?</h3>
        <p>Podemos orientarte con nuestro Asistente Traumatológico.</p>
        <a
          href="https://www.icarticular.cl/asistente"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline"
        >
          Hablar con Asistente IA
        </a>
      </section>

    </div>
  );
}
