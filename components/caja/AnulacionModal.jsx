import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AnulacionModal({
  open,
  slot,
  onClose,
  onSuccess,
  usuarioActual
}) {
  const [motivo,  setMotivo]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (open) {
      setMotivo("");
      setError(null);
    }
  }, [open]);

  if (!open || !slot) return null;

  const { date, professional, time, patient, rut } = slot;

  const nombrePaciente = patient?.nombre
    ? `${patient.nombre} ${patient.apellido_paterno ?? ""}`
    : rut || "—";

  const tienePago  = slot.pagado === true;
  const montoSlot  = slot.monto || 0;
  const metodoPago = slot.tipoCaja || "";

  async function handleAnular() {
    setError(null);

    if (!motivo.trim()) {
      setError("Ingresa el motivo de anulación");
      return;
    }

    setLoading(true);
    try {
      // 1. Anular pago en caja
      const res = await fetch(`${API_URL}/api/caja/anular`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          date,
          professional,
          time,
          motivo:      motivo.trim(),
          anulado_por: usuarioActual || null,
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error al anular pago");
      }

      // 2. Si tenía pago registrado → registrar egreso contable
      if (tienePago && montoSlot > 0) {
        const mes = date.slice(0, 7); // YYYY-MM
        await fetch(`${API_URL}/api/contable/gastos`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            mes,
            grupo:       "devoluciones",
            categoria:   "Devolución a paciente",
            descripcion: `${nombrePaciente} · ${date} ${time} · ${motivo.trim()}`,
            monto:       montoSlot,
          })
        }).catch(() => {}); // No bloquea si falla
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

        <div style={s.header}>
          <p style={s.headerTitle}>Anular pago</p>
          <div style={s.headerMeta}>
            <span style={s.headerNombre}>{nombrePaciente}</span>
            <span style={s.headerDot}>·</span>
            <span style={s.headerTime}>{time}</span>
          </div>
        </div>

        <div style={s.body}>

          <div style={s.advertencia}>
            <span style={s.advertenciaIcon}>⚠️</span>
            <span>
              {tienePago
                ? `Este paciente tiene un pago registrado de $${Number(montoSlot).toLocaleString("es-CL")}. La devolución quedará registrada como egreso contable.`
                : "Este paciente tiene un pago registrado. La anulación quedará en el historial de auditoría."}
            </span>
          </div>

          {tienePago && (
            <div style={s.egresoInfo}>
              <span style={s.egresoIcon}>💸</span>
              <div>
                <p style={s.egresoTitle}>Se registrará egreso contable</p>
                <p style={s.egresoDesc}>
                  Devolución a paciente · ${Number(montoSlot).toLocaleString("es-CL")}
                  {metodoPago ? ` · ${metodoPago}` : ""}
                </p>
              </div>
            </div>
          )}

          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>
              Motivo de anulación <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              style={s.textarea}
              placeholder="Ej: Error en registro, paciente solicitó reembolso…"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              rows={3}
              maxLength={200}
            />
            <span style={s.counter}>{motivo.length}/200</span>
          </div>

          {error && <p style={s.errorMsg}>{error}</p>}

        </div>

        <div style={s.footer}>
          <button style={s.btnCancel} onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button style={s.btnAnular} onClick={handleAnular} disabled={loading}>
            {loading ? "Anulando…" : "Anular pago"}
          </button>
        </div>

      </div>
    </div>
  );
}

const s = {
  backdrop:       { position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2500, padding:16 },
  modal:          { background:"#fff", borderRadius:16, width:"100%", maxWidth:400, boxShadow:"0 24px 64px rgba(0,0,0,0.25)", overflow:"hidden", fontFamily:"'DM Sans',system-ui,sans-serif" },
  header:         { background:"#0f172a", padding:"18px 24px" },
  headerTitle:    { fontSize:15, fontWeight:700, color:"#fff", margin:0 },
  headerMeta:     { display:"flex", alignItems:"center", gap:6, marginTop:4 },
  headerNombre:   { fontSize:13, color:"rgba(255,255,255,0.6)" },
  headerDot:      { fontSize:13, color:"rgba(255,255,255,0.3)" },
  headerTime:     { fontSize:13, color:"rgba(255,255,255,0.6)", fontFamily:"monospace" },
  body:           { padding:"20px 24px", display:"flex", flexDirection:"column", gap:14 },
  advertencia:    { display:"flex", alignItems:"flex-start", gap:10, background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:10, padding:"12px 14px", fontSize:13, color:"#78350f", fontWeight:500 },
  advertenciaIcon: { fontSize:16, flexShrink:0 },
  egresoInfo:     { display:"flex", alignItems:"flex-start", gap:10, background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"12px 14px" },
  egresoIcon:     { fontSize:18, flexShrink:0 },
  egresoTitle:    { fontSize:13, fontWeight:700, color:"#991b1b", margin:0 },
  egresoDesc:     { fontSize:12, color:"#b91c1c", marginTop:2 },
  fieldGroup:     { display:"flex", flexDirection:"column", gap:4 },
  fieldLabel:     { fontSize:12, fontWeight:600, color:"#374151" },
  textarea:       { border:"1px solid #e2e8f0", borderRadius:8, padding:"10px 12px", fontSize:13, fontFamily:"'DM Sans',system-ui,sans-serif", outline:"none", resize:"none", color:"#0f172a", lineHeight:1.5 },
  counter:        { fontSize:11, color:"#94a3b8", textAlign:"right" },
  errorMsg:       { fontSize:12.5, color:"#ef4444", fontWeight:500, background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"8px 12px", margin:0 },
  footer:         { display:"flex", gap:10, padding:"16px 24px", borderTop:"1px solid #f1f5f9" },
  btnCancel:      { flex:1, padding:"10px", border:"1px solid #e2e8f0", borderRadius:9, background:"#f8fafc", color:"#64748b", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',system-ui,sans-serif" },
  btnAnular:      { flex:2, padding:"10px", border:"none", borderRadius:9, background:"#ef4444", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',system-ui,sans-serif" },
};
            
