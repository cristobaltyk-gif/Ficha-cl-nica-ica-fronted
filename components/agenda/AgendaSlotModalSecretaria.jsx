import "../../styles/agenda/agenda-slot-modal.css";
import { useState, useEffect } from "react";
import PatientForm from "../patient/PatientForm";
import PagoModal from "../caja/PagoModal";

const TIPOS = [
  { value: "particular",       label: "Particular",        monto: 35000 },
  { value: "control_costo",    label: "Control con costo", monto: 15000 },
  { value: "control_gratuito", label: "Control gratuito",  monto: 0     },
  { value: "sobrecupo",        label: "Sobrecupo",         monto: 20000 },
  { value: "cortesia",         label: "Cortesía",          monto: 0     },
  { value: "kinesiologia",     label: "Kinesiología",      monto: 25000 },
];

export default function AgendaSlotModalSecretaria({
  open,
  slot,
  loading = false,

  onClose,
  onReserve,
  onConfirm,
  onCancel,
  onReschedule,
  onCajaUpdate
}) {
  const [mode,       setMode]       = useState("actions");
  const [formAction, setFormAction] = useState(null);
  const [tipo,       setTipo]       = useState("particular");
  const [pagoOpen,   setPagoOpen]   = useState(false);

  useEffect(() => {
    if (open) {
      setMode("actions");
      setFormAction(null);
      setPagoOpen(false);
      setTipo(slot?.tipoCaja || "particular");
    }
  }, [open]);

  if (!open || !slot) return null;

  const { time, status, patient, pagado } = slot;

  const tieneReserva = status === "reserved" || status === "confirmed";
  const tipoActual   = TIPOS.find(t => t.value === tipo) || TIPOS[0];

  // =========================
  // ACCIONES AGENDA — INTACTAS
  // =========================
  function handlePatientSubmit(p) {
    if (formAction === "reserve") onReserve?.({ slot, patient: p });
    if (formAction === "confirm") onConfirm?.({ slot, patient: p });
    setMode("actions");
    setFormAction(null);
  }

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal">

          <h3>🕒 Hora {time}</h3>
          <p><strong>Profesional:</strong> {slot.professionalName}</p>
          {patient && (
            <p><strong>Paciente:</strong> {patient.nombre || patient.rut}</p>
          )}
          <p><strong>Estado:</strong> {status}</p>

          {/* ── SECCIÓN CAJA ── */}
          {tieneReserva && !pagado && (
            <div className="modal-caja">
              <p className="modal-caja-title">Llegada</p>

              {/* Selector tipo atención */}
              <div className="modal-caja-row">
                <label>Tipo de atención</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  {TIPOS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Botón confirmar llegada → abre PagoModal */}
              <div className="modal-caja-actions">
                <button
                  className="caja-btn caja-btn--llego"
                  onClick={() => setPagoOpen(true)}
                >
                  ✓ Confirmar llegada
                </button>
              </div>
            </div>
          )}

          {/* Pagado */}
          {tieneReserva && pagado && (
            <div className="modal-caja">
              <span className="caja-done">✓ Registrado en caja</span>
            </div>
          )}

          {/* ── FORMULARIO PACIENTE — INTACTO ── */}
          {mode === "form" && (
            <PatientForm
              onSubmit={handlePatientSubmit}
              onCancel={() => {
                if (!loading) {
                  setMode("actions");
                  setFormAction(null);
                }
              }}
            />
          )}

          {/* ── ACCIONES AGENDA — INTACTAS ── */}
          {mode === "actions" && (
            <div className="modal-actions">

              {status === "reserved" && (
                <>
                  <button
                    disabled={loading}
                    onClick={() => {
                      setMode("form");
                      setFormAction("confirm");
                    }}
                  >
                    Confirmar paciente
                  </button>

                  <button
                    className="danger"
                    disabled={loading}
                    onClick={onCancel}
                  >
                    Anular reserva
                  </button>
                </>
              )}

              {status === "confirmed" && (
                <>
                  <button disabled={loading} onClick={onReschedule}>
                    Cambiar hora
                  </button>

                  <button
                    className="danger"
                    disabled={loading}
                    onClick={onCancel}
                  >
                    Anular cita
                  </button>
                </>
              )}

            </div>
          )}

          <div className="modal-footer">
            <button disabled={loading} onClick={onClose}>
              Cerrar
            </button>
          </div>

        </div>
      </div>

      {/* PAGO MODAL — encima */}
      <PagoModal
        open={pagoOpen}
        slot={slot}
        tipo={tipo}
        monto={tipoActual.monto}
        onClose={() => setPagoOpen(false)}
        onSuccess={() => {
          setPagoOpen(false);
          onCajaUpdate?.();
        }}
      />
    </>
  );
}
