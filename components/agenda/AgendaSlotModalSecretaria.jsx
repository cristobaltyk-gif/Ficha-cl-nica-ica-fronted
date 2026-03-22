import "../../styles/agenda/agenda-slot-modal.css";
import { useState, useEffect } from "react";
import PatientForm from "../patient/PatientForm";

const API_URL = import.meta.env.VITE_API_URL;

const TIPOS = [
  { value: "particular", label: "Particular" },
  { value: "control",    label: "Control"    },
  { value: "cortesia",   label: "Cortesía"   },
  { value: "sobrecupo",  label: "Sobrecupo"  },
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
  const [cajaLoading, setCajaLoading] = useState(false);
  const [tipo, setTipo]               = useState("particular");

  useEffect(() => {
    if (open) {
      setMode("actions");
      setFormAction(null);
      setTipo(slot?.tipoCaja || "particular");
    }
  }, [open]);

  if (!open || !slot) return null;

  const { professional, date, time, status, patient, cajaStatus, pagado } = slot;

  const tieneReserva = status === "reserved" || status === "confirmed";

  // =========================
  // CAJA
  // =========================
  async function patchCaja(fields) {
    setCajaLoading(true);
    try {
      await fetch(`${API_URL}/api/caja/slot`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, professional, time, ...fields })
      });
      onCajaUpdate?.();
    } catch {
    } finally {
      setCajaLoading(false);
    }
  }

  function handleLlego()  { patchCaja({ arrival_status: "waiting", tipo_atencion: tipo }); }
  function handlePagado() { patchCaja({ pagado: true }); }

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
    <div className="modal-backdrop">
      <div className="modal">

        <h3>🕒 Hora {time}</h3>

        <p><strong>Profesional:</strong> {slot.professionalName}</p>

        {patient && (
          <p><strong>Paciente:</strong> {patient.nombre || patient.rut}</p>
        )}

        <p><strong>Estado:</strong> {status}</p>

        {/* ── SECCIÓN CAJA (solo si hay reserva) ── */}
        {tieneReserva && (
          <div className="modal-caja">
            <p className="modal-caja-title">Caja</p>

            {!pagado && (
              <div className="modal-caja-row">
                <label>Tipo</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  disabled={cajaLoading || cajaStatus === "waiting"}
                >
                  {TIPOS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="modal-caja-actions">
              {!cajaStatus && (
                <button
                  className="caja-btn caja-btn--llego"
                  disabled={cajaLoading}
                  onClick={handleLlego}
                >
                  {cajaLoading ? "…" : "✓ Llegó"}
                </button>
              )}

              {cajaStatus === "waiting" && !pagado && (
                <button
                  className="caja-btn caja-btn--pagado"
                  disabled={cajaLoading}
                  onClick={handlePagado}
                >
                  {cajaLoading ? "…" : "$ Pagado"}
                </button>
              )}

              {pagado && (
                <span className="caja-done">✓ Registrado en caja</span>
              )}
            </div>
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
  );
}
