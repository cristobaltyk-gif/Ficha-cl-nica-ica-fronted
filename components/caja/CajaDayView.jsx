import { useState } from "react";

/*
CajaDayView — UI PURA
✔ Solo pinta
✔ Sin lógica
✔ Sin fetch
*/

const TIPOS = [
  { value: "particular", label: "Particular",  color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
  { value: "control",    label: "Control",      color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" },
  { value: "cortesia",   label: "Cortesía",     color: "#065f46", bg: "#f0fdf4", border: "#bbf7d0" },
  { value: "sobrecupo",  label: "Sobrecupo",    color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
];

function getTipo(value) {
  return TIPOS.find(t => t.value === value) || TIPOS[0];
}

function formatMonto(monto) {
  if (!monto) return "Gratis";
  return `$${monto.toLocaleString("es-CL")}`;
}

export default function CajaDayView({
  date,
  professional,
  slots = [],
  summary,
  loading,
  onLlego,
  onPagado,
  onTipo,
  onRefresh,
}) {
  const [loadingSlot, setLoadingSlot] = useState(null);

  async function handleAction(fn, time) {
    setLoadingSlot(time);
    await fn(time);
    setLoadingSlot(null);
  }

  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner}/>
        <span style={styles.loadingText}>Cargando caja…</span>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div style={styles.centered}>
        <span style={{ fontSize: 32 }}>📋</span>
        <p style={styles.emptyText}>Sin pacientes agendados para este día</p>
      </div>
    );
  }

  const esperando = slots.filter(s => s.arrival_status === "waiting" && !s.pagado).length;
  const pagados   = slots.filter(s => s.pagado).length;
  const pendientes = slots.filter(s => s.arrival_status === "pending").length;

  return (
    <div style={styles.root}>

      {/* ── HEADER ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Panel de caja</h1>
          <p style={styles.subtitle}>{date} · {professional}</p>
        </div>
        <button style={styles.refreshBtn} onClick={onRefresh} title="Actualizar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>

      {/* ── SUMMARY PILLS ── */}
      <div style={styles.summaryRow}>
        <div style={{ ...styles.pill, background: "#f1f5f9", border: "1px solid #e2e8f0" }}>
          <span style={{ ...styles.pillDot, background: "#94a3b8" }}/>
          <span style={styles.pillText}>{pendientes} pendientes</span>
        </div>
        <div style={{ ...styles.pill, background: "#fff7ed", border: "1px solid #fed7aa" }}>
          <span style={{ ...styles.pillDot, background: "#f97316" }}/>
          <span style={{ ...styles.pillText, color: "#9a3412" }}>{esperando} en espera</span>
        </div>
        <div style={{ ...styles.pill, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <span style={{ ...styles.pillDot, background: "#22c55e" }}/>
          <span style={{ ...styles.pillText, color: "#166534" }}>{pagados} pagados</span>
        </div>
        {summary?.monto_total > 0 && (
          <div style={{ ...styles.pill, background: "#eff6ff", border: "1px solid #bfdbfe", marginLeft: "auto" }}>
            <span style={{ ...styles.pillText, color: "#1d4ed8", fontWeight: 700 }}>
              {formatMonto(summary.monto_total)} recaudado
            </span>
          </div>
        )}
      </div>

      {/* ── SLOTS LIST ── */}
      <div style={styles.list}>
        {slots.map((slot) => {
          const tipo    = getTipo(slot.tipo_atencion);
          const busy    = loadingSlot === slot.time;
          const llegó   = slot.arrival_status === "waiting";
          const pagado  = slot.pagado;

          return (
            <div
              key={slot.time}
              style={{
                ...styles.row,
                opacity: pagado ? 0.7 : 1,
                borderLeft: `4px solid ${pagado ? "#22c55e" : llegó ? "#f97316" : "#e2e8f0"}`,
              }}
            >
              {/* Hora */}
              <div style={styles.timeBlock}>
                <span style={styles.time}>{slot.time}</span>
                <StatusBadge arrival_status={slot.arrival_status} pagado={pagado}/>
              </div>

              {/* Paciente */}
              <div style={styles.patientBlock}>
                <span style={styles.patientName}>
                  {slot.patient?.nombre
                    ? `${slot.patient.nombre} ${slot.patient.apellido_paterno ?? ""}`
                    : slot.rut}
                </span>
                {slot.rut && slot.patient?.nombre && (
                  <span style={styles.rut}>{slot.rut}</span>
                )}
              </div>

              {/* Tipo selector */}
              <div style={styles.tipoBlock}>
                <select
                  style={{
                    ...styles.tipoSelect,
                    background: tipo.bg,
                    borderColor: tipo.border,
                    color: tipo.color,
                  }}
                  value={slot.tipo_atencion}
                  onChange={(e) => onTipo(slot.time, e.target.value)}
                  disabled={pagado}
                >
                  {TIPOS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <span style={styles.monto}>{formatMonto(slot.monto)}</span>
              </div>

              {/* Acciones */}
              <div style={styles.actions}>
                {!llegó && !pagado && (
                  <button
                    style={{ ...styles.actionBtn, ...styles.btnLlego }}
                    onClick={() => handleAction(onLlego, slot.time)}
                    disabled={busy}
                  >
                    {busy ? "…" : "Llegó"}
                  </button>
                )}

                {llegó && !pagado && (
                  <button
                    style={{ ...styles.actionBtn, ...styles.btnPagado }}
                    onClick={() => handleAction(onPagado, slot.time)}
                    disabled={busy}
                  >
                    {busy ? "…" : "Pagado ✓"}
                  </button>
                )}

                {pagado && (
                  <span style={styles.doneTag}>✓ Listo</span>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

function StatusBadge({ arrival_status, pagado }) {
  if (pagado) return <span style={{ ...styles.badge, background: "#dcfce7", color: "#166534" }}>Pagado</span>;
  if (arrival_status === "waiting") return <span style={{ ...styles.badge, background: "#ffedd5", color: "#9a3412" }}>En espera</span>;
  return <span style={{ ...styles.badge, background: "#f1f5f9", color: "#64748b" }}>Pendiente</span>;
}

const styles = {
  root: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    background: "#f1f5f9",
    minHeight: "100vh",
    padding: "24px",
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    minHeight: "40vh",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  spinner: {
    width: 24,
    height: 24,
    border: "2.5px solid #e2e8f0",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  loadingText: { fontSize: 14, color: "#64748b" },
  emptyText:   { fontSize: 14, color: "#94a3b8", marginTop: 8 },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.02em",
    margin: 0,
  },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    background: "#fff",
    cursor: "pointer",
    color: "#64748b",
    transition: "all 0.15s",
  },

  summaryRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 20,
    alignItems: "center",
  },
  pill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    borderRadius: 999,
  },
  pillDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
  },
  pillText: { fontSize: 12, fontWeight: 600, color: "#374151" },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxWidth: 860,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "90px 1fr 160px 130px",
    alignItems: "center",
    gap: 16,
    background: "#ffffff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: "14px 18px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    transition: "box-shadow 0.15s",
  },

  timeBlock: { display: "flex", flexDirection: "column", gap: 4 },
  time: { fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 500, color: "#0f172a" },
  badge: { fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999 },

  patientBlock: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  patientName:  { fontSize: 13.5, fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  rut:          { fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#94a3b8" },

  tipoBlock: { display: "flex", flexDirection: "column", gap: 3 },
  tipoSelect: {
    border: "1px solid",
    borderRadius: 7,
    padding: "4px 8px",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    cursor: "pointer",
    outline: "none",
  },
  monto: { fontSize: 11, color: "#64748b", fontWeight: 500, paddingLeft: 2 },

  actions: { display: "flex", justifyContent: "flex-end" },
  actionBtn: {
    border: "none",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  },
  btnLlego:  { background: "#fff7ed", color: "#9a3412", border: "1px solid #fed7aa" },
  btnPagado: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
  doneTag:   { fontSize: 12, fontWeight: 600, color: "#22c55e" },
};
