/*
CajaResumenView — UI PURA
✔ Solo pinta
✔ Sin fetch
✔ Sin lógica
*/

const METODO_LABELS = {
  efectivo:      "Efectivo",
  transferencia: "Transferencia",
  tarjeta:       "Tarjeta",
  gratuito:      "Gratuito",
};

const METODO_COLORS = {
  efectivo:      { bg: "#f0fdf4", border: "#86efac", color: "#166534" },
  transferencia: { bg: "#eff6ff", border: "#93c5fd", color: "#1e40af" },
  tarjeta:       { bg: "#faf5ff", border: "#c4b5fd", color: "#5b21b6" },
  gratuito:      { bg: "#f8fafc", border: "#cbd5e1", color: "#475569" },
};

function formatMonto(monto) {
  if (!monto) return "$0";
  return `$${Number(monto).toLocaleString("es-CL")}`;
}

export default function CajaResumenView({
  date,
  professional,
  professionals = [],
  resumen,
  loading,
  onDateChange,
  onProfessionalChange,
  onRefresh,
}) {
  return (
    <div style={s.root}>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Resumen de caja</h1>
          <p style={s.subtitle}>Pagos registrados del día</p>
        </div>
        <button style={s.refreshBtn} onClick={onRefresh} title="Actualizar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>

      {/* ── FILTROS ── */}
      <div style={s.filters}>
        <div style={s.filterGroup}>
          <label style={s.filterLabel}>Fecha</label>
          <input
            style={s.filterInput}
            type="date"
            value={date}
            onChange={e => onDateChange(e.target.value)}
          />
        </div>

        <div style={s.filterGroup}>
          <label style={s.filterLabel}>Profesional</label>
          <select
            style={s.filterInput}
            value={professional}
            onChange={e => onProfessionalChange(e.target.value)}
          >
            <option value="todos">Todos</option>
            {professionals.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div style={s.centered}>
          <div style={s.spinner}/>
          <span style={s.loadingText}>Cargando…</span>
        </div>
      )}

      {/* ── SIN DATOS ── */}
      {!loading && !resumen && (
        <div style={s.centered}>
          <span style={{ fontSize: 32 }}>📋</span>
          <p style={s.emptyText}>Sin datos para este día</p>
        </div>
      )}

      {/* ── RESUMEN ── */}
      {!loading && resumen && (
        <div style={s.content}>

          {/* KPIs */}
          <div style={s.kpiGrid}>
            <div style={{ ...s.kpi, ...s.kpiBlue }}>
              <span style={s.kpiValue}>{formatMonto(resumen.monto_total)}</span>
              <span style={s.kpiLabel}>Total recaudado</span>
            </div>
            <div style={{ ...s.kpi, ...s.kpiGreen }}>
              <span style={s.kpiValue}>{resumen.pacientes?.length || 0}</span>
              <span style={s.kpiLabel}>Pacientes atendidos</span>
            </div>
          </div>

          {/* Por tipo */}
          {resumen.por_tipo && Object.keys(resumen.por_tipo).length > 0 && (
            <div style={s.section}>
              <p style={s.sectionTitle}>Por tipo de atención</p>
              <div style={s.tagGrid}>
                {Object.entries(resumen.por_tipo).map(([tipo, count]) => (
                  <div key={tipo} style={s.tag}>
                    <span style={s.tagLabel}>{tipo}</span>
                    <span style={s.tagCount}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Por método */}
          {resumen.por_metodo && Object.keys(resumen.por_metodo).length > 0 && (
            <div style={s.section}>
              <p style={s.sectionTitle}>Por método de pago</p>
              <div style={s.tagGrid}>
                {Object.entries(resumen.por_metodo).map(([metodo, count]) => {
                  const colors = METODO_COLORS[metodo] || METODO_COLORS.gratuito;
                  return (
                    <div key={metodo} style={{ ...s.tag, background: colors.bg, borderColor: colors.border }}>
                      <span style={{ ...s.tagLabel, color: colors.color }}>
                        {METODO_LABELS[metodo] || metodo}
                      </span>
                      <span style={{ ...s.tagCount, color: colors.color }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Por profesional */}
          {resumen.por_profesional?.length > 1 && (
            <div style={s.section}>
              <p style={s.sectionTitle}>Por profesional</p>
              <div style={s.profList}>
                {resumen.por_profesional.map(p => (
                  <div key={p.professional} style={s.profRow}>
                    <div style={s.profAvatar}>
                      {p.professional.charAt(0).toUpperCase()}
                    </div>
                    <div style={s.profInfo}>
                      <span style={s.profName}>{p.professional}</span>
                      <span style={s.profMeta}>{p.pagados} pagados · {p.esperando} en espera</span>
                    </div>
                    <span style={s.profMonto}>{formatMonto(p.monto_total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de pacientes */}
          {resumen.pacientes?.length > 0 && (
            <div style={s.section}>
              <p style={s.sectionTitle}>Pacientes del día</p>
              <div style={s.pacienteList}>
                {resumen.pacientes.map((p, i) => (
                  <div key={i} style={s.pacienteRow}>
                    <span style={s.pacienteTime}>{p.time}</span>
                    <span style={s.pacienteRut}>{p.rut}</span>
                    <span style={s.pacienteTipo}>{p.tipo_label}</span>
                    <span style={{
                      ...s.pacienteMonto,
                      color: p.es_gratuito ? "#16a34a" : "#0f172a"
                    }}>
                      {p.es_gratuito ? "Gratis" : formatMonto(p.monto)}
                    </span>
                    <span style={s.pacienteMetodo}>
                      {METODO_LABELS[p.metodo_pago] || p.metodo_pago}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

const s = {
  root: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    background: "#f1f5f9",
    minHeight: "100vh",
    padding: "24px",
  },
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
  },
  filters: {
    display: "flex",
    gap: 12,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  filterGroup: { display: "flex", flexDirection: "column", gap: 4 },
  filterLabel: { fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" },
  filterInput: {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    background: "#fff",
    color: "#0f172a",
    outline: "none",
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    minHeight: "30vh",
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
  emptyText:   { fontSize: 14, color: "#94a3b8" },
  content: { display: "flex", flexDirection: "column", gap: 20, maxWidth: 860 },
  kpiGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  kpi: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "18px 20px",
    borderRadius: 12,
    border: "1px solid",
  },
  kpiBlue:  { background: "#eff6ff", borderColor: "#bfdbfe" },
  kpiGreen: { background: "#f0fdf4", borderColor: "#bbf7d0" },
  kpiValue: { fontSize: 24, fontWeight: 700, color: "#0f172a" },
  kpiLabel: { fontSize: 12, color: "#64748b", fontWeight: 500 },
  section: { display: "flex", flexDirection: "column", gap: 10 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#64748b",
    margin: 0,
  },
  tagGrid: { display: "flex", gap: 8, flexWrap: "wrap" },
  tag: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  tagLabel: { fontSize: 12, fontWeight: 600, color: "#374151" },
  tagCount: { fontSize: 13, fontWeight: 700, color: "#0f172a" },
  profList: { display: "flex", flexDirection: "column", gap: 8 },
  profRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "12px 16px",
  },
  profAvatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#0f172a",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  profInfo:  { display: "flex", flexDirection: "column", gap: 2, flex: 1 },
  profName:  { fontSize: 13.5, fontWeight: 600, color: "#0f172a" },
  profMeta:  { fontSize: 11.5, color: "#94a3b8" },
  profMonto: { fontSize: 15, fontWeight: 700, color: "#0f172a" },
  pacienteList: { display: "flex", flexDirection: "column", gap: 6 },
  pacienteRow: {
    display: "grid",
    gridTemplateColumns: "60px 110px 1fr 80px 100px",
    alignItems: "center",
    gap: 12,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "10px 16px",
    fontSize: 13,
  },
  pacienteTime:   { fontFamily: "monospace", fontWeight: 600, color: "#0f172a" },
  pacienteRut:    { fontFamily: "monospace", fontSize: 11.5, color: "#64748b" },
  pacienteTipo:   { color: "#374151", fontWeight: 500 },
  pacienteMonto:  { fontWeight: 700, textAlign: "right" },
  pacienteMetodo: { color: "#64748b", fontSize: 12 },
};
