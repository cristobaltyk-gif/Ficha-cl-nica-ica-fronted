/**
 * roles/SuscripcionForm.jsx
 */
import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const PRECIOS_ROL = { medico: 30000, kine: 25000, psicologo: 30000, secretaria: 20000, admin: 20000 };
const PRECIOS_EXTERNO = { externo_base: 35000, externo_completo: 50000 };

function fmt(n) { return `$${Number(n || 0).toLocaleString("es-CL")}`; }

function estadoBadge(estado) {
  const cfg = {
    activo:    { bg: "#f0fdf4", color: "#16a34a", label: "Activo" },
    vencido:   { bg: "#fef2f2", color: "#dc2626", label: "Vencido" },
    suspendido:{ bg: "#f8fafc", color: "#64748b", label: "Suspendido" },
  };
  const c = cfg[estado] || cfg.suspendido;
  return (
    <span style={{ background: c.bg, color: c.color, borderRadius: 20,
      padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
      {c.label}
    </span>
  );
}

export default function SuscripcionForm({ centroId, nombre, rol, onDone, onSkip }) {
  const { session } = useAuth();
  const internalUser = session?.usuario;

  const [suscripcion, setSuscripcion] = useState(null);
  const [loadingSus,  setLoadingSus]  = useState(true);

  const [plan,       setPlan]       = useState("externo_base");
  const [email,      setEmail]      = useState("");
  const [metodo,     setMetodo]     = useState("manual");
  const [descPct,    setDescPct]    = useState(0);
  const [descMotivo, setDescMotivo] = useState("");
  const [descHasta,  setDescHasta]  = useState("");

  const [editDesc,   setEditDesc]   = useState(false);
  const [dPct,       setDPct]       = useState(0);
  const [dMotivo,    setDMotivo]    = useState("");
  const [dHasta,     setDHasta]     = useState("");

  const [saving,   setSaving]   = useState(false);
  const [cobrando, setCobrando] = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(null);
  const [linkPago, setLinkPago] = useState(null);

  const authHeaders = {
    "Content-Type": "application/json",
    "X-Internal-User": internalUser,
  };

  useEffect(() => { cargarSuscripcion(); }, [centroId]);

  async function cargarSuscripcion() {
    setLoadingSus(true);
    try {
      const res = await fetch(`${API_URL}/api/suscripciones/${centroId}`,
        { headers: { "X-Internal-User": internalUser } });
      if (res.ok) setSuscripcion(await res.json());
      else setSuscripcion(null);
    } catch { setSuscripcion(null); }
    finally { setLoadingSus(false); }
  }

  function precioBase() {
    return PRECIOS_EXTERNO[plan] || PRECIOS_ROL[rol] || 35000;
  }

  function precioFinal() {
    return Math.round(precioBase() * (1 - descPct / 100));
  }

  async function handleCrear() {
    setError(null); setSaving(true);
    try {
      if (!email) { setError("Email obligatorio"); return; }
      const res = await fetch(`${API_URL}/api/suscripciones`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          centro_id: centroId, nombre_centro: nombre, plan,
          roles: {}, email_contacto: email,
          metodo_pago: metodo, descuento_pct: descPct,
          descuento_motivo: descMotivo, descuento_hasta: descHasta || null,
        })
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Error");
      const data = await res.json();
      if (data.link_pago) setLinkPago(data.link_pago);
      else { await cargarSuscripcion(); setSuccess("✅ Suscripción creada"); }
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleCobrar() {
    setCobrando(true); setError(null); setSuccess(null);
    try {
      const res = await fetch(`${API_URL}/api/suscripciones/${centroId}/cobrar`, {
        method: "POST",
        headers: { "X-Internal-User": internalUser }
      });
      const data = await res.json();
      if (data.link_pago) {
        setLinkPago(data.link_pago);
      } else {
        setSuccess("✅ Cobro automático enviado");
        await cargarSuscripcion();
      }
    } catch { setError("Error al cobrar"); }
    finally { setCobrando(false); }
  }

  async function handleGuardarDescuento() {
    setSaving(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/api/suscripciones/${centroId}/descuento`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ descuento_pct: dPct, descuento_motivo: dMotivo, descuento_hasta: dHasta || null })
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Error");
      setEditDesc(false);
      setSuccess("✅ Descuento actualizado");
      await cargarSuscripcion();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  if (linkPago) return (
    <div>
      <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <p style={{ margin: "0 0 8px", fontWeight: 700, color: "#166534" }}>✅ Link de pago generado</p>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#475569" }}>Comparte este link con {nombre}:</p>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8,
          padding: "8px 10px", fontSize: 11, wordBreak: "break-all", marginBottom: 12 }}>
          {linkPago}
        </div>
        <button className="ea-btn-primary" style={{ fontSize: 12, padding: "8px 14px" }}
          onClick={() => navigator.clipboard.writeText(linkPago).catch(() => {})}>
          Copiar link
        </button>
      </div>
      {onDone && <button className="ea-btn-secondary" style={{ width: "100%" }} onClick={onDone}>Finalizar</button>}
    </div>
  );

  if (loadingSus) return <p className="ea-empty">Cargando suscripción…</p>;

  if (suscripcion) {
    const diasRestantes = suscripcion.fecha_vencimiento
      ? Math.ceil((new Date(suscripcion.fecha_vencimiento) - new Date()) / 86400000)
      : null;

    return (
      <div>
        {error   && <div className="ea-error">{error}</div>}
        {success && <div className="ea-success">{success}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{suscripcion.plan}</span>
          {estadoBadge(suscripcion.estado)}
        </div>

        <div className="ea-field">
          <p className="ea-field-label">Precio mensual</p>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1e3a8a" }}>
            {fmt(suscripcion.precio_final)}/mes
            {suscripcion.descuento_pct > 0 && (
              <span style={{ fontSize: 11, color: "#16a34a", marginLeft: 6 }}>({suscripcion.descuento_pct}% dto)</span>
            )}
          </p>
        </div>

        {diasRestantes !== null && (
          <div className="ea-field">
            <p className="ea-field-label">Vencimiento</p>
            <p style={{ margin: 0, fontSize: 13, color: diasRestantes <= 3 ? "#dc2626" : "#475569" }}>
              {suscripcion.fecha_vencimiento} ({diasRestantes} días)
            </p>
          </div>
        )}

        {suscripcion.descuento_hasta && (
          <div className="ea-field">
            <p className="ea-field-label">Descuento vigente hasta</p>
            <p style={{ margin: 0, fontSize: 13, color: "#f97316" }}>
              {suscripcion.descuento_hasta} — {suscripcion.descuento_motivo}
            </p>
          </div>
        )}

        <hr className="ea-divider" />

        {editDesc ? (
          <div>
            <div className="ea-field">
              <p className="ea-field-label">Descuento (%)</p>
              <input className="ea-input" type="number" min={0} max={100} value={dPct}
                onChange={e => setDPct(Number(e.target.value))} />
            </div>
            <div className="ea-field">
              <p className="ea-field-label">Motivo</p>
              <input className="ea-input" value={dMotivo} onChange={e => setDMotivo(e.target.value)} />
            </div>
            <div className="ea-field">
              <p className="ea-field-label">Válido hasta</p>
              <input className="ea-input" type="date" value={dHasta} onChange={e => setDHasta(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ea-btn-primary" style={{ flex: 1, fontSize: 12 }}
                onClick={handleGuardarDescuento} disabled={saving}>
                {saving ? "Guardando…" : "Guardar descuento"}
              </button>
              <button className="ea-btn-secondary" style={{ fontSize: 12 }} onClick={() => setEditDesc(false)}>Cancelar</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="ea-btn-primary" style={{ fontSize: 12, padding: "8px 14px" }}
              onClick={handleCobrar} disabled={cobrando}>
              {cobrando ? "…" : "💳 Cobrar ahora"}
            </button>
            <button className="ea-btn-secondary" style={{ fontSize: 12, padding: "8px 14px" }}
              onClick={() => {
                setDPct(suscripcion.descuento_pct || 0);
                setDMotivo(suscripcion.descuento_motivo || "");
                setDHasta(suscripcion.descuento_hasta || "");
                setEditDesc(true);
              }}>
              🏷️ Descuento
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {error && <div className="ea-error">{error}</div>}

      <div className="ea-field">
        <p className="ea-field-label">Plan</p>
        <select className="ea-input" value={plan} onChange={e => setPlan(e.target.value)}>
          <option value="externo_base">Base — {fmt(PRECIOS_EXTERNO.externo_base)}/mes (agenda + fichas + caja)</option>
          <option value="externo_completo">Completo — {fmt(PRECIOS_EXTERNO.externo_completo)}/mes (+ contabilidad + RRHH)</option>
        </select>
      </div>

      <div className="ea-field">
        <p className="ea-field-label">Email de contacto *</p>
        <input className="ea-input" type="email" value={email}
          placeholder="correo@dominio.cl" onChange={e => setEmail(e.target.value)} />
      </div>

      <div className="ea-field">
        <p className="ea-field-label">Descuento (%)</p>
        <input className="ea-input" type="number" min={0} max={100} value={descPct}
          onChange={e => setDescPct(Number(e.target.value))} />
      </div>

      {descPct > 0 && (
        <>
          <div className="ea-field">
            <p className="ea-field-label">Motivo descuento</p>
            <input className="ea-input" value={descMotivo} onChange={e => setDescMotivo(e.target.value)} />
          </div>
          <div className="ea-field">
            <p className="ea-field-label">Válido hasta</p>
            <input className="ea-input" type="date" value={descHasta} onChange={e => setDescHasta(e.target.value)} />
          </div>
        </>
      )}

      <div className="ea-field">
        <p className="ea-field-label">Método de cobro</p>
        <select className="ea-input" value={metodo} onChange={e => setMetodo(e.target.value)}>
          <option value="manual">Manual — link de pago por email</option>
          <option value="automatico">Automático — tarjeta guardada</option>
        </select>
      </div>

      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10,
        padding: "10px 14px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "#475569" }}>Precio base</span>
          <span style={{ fontWeight: 600 }}>{fmt(precioBase())}/mes</span>
        </div>
        {descPct > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#16a34a" }}>
            <span>Descuento {descPct}%</span>
            <span>-{fmt(precioBase() - precioFinal())}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800,
          color: "#1e3a8a", borderTop: "1px solid #bfdbfe", marginTop: 6, paddingTop: 6 }}>
          <span>Total mensual</span>
          <span>{fmt(precioFinal())}/mes</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="ea-btn-primary" style={{ flex: 1 }} onClick={handleCrear} disabled={saving}>
          {saving ? "Creando…" : "Activar suscripción"}
        </button>
        {onSkip && <button className="ea-btn-secondary" onClick={onSkip}>Omitir</button>}
      </div>
    </div>
  );
}
