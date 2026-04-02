import { useState } from "react";

const AFPS      = ["Capital", "Cuprum", "Habitat", "Modelo", "PlanVital", "Provida", "Uno"];
const CONTRATOS = ["indefinido", "plazo_fijo", "honorarios"];
const CARGOS    = ["Secretaria", "Kinesiólogo", "Personal de aseo", "Guardia", "Recepcionista", "Otro"];

const BONOS_DEFAULT = [
  { nombre: "Bono colación",     monto: 0 },
  { nombre: "Bono movilización", monto: 0 },
];

function fmt(n) {
  if (!n && n !== 0) return "$0";
  const abs = Math.abs(Number(n)).toLocaleString("es-CL");
  return Number(n) < 0 ? `($${abs})` : `$${abs}`;
}

function pct(n) { return `${(Number(n) * 100).toFixed(2)}%`; }

// ======================================================
// MODAL TRABAJADOR
// ======================================================
function TrabajadorModal({ open, editing, onSave, onClose }) {
  const [form, setForm] = useState(() => editing ? {
    ...editing,
    bonos: editing.bonos?.length
      ? editing.bonos
      : BONOS_DEFAULT.map(b => ({ ...b }))
  } : {
    nombre: "", rut: "", cargo: "Secretaria",
    tipo_contrato: "indefinido", sueldo_base: "",
    afp: "Habitat", isapre: false, monto_isapre: 0, activo: true,
    bonos: BONOS_DEFAULT.map(b => ({ ...b }))
  });
  const [error, setError] = useState("");

  if (!open) return null;

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function setBono(idx, monto) {
    setForm(p => {
      const bonos = [...p.bonos];
      bonos[idx] = { ...bonos[idx], monto: Number(monto) || 0 };
      return { ...p, bonos };
    });
  }

  function addBono() {
    setForm(p => ({ ...p, bonos: [...p.bonos, { nombre: "", monto: 0 }] }));
  }

  function removeBono(idx) {
    // Solo se pueden borrar los bonos extras (no los 2 fijos)
    setForm(p => ({ ...p, bonos: p.bonos.filter((_, i) => i !== idx) }));
  }

  function handleSave() {
    if (!form.nombre || !form.rut || !form.sueldo_base) {
      setError("Nombre, RUT y sueldo base son obligatorios"); return;
    }
    onSave({ ...form, sueldo_base: Number(form.sueldo_base), monto_isapre: Number(form.monto_isapre || 0) });
  }

  return (
    <div style={ms.backdrop}>
      <div style={ms.modal}>
        <div style={ms.header}>
          <p style={ms.title}>{editing ? "Editar trabajador" : "Nuevo trabajador"}</p>
        </div>
        <div style={ms.body}>

          <Field label="Nombre *">
            <input style={ms.input} value={form.nombre} onChange={e => set("nombre", e.target.value)} />
          </Field>
          <Field label="RUT *">
            <input style={ms.input} value={form.rut} onChange={e => set("rut", e.target.value)} placeholder="12.345.678-9" />
          </Field>
          <Field label="Cargo">
            <select style={ms.input} value={form.cargo} onChange={e => set("cargo", e.target.value)}>
              {CARGOS.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Tipo contrato">
            <select style={ms.input} value={form.tipo_contrato} onChange={e => set("tipo_contrato", e.target.value)}>
              {CONTRATOS.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Sueldo base *">
            <input style={ms.input} type="number" value={form.sueldo_base}
              onChange={e => set("sueldo_base", e.target.value)} placeholder="0" />
          </Field>

          {form.tipo_contrato !== "honorarios" && (
            <>
              <Field label="AFP">
                <select style={ms.input} value={form.afp} onChange={e => set("afp", e.target.value)}>
                  {AFPS.map(a => <option key={a}>{a}</option>)}
                </select>
              </Field>
              <Field label="Salud">
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <input type="checkbox" checked={form.isapre} onChange={e => set("isapre", e.target.checked)} />
                  Isapre (si no, Fonasa)
                </label>
              </Field>
              {form.isapre && (
                <Field label="Monto Isapre ($)">
                  <input style={ms.input} type="number" value={form.monto_isapre}
                    onChange={e => set("monto_isapre", e.target.value)} />
                </Field>
              )}

              {/* BONOS */}
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <label style={ms.sectionLabel}>Bonos no imponibles</label>
                  <button style={ms.btnAdd} onClick={addBono}>+ Agregar</button>
                </div>

                {form.bonos.map((bono, idx) => (
                  <div key={idx} style={ms.bonoRow}>
                    {/* Los 2 primeros son fijos — solo se edita el monto */}
                    {idx < 2 ? (
                      <span style={ms.bonoNombre}>{bono.nombre}</span>
                    ) : (
                      <input
                        style={{ ...ms.input, flex: 1, marginRight: 8 }}
                        value={bono.nombre}
                        placeholder="Nombre bono"
                        onChange={e => {
                          setForm(p => {
                            const bonos = [...p.bonos];
                            bonos[idx] = { ...bonos[idx], nombre: e.target.value };
                            return { ...p, bonos };
                          });
                        }}
                      />
                    )}
                    <input
                      style={ms.bonoMonto}
                      type="number"
                      value={bono.monto}
                      placeholder="$0"
                      onChange={e => setBono(idx, e.target.value)}
                    />
                    {idx >= 2 && (
                      <button style={ms.btnRemove} onClick={() => removeBono(idx)}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {error && <p style={{ color: "#ef4444", fontSize: 12 }}>{error}</p>}
        </div>
        <div style={ms.footer}>
          <button style={ms.btnCancel} onClick={onClose}>Cancelar</button>
          <button style={ms.btnSave}   onClick={handleSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      {children}
    </div>
  );
}

const ms = {
  backdrop:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16, overflowY: "auto" },
  modal:       { background: "#fff", borderRadius: 14, width: "100%", maxWidth: 420, fontFamily: "'DM Sans', system-ui", maxHeight: "92vh", overflowY: "auto" },
  header:      { background: "#0f172a", padding: "16px 20px", borderRadius: "14px 14px 0 0", position: "sticky", top: 0, zIndex: 1 },
  title:       { color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 },
  body:        { padding: "20px", display: "flex", flexDirection: "column", gap: 14 },
  input:       { border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "'DM Sans', system-ui", outline: "none", width: "100%" },
  footer:      { display: "flex", gap: 10, padding: "14px 20px", borderTop: "1px solid #f1f5f9", position: "sticky", bottom: 0, background: "#fff", zIndex: 1 },
  btnCancel:   { flex: 1, padding: 10, border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui" },
  btnSave:     { flex: 2, padding: 10, border: "none", borderRadius: 8, background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', system-ui" },
  sectionLabel: { fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" },
  btnAdd:      { padding: "4px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", color: "#475569", fontFamily: "'DM Sans', system-ui" },
  bonoRow:     { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  bonoNombre:  { flex: 1, fontSize: 13, color: "#374151" },
  bonoMonto:   { width: 100, border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 10px", fontSize: 13, fontFamily: "'DM Sans', system-ui", outline: "none", textAlign: "right" },
  btnRemove:   { background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13, padding: "0 4px" },
};

// ======================================================
// MAIN VIEW
// ======================================================
export default function RRHHView({
  mes, tab, trabajadores, liquidaciones, tasas, loading,
  exporting, registrando, trabajadorOpen, trabajadorEditing,
  onMesChange, onTabChange,
  onNuevoTrabajador, onEditarTrabajador, onEliminarTrabajador,
  onGuardarTrabajador, onCerrarTrabajador,
  onDescargarPDF, onExportarExcel, onRegistrarGasto, onGuardarTasas, onRefresh
}) {
  const [tasasEdit, setTasasEdit] = useState(false);
  const [tasasForm, setTasasForm] = useState(null);

  return (
    <div style={v.root}>

      <TrabajadorModal
        open={trabajadorOpen}
        editing={trabajadorEditing}
        onSave={onGuardarTrabajador}
        onClose={onCerrarTrabajador}
      />

      {/* HEADER */}
      <div style={v.header}>
        <div>
          <h1 style={v.title}>Remuneraciones</h1>
          <p style={v.subtitle}>Gestión de sueldos y leyes sociales</p>
        </div>
        <button style={v.btnPrimary} onClick={onNuevoTrabajador}>+ Trabajador</button>
      </div>

      {/* TABS */}
      <div style={v.tabs}>
        {["trabajadores", "liquidaciones", "tasas"].map(t => (
          <button key={t} onClick={() => onTabChange(t)}
            style={{ ...v.tab, ...(tab === t ? v.tabActive : {}) }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* TAB TRABAJADORES */}
      {tab === "trabajadores" && (
        <div style={v.card}>
          <p style={v.sectionTitle}>{trabajadores.length} trabajadores registrados</p>
          {trabajadores.length === 0 && <p style={v.empty}>Sin trabajadores registrados</p>}
          {trabajadores.map(t => (
            <div key={t.id} style={v.row}>
              <div style={v.avatar}>{t.nombre.charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <p style={v.rowName}>{t.nombre}</p>
                <p style={v.rowMeta}>
                  {t.cargo} · {t.tipo_contrato.replace("_"," ")} · {fmt(t.sueldo_base)}
                  {t.bonos?.some(b => b.monto > 0) && (
                    <span style={{ color: "#16a34a", marginLeft: 6 }}>
                      + bonos {fmt(t.bonos.reduce((s, b) => s + (b.monto||0), 0))}
                    </span>
                  )}
                </p>
              </div>
              {!t.activo && <span style={v.badge}>Inactivo</span>}
              <button style={v.iconBtn} onClick={() => onEditarTrabajador(t)}>✎</button>
              <button style={{ ...v.iconBtn, color: "#ef4444" }} onClick={() => onEliminarTrabajador(t.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* TAB LIQUIDACIONES */}
      {tab === "liquidaciones" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={v.mesRow}>
            <label style={v.mesLabel}>Mes</label>
            <input type="month" value={mes} onChange={e => onMesChange(e.target.value)} style={v.mesInput} />
            <button style={v.btnSecondary} onClick={onRefresh}>↺</button>
            <button style={v.btnSecondary} onClick={onExportarExcel} disabled={exporting}>
              {exporting ? "…" : "⬇ Excel"}
            </button>
            <button style={v.btnPrimary} onClick={onRegistrarGasto} disabled={registrando}>
              {registrando ? "…" : "→ Contable"}
            </button>
          </div>

          {loading && <div style={v.centered}><div style={v.spinner}/></div>}

          {!loading && liquidaciones && (
            <>
              <div style={v.kpiGrid}>
                <KPI label="Trabajadores"     val={liquidaciones.trabajadores}          color="#1e40af" bg="#eff6ff" />
                <KPI label="Total líquido"    val={fmt(liquidaciones.total_liquidos)}    color="#166534" bg="#f0fdf4" />
                <KPI label="Total descuentos" val={fmt(liquidaciones.total_descuentos)}  color="#991b1b" bg="#fef2f2" />
                <KPI label="Costo empresa"    val={fmt(liquidaciones.total_costo_empresa)} color="#1e40af" bg="#eff6ff" />
              </div>

              {liquidaciones.liquidaciones.map(liq => (
                <div key={liq.trabajador_id} style={v.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <p style={v.rowName}>{liq.nombre}</p>
                      <p style={v.rowMeta}>{liq.cargo} · {liq.tipo_contrato.replace("_"," ")}</p>
                    </div>
                    <button style={v.btnSmall} onClick={() => onDescargarPDF(liq.trabajador_id)}>PDF</button>
                  </div>

                  {liq.es_honorarios ? (
                    <>
                      <LiqRow label="Monto bruto"       val={fmt(liq.sueldo_base)} />
                      <LiqRow label="Retención 10.75%"  val={fmt(-liq.retencion_boleta)} color="red" />
                      <LiqRow label="Líquido a pagar"   val={fmt(liq.liquido)} color="green" bold />
                    </>
                  ) : (
                    <>
                      <LiqRow label="Sueldo base"        val={fmt(liq.sueldo_base)} />
                      {liq.bonos?.filter(b => b.monto > 0).map((b, i) => (
                        <LiqRow key={i} label={b.nombre} val={fmt(b.monto)} color="green" />
                      ))}
                      <LiqRow label={`AFP (${liq.afp})`} val={fmt(-liq.descuento_afp)} color="red" />
                      <LiqRow label="Salud"              val={fmt(-liq.descuento_salud)} color="red" />
                      <LiqRow label="AFC trabajador"     val={fmt(-liq.descuento_afc)} color="red" />
                      <LiqRow label="Impuesto único"     val={fmt(-liq.impuesto_unico)} color="red" />
                      <div style={{ borderTop: "1px solid #e2e8f0", margin: "6px 0" }}/>
                      <LiqRow label="Sueldo líquido"     val={fmt(liq.liquido)} color="green" bold />
                      <LiqRow label="Costo empresa"      val={fmt(liq.costo_empresa)} color="blue" bold />
                    </>
                  )}
                </div>
              ))}
            </>
          )}

          {!loading && !liquidaciones && (
            <div style={v.centered}>
              <p style={{ color: "#94a3b8", fontSize: 14 }}>Sin trabajadores activos</p>
            </div>
          )}
        </div>
      )}

      {/* TAB TASAS */}
      {tab === "tasas" && tasas && (
        <div style={v.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={v.sectionTitle}>Tasas legales vigentes</p>
            {!tasasEdit
              ? <button style={v.btnSecondary} onClick={() => { setTasasForm(JSON.parse(JSON.stringify(tasas))); setTasasEdit(true); }}>Editar</button>
              : <div style={{ display: "flex", gap: 8 }}>
                  <button style={v.btnSecondary} onClick={() => setTasasEdit(false)}>Cancelar</button>
                  <button style={v.btnPrimary} onClick={() => { onGuardarTasas(tasasForm); setTasasEdit(false); }}>Guardar</button>
                </div>
            }
          </div>

          <p style={{ ...v.sectionTitle, marginBottom: 8 }}>AFP — tasa trabajador</p>
          {Object.entries(tasas.afp || {}).map(([afp, tasa]) => (
            <div key={afp} style={v.row}>
              <span style={{ ...v.rowLabel, textTransform: "capitalize" }}>{afp}</span>
              {tasasEdit
                ? <input style={{ ...ms.bonoMonto }} type="number" step="0.0001"
                    value={tasasForm.afp[afp]}
                    onChange={e => setTasasForm(p => ({ ...p, afp: { ...p.afp, [afp]: Number(e.target.value) } }))} />
                : <span style={v.rowVal}>{pct(tasa)}</span>
              }
            </div>
          ))}

          <p style={{ ...v.sectionTitle, marginTop: 16, marginBottom: 8 }}>Otras tasas</p>
          {[
            ["sis",                        "SIS (empleador)"],
            ["salud_trabajador",           "Salud trabajador"],
            ["afc_trabajador_indefinido",  "AFC trab. indefinido"],
            ["afc_trabajador_plazo_fijo",  "AFC trab. plazo fijo"],
            ["afc_empleador_indefinido",   "AFC emp. indefinido"],
            ["afc_empleador_plazo_fijo",   "AFC emp. plazo fijo"],
            ["mutual",                     "Mutual (empleador)"],
          ].map(([key, label]) => (
            <div key={key} style={v.row}>
              <span style={v.rowLabel}>{label}</span>
              {tasasEdit
                ? <input style={ms.bonoMonto} type="number" step="0.0001"
                    value={tasasForm[key]}
                    onChange={e => setTasasForm(p => ({ ...p, [key]: Number(e.target.value) }))} />
                : <span style={v.rowVal}>{pct(tasas[key])}</span>
              }
            </div>
          ))}

          <div style={v.row}>
            <span style={v.rowLabel}>UTM vigente</span>
            {tasasEdit
              ? <input style={ms.bonoMonto} type="number"
                  value={tasasForm.utm}
                  onChange={e => setTasasForm(p => ({ ...p, utm: Number(e.target.value) }))} />
              : <span style={v.rowVal}>{fmt(tasas.utm)}</span>
            }
          </div>
        </div>
      )}
    </div>
  );
}

function KPI({ label, val, color, bg }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: "14px 16px", borderRadius: 10, background: bg, border: "1px solid #e2e8f0" }}>
      <span style={{ fontSize: 18, fontWeight: 700, color }}>{val}</span>
      <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function LiqRow({ label, val, color, bold }) {
  const c = color === "red" ? "#991b1b" : color === "green" ? "#166534" : color === "blue" ? "#1e40af" : "#0f172a";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f8fafc" }}>
      <span style={{ fontSize: 12, color: "#475569" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: bold ? 700 : 500, color: c }}>{val}</span>
    </div>
  );
}

const v = {
  root:         { fontFamily: "'DM Sans', system-ui", background: "#f1f5f9", minHeight: "100vh", padding: 20 },
  header:       { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  title:        { fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 },
  subtitle:     { fontSize: 13, color: "#64748b", marginTop: 2 },
  btnPrimary:   { padding: "8px 16px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', system-ui" },
    btnSecondary: { padding: "8px 14px", background: "#fff", color: "#0f172a", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui" },
  btnSmall:     { padding: "4px 10px", background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui" },
  iconBtn:      { background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#64748b", padding: "0 4px" },
  tabs:         { display: "flex", gap: 4, marginBottom: 16 },
  tab:          { padding: "7px 16px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui" },
  tabActive:    { background: "#0f172a", color: "#fff", borderColor: "#0f172a" },
  card:         { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 4 },
  sectionTitle: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b", margin: "0 0 8px 0" },
  row:          { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f8fafc" },
  rowName:      { fontSize: 13.5, fontWeight: 600, color: "#0f172a", margin: 0 },
  rowMeta:      { fontSize: 11.5, color: "#94a3b8", margin: 0 },
  rowLabel:     { flex: 1, fontSize: 13, color: "#374151" },
  rowVal:       { fontSize: 13, fontWeight: 600, color: "#0f172a" },
  avatar:       { width: 36, height: 36, borderRadius: "50%", background: "#0f172a", color: "#fff", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  badge:        { fontSize: 10, background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: 99, padding: "2px 8px" },
  mesRow:       { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  mesLabel:     { fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" },
  mesInput:     { border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 12px", fontSize: 13, fontFamily: "'DM Sans', system-ui", outline: "none", background: "#fff" },
  kpiGrid:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  centered:     { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "20vh" },
  spinner:      { width: 24, height: 24, border: "2.5px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
  empty:        { fontSize: 13, color: "#94a3b8", textAlign: "center", padding: 16 },
};

