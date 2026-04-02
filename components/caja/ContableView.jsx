import { useState } from "react";

const GRUPOS_LABELS = {
  fijos:     "Gastos Fijos",
  variables: "Gastos Variables",
  cuentas:   "Cuentas",
};

function fmt(val) {
  if (!val && val !== 0) return "$0";
  const n = Number(val);
  const abs = Math.abs(n).toLocaleString("es-CL");
  return n < 0 ? `($${abs})` : `$${abs}`;
}

// ======================================================
// MODAL GASTO
// ======================================================
function GastoModal({ open, editing, config, onSave, onClose }) {
  const [grupo,       setGrupo]       = useState(editing?.grupo_raw || "fijos");
  const [categoria,   setCategoria]   = useState(editing?.categoria || "");
  const [descripcion, setDescripcion] = useState(editing?.descripcion || "");
  const [monto,       setMonto]       = useState(editing?.monto ? Math.abs(editing.monto) : "");
  const [error,       setError]       = useState("");

  if (!open) return null;

  const grupos   = config?.grupos || {};
  const cats     = grupos[grupo]?.categorias || [];

  function handleSave() {
    if (!categoria)    { setError("Selecciona una categoría"); return; }
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      setError("Ingresa un monto válido"); return;
    }
    onSave({ grupo, categoria, descripcion, monto: Number(monto) });
  }

  return (
    <div style={ms.backdrop}>
      <div style={ms.modal}>
        <div style={ms.header}>
          <p style={ms.title}>{editing ? "Editar gasto" : "Nuevo gasto"}</p>
        </div>
        <div style={ms.body}>

          {!editing && (
            <div style={ms.field}>
              <label style={ms.label}>Grupo</label>
              <select style={ms.input} value={grupo} onChange={e => { setGrupo(e.target.value); setCategoria(""); }}>
                {Object.entries(grupos).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          )}

          {!editing && (
            <div style={ms.field}>
              <label style={ms.label}>Categoría</label>
              <select style={ms.input} value={categoria} onChange={e => setCategoria(e.target.value)}>
                <option value="">Seleccionar…</option>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          <div style={ms.field}>
            <label style={ms.label}>Descripción (opcional)</label>
            <input style={ms.input} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej: Arriendo mes de abril" />
          </div>

          <div style={ms.field}>
            <label style={ms.label}>Monto ($)</label>
            <input style={ms.input} type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="0" min="0" />
          </div>

          {error && <p style={{ color: "#ef4444", fontSize: 12, margin: 0 }}>{error}</p>}
        </div>
        <div style={ms.footer}>
          <button style={ms.btnCancel} onClick={onClose}>Cancelar</button>
          <button style={ms.btnSave}   onClick={handleSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

const ms = {
  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16 },
  modal:    { background: "#fff", borderRadius: 14, width: "100%", maxWidth: 380, fontFamily: "'DM Sans', system-ui" },
  header:   { background: "#0f172a", padding: "16px 20px", borderRadius: "14px 14px 0 0" },
  title:    { color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 },
  body:     { padding: "20px", display: "flex", flexDirection: "column", gap: 14 },
  field:    { display: "flex", flexDirection: "column", gap: 4 },
  label:    { fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" },
  input:    { border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "'DM Sans', system-ui", outline: "none" },
  footer:   { display: "flex", gap: 10, padding: "14px 20px", borderTop: "1px solid #f1f5f9" },
  btnCancel: { flex: 1, padding: 10, border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui" },
  btnSave:   { flex: 2, padding: 10, border: "none", borderRadius: 8, background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', system-ui" },
};

// ======================================================
// MODAL CATEGORÍA
// ======================================================
function CategoriaModal({ open, grupo, grupos, onSave, onClose }) {
  const [nombre, setNombre] = useState("");
  const label = grupos?.[grupo]?.label || grupo;

  if (!open) return null;

  return (
    <div style={ms.backdrop}>
      <div style={ms.modal}>
        <div style={ms.header}>
          <p style={ms.title}>Nueva categoría — {label}</p>
        </div>
        <div style={ms.body}>
          <div style={ms.field}>
            <label style={ms.label}>Nombre</label>
            <input style={ms.input} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Telefonía" />
          </div>
        </div>
        <div style={ms.footer}>
          <button style={ms.btnCancel} onClick={onClose}>Cancelar</button>
          <button style={ms.btnSave} onClick={() => nombre.trim() && onSave(nombre.trim())}>Agregar</button>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// MAIN VIEW
// ======================================================
export default function ContableView({
  mes, resumen, config, loading, exporting,
  gastoOpen, gastoEditing, catOpen, catGrupo,
  onMesChange, onRefresh, onExportar,
  onNuevoGasto, onEditarGasto, onEliminarGasto,
  onGuardarGasto, onCerrarGasto,
  onAbrirCategoria, onGuardarCategoria, onCerrarCategoria,
}) {
  const [tab, setTab] = useState("resumen"); // resumen | ingresos | anulaciones | gastos

  const utilidadColor = resumen?.utilidad_neta >= 0 ? "#166534" : "#991b1b";
  const utilidadBg    = resumen?.utilidad_neta >= 0 ? "#f0fdf4" : "#fef2f2";

  return (
    <div style={v.root}>

      {/* MODALES */}
      <GastoModal
        open={gastoOpen}
        editing={gastoEditing}
        config={config}
        onSave={onGuardarGasto}
        onClose={onCerrarGasto}
      />
      <CategoriaModal
        open={catOpen}
        grupo={catGrupo}
        grupos={config?.grupos}
        onSave={onGuardarCategoria}
        onClose={onCerrarCategoria}
      />

      {/* HEADER */}
      <div style={v.header}>
        <div>
          <h1 style={v.title}>Contabilidad</h1>
          <p style={v.subtitle}>Resumen financiero del centro</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={v.btnSecondary} onClick={onRefresh}>↺</button>
          <button style={v.btnSecondary} onClick={onNuevoGasto}>+ Gasto</button>
          <button style={v.btnPrimary} onClick={onExportar} disabled={exporting}>
            {exporting ? "Exportando…" : "⬇ Excel"}
          </button>
        </div>
      </div>

      {/* MES SELECTOR */}
      <div style={v.mesRow}>
        <label style={v.mesLabel}>Mes</label>
        <input
          type="month"
          value={mes}
          onChange={e => onMesChange(e.target.value)}
          style={v.mesInput}
        />
      </div>

      {loading && <div style={v.centered}><div style={v.spinner}/></div>}

      {!loading && resumen && (
        <>
          {/* KPIs */}
          <div style={v.kpiGrid}>
            <KPI label="Ingresos" valor={resumen.ingresos_total}  color="#1e40af" bg="#eff6ff" border="#bfdbfe" />
            <KPI label="Anulaciones" valor={-resumen.anulados_total} color="#991b1b" bg="#fef2f2" border="#fecaca" />
            <KPI label="Gastos" valor={-resumen.gastos_total} color="#854d0e" bg="#fefce8" border="#fde68a" />
            <div style={{ ...v.kpi, background: utilidadBg, borderColor: resumen.utilidad_neta >= 0 ? "#86efac" : "#fecaca" }}>
              <span style={{ ...v.kpiVal, color: utilidadColor, fontSize: 20 }}>{fmt(resumen.utilidad_neta)}</span>
              <span style={v.kpiLbl}>Utilidad neta</span>
            </div>
          </div>

          {/* TABS */}
          <div style={v.tabs}>
            {["resumen", "ingresos", "anulaciones", "gastos"].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{ ...v.tab, ...(tab === t ? v.tabActive : {}) }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* TAB RESUMEN */}
          {tab === "resumen" && (
            <div style={v.card}>
              <p style={v.sectionTitle}>Gastos por grupo</p>
              {Object.entries(resumen.gastos_por_grupo || {}).map(([grupo, total]) => (
                <div key={grupo} style={v.row}>
                  <span style={v.rowLabel}>{grupo}</span>
                  <span style={{ ...v.rowVal, color: "#854d0e" }}>{fmt(-total)}</span>
                </div>
              ))}
              <div style={{ ...v.row, borderTop: "2px solid #e2e8f0", marginTop: 8, paddingTop: 12 }}>
                <span style={{ ...v.rowLabel, fontWeight: 700 }}>Utilidad neta</span>
                <span style={{ ...v.rowVal, color: utilidadColor, fontWeight: 700, fontSize: 16 }}>{fmt(resumen.utilidad_neta)}</span>
              </div>
            </div>
          )}

          {/* TAB INGRESOS */}
          {tab === "ingresos" && (
            <div style={v.card}>
              <p style={v.sectionTitle}>{resumen.ingresos?.length || 0} atenciones · {fmt(resumen.ingresos_total)}</p>
              {resumen.ingresos?.map((ing, i) => (
                <div key={i} style={v.row}>
                  <span style={v.mono}>{ing.fecha} {ing.time}</span>
                  <span style={v.rowLabel}>{ing.tipo}</span>
                  <span style={{ ...v.rowVal, color: "#166534" }}>{ing.es_gratuito ? "Gratis" : fmt(ing.monto)}</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB ANULACIONES */}
          {tab === "anulaciones" && (
            <div style={v.card}>
              <p style={v.sectionTitle}>{resumen.anulados?.length || 0} anulaciones · {fmt(-resumen.anulados_total)}</p>
              {resumen.anulados?.length === 0 && <p style={v.empty}>Sin anulaciones este mes</p>}
              {resumen.anulados?.map((anu, i) => (
                <div key={i} style={{ ...v.row, background: "#fef2f2", borderRadius: 8, padding: "8px 12px" }}>
                  <span style={v.mono}>{anu.fecha} {anu.time}</span>
                  <span style={v.rowLabel}>{anu.tipo} · {anu.motivo}</span>
                  <span style={{ ...v.rowVal, color: "#991b1b" }}>{fmt(anu.monto)}</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB GASTOS */}
          {tab === "gastos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {Object.entries(config?.grupos || {}).map(([grupoKey, grupoData]) => {
                const items = resumen.gastos?.filter(g => g.grupo === grupoData.label) || [];
                return (
                  <div key={grupoKey} style={v.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <p style={v.sectionTitle}>{grupoData.label}</p>
                      <button
                        style={v.btnSmall}
                        onClick={() => onAbrirCategoria(grupoKey)}
                      >
                        + Categoría
                      </button>
                    </div>

                    {items.length === 0 && <p style={v.empty}>Sin gastos registrados</p>}

                    {items.map((gas, i) => (
                      <div key={gas.id} style={v.row}>
                        <div style={{ flex: 1 }}>
                          <span style={v.rowLabel}>{gas.categoria}</span>
                          {gas.descripcion && <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 6 }}>{gas.descripcion}</span>}
                        </div>
                        <span style={{ ...v.rowVal, color: "#854d0e" }}>{fmt(gas.monto)}</span>
                        <button style={v.iconBtn} onClick={() => onEditarGasto({ ...gas, grupo_raw: grupoKey })}>✎</button>
                        <button style={{ ...v.iconBtn, color: "#ef4444" }} onClick={() => onEliminarGasto(gas.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {!loading && !resumen && (
        <div style={v.centered}>
          <span style={{ fontSize: 32 }}>📊</span>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>Sin datos para este mes</p>
        </div>
      )}
    </div>
  );
}

function KPI({ label, valor, color, bg, border }) {
  return (
    <div style={{ ...v.kpi, background: bg, borderColor: border }}>
      <span style={{ ...v.kpiVal, color }}>{fmt(valor)}</span>
      <span style={v.kpiLbl}>{label}</span>
    </div>
  );
}

const v = {
  root:       { fontFamily: "'DM Sans', system-ui", background: "#f1f5f9", minHeight: "100vh", padding: 20 },
  header:     { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  title:      { fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 },
  subtitle:   { fontSize: 13, color: "#64748b", marginTop: 2 },
  btnPrimary: { padding: "8px 16px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', system-ui" },
  btnSecondary: { padding: "8px 14px", background: "#fff", color: "#0f172a", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui" },
  btnSmall:   { padding: "4px 10px", background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui" },
  iconBtn:    { background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#64748b", padding: "0 4px" },
  mesRow:     { display: "flex", alignItems: "center", gap: 10, marginBottom: 20 },
  mesLabel:   { fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" },
  mesInput:   { border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 12px", fontSize: 13, fontFamily: "'DM Sans', system-ui", outline: "none", background: "#fff" },
  kpiGrid:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 },
  kpi:        { display: "flex", flexDirection: "column", gap: 3, padding: "14px 16px", borderRadius: 10, border: "1px solid" },
  kpiVal:     { fontSize: 18, fontWeight: 700 },
  kpiLbl:     { fontSize: 11, color: "#64748b", fontWeight: 500 },
  tabs:       { display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" },
  tab:        { padding: "7px 14px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui" },
  tabActive:  { background: "#0f172a", color: "#fff", borderColor: "#0f172a" },
  card:       { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px", marginBottom: 4 },
  sectionTitle: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b", margin: "0 0 12px 0" },
  row:        { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f1f5f9" },
  rowLabel:   { flex: 1, fontSize: 13, color: "#374151" },
  rowVal:     { fontSize: 13, fontWeight: 700, color: "#0f172a", textAlign: "right" },
  mono:       { fontFamily: "monospace", fontSize: 11, color: "#94a3b8", flexShrink: 0 },
  empty:      { fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "12px 0" },
  centered:   { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: "30vh" },
  spinner:    { width: 24, height: 24, border: "2.5px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
};
                    
