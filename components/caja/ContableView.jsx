/*
ContableView — UI PURA
✔ Solo pinta
✔ Sin fetch
✔ Sin lógica
*/

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

function formatMonth(month) {
  if (!month) return "";
  const [y, m] = month.split("-");
  const names = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                 "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return `${names[parseInt(m) - 1]} ${y}`;
}

export default function ContableView({
  month,
  resumen,
  loading,
  onMonthChange,
  onRefresh,
  onExportPDF,
}) {
  return (
    <div style={s.root}>

      {/* HEADER */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Módulo contable</h1>
          <p style={s.subtitle}>{formatMonth(month)}</p>
        </div>
        <div style={s.headerActions}>
          <button style={s.refreshBtn} onClick={onRefresh} title="Actualizar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>
          <button style={s.pdfBtn} onClick={onExportPDF}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Exportar PDF
          </button>
        </div>
      </div>

      {/* FILTRO MES */}
      <div style={s.filterRow}>
        <div style={s.filterGroup}>
          <label style={s.filterLabel}>Mes</label>
          <input
            style={s.filterInput}
            type="month"
            value={month}
            onChange={e => onMonthChange(e.target.value)}
          />
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div style={s.centered}>
          <div style={s.spinner}/>
          <span style={s.loadingText}>Cargando…</span>
        </div>
      )}

      {/* SIN DATOS */}
      {!loading && (!resumen || resumen.total_pagos === 0) && (
        <div style={s.centered}>
          <span style={{ fontSize: 32 }}>📊</span>
          <p style={s.emptyText}>Sin pagos registrados para este mes</p>
        </div>
      )}

      {/* CONTENIDO */}
      {!loading && resumen && resumen.total_pagos > 0 && (
        <div style={s.content}>

          {/* KPIs */}
          <div style={s.kpiGrid}>
            <div style={{ ...s.kpi, background: "#eff6ff", borderColor: "#bfdbfe" }}>
              <span style={s.kpiValue}>{formatMonto(resumen.monto_total)}</span>
              <span style={s.kpiLabel}>Total recaudado</span>
            </div>
            <div style={{ ...s.kpi, background: "#f0fdf4", borderColor: "#bbf7d0" }}>
              <span style={s.kpiValue}>{resumen.total_pagos}</span>
              <span style={s.kpiLabel}>Atenciones cobradas</span>
            </div>
            <div style={{ ...s.kpi, background: "#fff7ed", borderColor: "#fed7aa" }}>
              <span style={s.kpiValue}>{resumen.total_anulados}</span>
              <span style={s.kpiLabel}>Anuladas</span>
            </div>
          </div>

          {/* Por profesional */}
          {Object.keys(resumen.por_profesional).length > 0 && (
            <div style={s.section}>
              <p style={s.sectionTitle}>Por profesional</p>
              <div style={s.profList}>
                {Object.entries(resumen.por_profesional).map(([prof, vals]) => (
                  <div key={prof} style={s.profRow}>
                    <div style={s.profAvatar}>{prof.charAt(0).toUpperCase()}</div>
                    <div style={s.profInfo}>
                      <span style={s.profName}>{prof}</span>
                      <span style={s.profMeta}>{vals.pagos} atenciones cobradas</span>
                    </div>
                    <span style={s.profMonto}>{formatMonto(vals.monto)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Por tipo */}
          {Object.keys(resumen.por_tipo).length > 0 && (
            <div style={s.section}>
              <p style={s.sectionTitle}>Por tipo de atención</p>
              <div style={s.tagGrid}>
                {Object.entries(resumen.por_tipo).map(([tipo, vals]) => (
                  <div key={tipo} style={s.tipoCard}>
                    <span style={s.tipoCardLabel}>{tipo}</span>
                    <span style={s.tipoCardCount}>{vals.count} atenciones</span>
                    <span style={s.tipoCardMonto}>{formatMonto(vals.monto)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Por método */}
          {Object.keys(resumen.por_metodo).length > 0 && (
            <div style={s.section}>
              <p style={s.sectionTitle}>Por método de pago</p>
              <div style={s.metodoGrid}>
                {Object.entries(resumen.por_metodo).map(([met, vals]) => {
                  const colors = METODO_COLORS[met] || METODO_COLORS.gratuito;
                  return (
                    <div key={met} style={{ ...s.metodoCard, background: colors.bg, borderColor: colors.border }}>
                      <span style={{ ...s.metodoLabel, color: colors.color }}>{met.charAt(0).toUpperCase() + met.slice(1)}</span>
                      <span style={{ ...s.metodoCount, color: colors.color }}>{vals.count}</span>
                      <span style={{ ...s.metodoMonto, color: colors.color }}>{formatMonto(vals.monto)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Totales por día */}
          {resumen.por_dia?.length > 0 && (
            <div style={s.section}>
              <p style={s.sectionTitle}>Recaudación por día</p>
              <div style={s.diaList}>
                {resumen.por_dia.map(d => (
                  <div key={d.date} style={s.diaRow}>
                    <span style={s.diaDate}>{d.date}</span>
                    <div style={s.diaBar}>
                      <div style={{
                        ...s.diaBarFill,
                        width: `${Math.min(100, (d.monto / resumen.monto_total) * 100 * 3)}%`
                      }}/>
                    </div>
                    <span style={s.diaMonto}>{formatMonto(d.monto)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista completa */}
          {resumen.pagos?.length > 0 && (
            <div style={s.section}>
              <p style={s.sectionTitle}>Detalle de pagos ({resumen.pagos.length})</p>
              <div style={s.pagoList}>
                {resumen.pagos.map((p, i) => (
                  <div key={i} style={s.pagoRow}>
                    <span style={s.pagoDate}>{p.date}</span>
                    <span style={s.pagoTime}>{p.time}</span>
                    <span style={s.pagoRut}>{p.rut}</span>
                    <span style={s.pagoProf}>{p.professional}</span>
                    <span style={s.pagoTipo}>{p.tipo_atencion}</span>
                    <span style={s.pagoMetodo}>{p.metodo_pago}</span>
                    <span style={{
                      ...s.pagoMonto,
                      color: p.es_gratuito ? "#16a34a" : "#0f172a"
                    }}>
                      {p.es_gratuito ? "Gratis" : formatMonto(p.monto)}
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
  root: { fontFamily: "'DM Sans', system-ui, sans-serif", background: "#f1f5f9", minHeight: "100vh", padding: "24px" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 },
  title:  { fontSize: 22, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", margin: 0 },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },
  headerActions: { display: "flex", gap: 8, alignItems: "center" },
  refreshBtn: { display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", color: "#64748b" },
  pdfBtn: { display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "none", borderRadius: 8, background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif" },
  filterRow: { marginBottom: 24 },
  filterGroup: { display: "flex", flexDirection: "column", gap: 4 },
  filterLabel: { fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" },
  filterInput: { border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", color: "#0f172a", outline: "none" },
  centered: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: "30vh" },
  spinner: { width: 24, height: 24, border: "2.5px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
  loadingText: { fontSize: 14, color: "#64748b" },
  emptyText: { fontSize: 14, color: "#94a3b8" },
  content: { display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  kpi: { display: "flex", flexDirection: "column", gap: 4, padding: "16px 20px", borderRadius: 12, border: "1px solid" },
  kpiValue: { fontSize: 22, fontWeight: 700, color: "#0f172a" },
  kpiLabel: { fontSize: 12, color: "#64748b", fontWeight: 500 },
  section: { display: "flex", flexDirection: "column", gap: 10 },
  sectionTitle: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", margin: 0 },
  profList: { display: "flex", flexDirection: "column", gap: 8 },
  profRow: { display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px" },
  profAvatar: { width: 36, height: 36, borderRadius: "50%", background: "#0f172a", color: "#fff", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  profInfo: { display: "flex", flexDirection: "column", gap: 2, flex: 1 },
  profName: { fontSize: 13.5, fontWeight: 600, color: "#0f172a" },
  profMeta: { fontSize: 11.5, color: "#94a3b8" },
  profMonto: { fontSize: 16, fontWeight: 700, color: "#0f172a" },
  tagGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 },
  tipoCard: { display: "flex", flexDirection: "column", gap: 2, padding: "12px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10 },
  tipoCardLabel: { fontSize: 12, fontWeight: 600, color: "#374151" },
  tipoCardCount: { fontSize: 11, color: "#94a3b8" },
  tipoCardMonto: { fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 4 },
  metodoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 },
  metodoCard: { display: "flex", flexDirection: "column", gap: 2, padding: "12px 14px", border: "1px solid", borderRadius: 10 },
  metodoLabel: { fontSize: 12, fontWeight: 700 },
  metodoCount: { fontSize: 11, opacity: 0.7 },
  metodoMonto: { fontSize: 14, fontWeight: 700, marginTop: 4 },
  diaList: { display: "flex", flexDirection: "column", gap: 6 },
  diaRow: { display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 14px" },
  diaDate: { fontFamily: "monospace", fontSize: 12, color: "#64748b", width: 90, flexShrink: 0 },
  diaBar: { flex: 1, height: 6, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" },
  diaBarFill: { height: "100%", background: "#2563eb", borderRadius: 999, minWidth: 4, transition: "width 0.3s" },
  diaMonto: { fontSize: 13, fontWeight: 600, color: "#0f172a", width: 90, textAlign: "right", flexShrink: 0 },
  pagoList: { display: "flex", flexDirection: "column", gap: 4 },
  pagoRow: { display: "grid", gridTemplateColumns: "80px 50px 100px 90px 1fr 90px 80px", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 14px", fontSize: 12 },
  pagoDate:   { fontFamily: "monospace", color: "#64748b" },
  pagoTime:   { fontFamily: "monospace", color: "#64748b" },
  pagoRut:    { fontFamily: "monospace", fontSize: 11, color: "#94a3b8" },
  pagoProf:   { fontWeight: 500, color: "#374151" },
  pagoTipo:   { color: "#374151" },
  pagoMetodo: { color: "#64748b", textTransform: "capitalize" },
  pagoMonto:  { fontWeight: 700, textAlign: "right" },
};
