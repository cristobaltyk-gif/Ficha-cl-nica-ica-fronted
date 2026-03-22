import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const TIPOS_GRATUITOS = new Set(["control_gratuito", "cortesia"]);

const METODOS = [
  {
    value: "efectivo",
    label: "Efectivo",
    icon: "💵",
    desc: "Pago en efectivo"
  },
  {
    value: "transferencia",
    label: "Transferencia",
    icon: "🏦",
    desc: "Transferencia bancaria"
  },
  {
    value: "tarjeta",
    label: "Tarjeta",
    icon: "💳",
    desc: "Débito o crédito"
  },
];

function formatMonto(monto) {
  if (!monto) return "Gratis";
  return `$${monto.toLocaleString("es-CL")}`;
}

export default function PagoModal({
  open,
  slot,
  onClose,
  onSuccess,
  usuarioActual
}) {
  const [metodo,    setMetodo]    = useState("efectivo");
  const [numOp,     setNumOp]     = useState("");
  const [banco,     setBanco]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  if (!open || !slot) return null;

  const { date, professional, time, patient, rut, tipo_atencion, monto } = slot;

  const esGratuito = TIPOS_GRATUITOS.has(tipo_atencion);

  const nombrePaciente = patient?.nombre
    ? `${patient.nombre} ${patient.apellido_paterno ?? ""}`
    : rut || "—";

  const necesitaOperacion = !esGratuito &&
    (metodo === "transferencia" || metodo === "tarjeta");

  async function handlePagar() {
    setError(null);

    if (!esGratuito && necesitaOperacion && !numOp.trim()) {
      setError("Ingresa el número de operación");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/caja/pago`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          professional,
          time,
          rut:              rut || patient?.rut,
          tipo_atencion,
          metodo_pago:      esGratuito ? null : metodo,
          numero_operacion: necesitaOperacion ? numOp.trim() : null,
          banco_origen:     necesitaOperacion ? banco.trim() || null : null,
          pagado_por:       usuarioActual || null,
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error al registrar pago");
      }

      onSuccess?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.backdrop}>
      <div style={s.modal}>

        {/* ── HEADER ── */}
        <div style={s.header}>
          <p style={s.headerTitle}>Registrar pago</p>
          <div style={s.headerMeta}>
            <span style={s.headerNombre}>{nombrePaciente}</span>
            <span style={s.headerDot}>·</span>
            <span style={s.headerTime}>{time}</span>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={s.body}>

          {/* Monto */}
          <div style={s.montoRow}>
            <span style={s.montoLabel}>Total a cobrar</span>
            <span style={{
              ...s.montoValue,
              color: esGratuito ? "#16a34a" : "#0f172a"
            }}>
              {formatMonto(monto)}
            </span>
          </div>

          {/* Método pago — solo si tiene costo */}
          {!esGratuito && (
            <>
              <p style={s.sectionLabel}>Método de pago</p>

              <div style={s.metodosGrid}>
                {METODOS.map(m => (
                  <button
                    key={m.value}
                    style={{
                      ...s.metodoBtn,
                      ...(metodo === m.value ? s.metodoBtnActive : {})
                    }}
                    onClick={() => {
                      setMetodo(m.value);
                      setNumOp("");
                      setBanco("");
                      setError(null);
                    }}
                  >
                    <span style={s.metodoBtnIcon}>{m.icon}</span>
                    <span style={s.metodoBtnLabel}>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Campos extra para transferencia y tarjeta */}
              {necesitaOperacion && (
                <div style={s.extraFields}>
                  <div style={s.fieldGroup}>
                    <label style={s.fieldLabel}>
                      N° operación <span style={s.required}>*</span>
                    </label>
                    <input
                      style={s.input}
                      type="text"
                      placeholder="Ej: 123456789"
                      value={numOp}
                      onChange={e => setNumOp(e.target.value)}
                      maxLength={20}
                    />
                  </div>

                  <div style={s.fieldGroup}>
                    <label style={s.fieldLabel}>Banco origen</label>
                    <input
                      style={s.input}
                      type="text"
                      placeholder="Ej: Banco Chile"
                      value={banco}
                      onChange={e => setBanco(e.target.value)}
                      maxLength={40}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Gratuito — mensaje */}
          {esGratuito && (
            <div style={s.gratuitoMsg}>
              <span style={s.gratuitoIcon}>✓</span>
              <span>Esta atención no tiene costo. Solo confirma el registro.</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <p style={s.errorMsg}>{error}</p>
          )}

        </div>

        {/* ── FOOTER ── */}
        <div style={s.footer}>
          <button
            style={s.btnCancel}
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            style={s.btnPagar}
            onClick={handlePagar}
            disabled={loading}
          >
            {loading
              ? "Guardando…"
              : esGratuito
                ? "✓ Confirmar registro"
                : `✓ Registrar ${formatMonto(monto)}`
            }
          </button>
        </div>

      </div>
    </div>
  );
}

const s = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 400,
    padding: 16,
  },
  modal: {
    background: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
    overflow: "hidden",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  header: {
    background: "#0f172a",
    padding: "18px 24px",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    margin: 0,
  },
  headerMeta: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  headerNombre: { fontSize: 13, color: "rgba(255,255,255,0.6)" },
  headerDot:    { fontSize: 13, color: "rgba(255,255,255,0.3)" },
  headerTime:   { fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "monospace" },

  body: {
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  montoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "12px 16px",
  },
  montoLabel: { fontSize: 13, fontWeight: 600, color: "#64748b" },
  montoValue: { fontSize: 20, fontWeight: 700 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#64748b",
    margin: 0,
  },

  metodosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },
  metodoBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "12px 8px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    background: "#f8fafc",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  metodoBtnActive: {
    border: "1.5px solid #0f172a",
    background: "#0f172a",
  },
  metodoBtnIcon:  { fontSize: 20 },
  metodoBtnLabel: { fontSize: 12, fontWeight: 600, color: "inherit" },

  extraFields: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "14px 16px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#374151",
  },
  required: { color: "#ef4444" },
  input: {
    border: "1px solid #e2e8f0",
    borderRadius: 7,
    padding: "8px 12px",
    fontSize: 13,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    outline: "none",
    background: "#fff",
    color: "#0f172a",
  },

  gratuitoMsg: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 13,
    color: "#166534",
    fontWeight: 500,
  },
  gratuitoIcon: { fontSize: 16, color: "#22c55e" },

  errorMsg: {
    fontSize: 12.5,
    color: "#ef4444",
    fontWeight: 500,
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: "8px 12px",
    margin: 0,
  },

  footer: {
    display: "flex",
    gap: 10,
    padding: "16px 24px",
    borderTop: "1px solid #f1f5f9",
  },
  btnCancel: {
    flex: 1,
    padding: "10px",
    border: "1px solid #e2e8f0",
    borderRadius: 9,
    background: "#f8fafc",
    color: "#64748b",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  btnPagar: {
    flex: 2,
    padding: "10px",
    border: "none",
    borderRadius: 9,
    background: "#0f172a",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    transition: "background 0.15s",
  },
};
