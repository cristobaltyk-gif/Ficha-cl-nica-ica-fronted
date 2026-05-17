import { useEffect, useMemo, useState } from "react";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaDayController from "../components/agenda/AgendaDayController";
import PatientForm from "../components/patient/PatientForm";
import { useAuth } from "../auth/AuthContext";
import PublicLayout from "../pages/reservas/PublicBookingLayout";
import { resolverRegion } from "../utils/geo";

const API_URL       = import.meta.env.VITE_API_URL;
const PREDIAG_FRONT = "https://app.icarticular.cl";

function getScope() {
  const parts = window.location.hostname.split(".");
  if (parts.length >= 4) return parts[0];
  return "ica";
}

function getDrFromURL() {
  try {
    return new URLSearchParams(window.location.search).get("dr") || null;
  } catch {
    return null;
  }
}

function prediagLink(nombre, rut, edad, genero) {
  const params = new URLSearchParams({ origen: "reserva", nombre: nombre || "", rut: rut || "" });
  if (edad)   params.set("edad",   String(edad));
  if (genero) params.set("genero", genero);
  return `${PREDIAG_FRONT}?${params.toString()}`;
}

function BannerPrediagnostico() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)",
      border: "1px solid #bfdbfe",
      borderRadius: 16,
      padding: "18px 20px",
      marginBottom: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1e3a5f", marginBottom: 4 }}>
          🩺 ¿Quiere llegar preparado a su consulta?
        </div>
        <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
          Nuestro asistente IA sugiere exámenes según sus síntomas,<br />
          validados por su médico. Opcional y con costo.
        </div>
      </div>
      <a
        href={PREDIAG_FRONT}
        target="_blank"
        rel="noreferrer"
        style={{
          background: "#1d4ed8", color: "#fff",
          padding: "10px 18px", borderRadius: 10,
          fontSize: 13, fontWeight: 700,
          textDecoration: "none", whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Ver prediagnóstico IA →
      </a>
    </div>
  );
}

function BannerGPS({ onReintentar }) {
  return (
    <div style={{
      background: "#fffbeb",
      border: "1px solid #fde68a",
      borderRadius: 16,
      padding: "20px 20px",
      marginBottom: 20,
      textAlign: "center",
    }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>📍</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#92400e", marginBottom: 6 }}>
        Necesitamos tu ubicación
      </div>
      <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.6, marginBottom: 16 }}>
        Para mostrarte los profesionales disponibles en tu área,
        activa el acceso a tu ubicación en el navegador y vuelve a intentarlo.
      </div>
      <button
        onClick={onReintentar}
        style={{
          background: "#d97706", color: "#fff", border: "none",
          borderRadius: 10, padding: "10px 20px",
          fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}
      >
        Reintentar
      </button>
    </div>
  );
}

function ModalPrediagnostico({ nombre, rut, edad, genero, onClose }) {
  const url = prediagLink(nombre, rut, edad, genero);
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 440, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🩺</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
          ¿Quiere llegar preparado a su consulta?
        </div>
        <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 20 }}>
          Nuestro asistente IA puede sugerirle los exámenes que necesitará,
          validados por su médico. Ahorre tiempo y llegue listo.
        </div>
        <ul style={{ listStyle: "none", padding: 0, marginBottom: 20 }}>
          {[
            "✓ Diagnóstico presuntivo con IA",
            "✓ Orden de exámenes firmada digitalmente",
            "✓ Validada por su médico en la consulta",
            "✓ Ahorre tiempo el día de su cita",
          ].map((item) => (
            <li key={item} style={{ fontSize: 13, color: "#334155", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
              {item}
            </li>
          ))}
        </ul>
        <button
          style={{ background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%", marginBottom: 10 }}
          onClick={() => { window.open(url, "_blank"); onClose(); }}
        >
          Iniciar prediagnóstico IA →
        </button>
        <button
          style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 12, padding: "11px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", color: "#475569" }}
          onClick={onClose}
        >
          No por ahora
        </button>
      </div>
    </div>
  );
}

export default function BookingCerebro() {
  const { session, login } = useAuth();

  const [professionals,   setProfessionals]   = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [loadError,       setLoadError]       = useState("");
  const [selectedDay,     setSelectedDay]     = useState(null);
  const [patientOpen,     setPatientOpen]     = useState(false);
  const [pendingSlot,     setPendingSlot]     = useState(null);
  const [agendaReloadKey, setAgendaReloadKey] = useState(0);
  const [reserving,       setReserving]       = useState(false);
  const [reserveError,    setReserveError]    = useState("");
  const [region,          setRegion]          = useState(undefined);
  const [gpsRequerido,    setGpsRequerido]    = useState(false);
  const [geoKey,          setGeoKey]          = useState(0);

  const [showPrediag, setShowPrediag] = useState(false);
  const [lastPatient, setLastPatient] = useState(null);

  const drFromURL = useMemo(() => getDrFromURL(), []);
  const apiOk     = useMemo(() => typeof API_URL === "string" && API_URL.length > 5, []);

  useEffect(() => {
    if (!session) {
      login({
        usuario: "public_web",
        role: { name: "public", entry: "/reservas", allow: ["agenda_public"] },
        professional: "system",
      });
    }
  }, [session, login]);

  useEffect(() => {
    if (!apiOk) { setRegion(null); return; }
    setRegion(undefined);
    setGpsRequerido(false);
    resolverRegion(API_URL).then(({ ok, region, gpsRequerido }) => {
      if (ok) {
        setRegion(region || null);
        setGpsRequerido(false);
      } else {
        setRegion(null);
        setGpsRequerido(gpsRequerido);
      }
    });
  }, [apiOk, geoKey]);

  useEffect(() => {
    if (region === undefined) return;
    if (gpsRequerido) return;
    let cancelled = false;

    async function loadProfessionals() {
      setLoading(true); setLoadError(""); setReserveError("");
      if (!apiOk) {
        if (!cancelled) { setProfessionals([]); setLoadError("Falta VITE_API_URL."); setLoading(false); }
        return;
      }
      try {
        const scope  = getScope();
        const params = new URLSearchParams({ public: "true", scope });
        if (region) params.set("region", region);

        const res  = await fetch(`${API_URL}/professionals?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!cancelled) {
          const list = Array.isArray(data) ? data : Array.isArray(data?.professionals) ? data.professionals : [];
          setProfessionals(list.map((p) => ({
            id:        p.id,
            name:      p.name,
            role:      p.role,
            specialty: p.specialty,
          })));
        }
      } catch {
        if (!cancelled) { setProfessionals([]); setLoadError("No se pudo cargar la lista de profesionales."); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfessionals();
    return () => { cancelled = true; };
  }, [apiOk, region, gpsRequerido]);

  function handleAttend(slot) {
    if (reserving || !slot || slot.status !== "available") return;
    setReserveError("");
    setPendingSlot(slot);
    setPatientOpen(true);
  }

  async function reserveSlot(rut) {
    if (!pendingSlot) return;
    if (!rut) { setReserveError("RUT inválido."); return; }
    if (!apiOk) { setReserveError("Backend no configurado (VITE_API_URL)."); return; }

    const { date, time, professional } = pendingSlot;
    setReserving(true); setReserveError("");

    try {
      const res = await fetch(`${API_URL}/agenda/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, professional, rut }),
      });

      if (!res.ok) {
        let msg = "No se pudo reservar.";
        try { const j = await res.json(); msg = j?.detail || j?.error || j?.message || msg; } catch {}
        throw new Error(msg);
      }

      setAgendaReloadKey((k) => k + 1);
      setPatientOpen(false);
      setPendingSlot(null);
      setLastPatient({ rut });
      setShowPrediag(true);

    } catch (e) {
      setReserveError(e?.message || "Error reservando la hora.");
    } finally {
      setReserving(false);
    }
  }

  function handleBack() {
    setReserveError(""); setPendingSlot(null);
    setPatientOpen(false); setSelectedDay(null);
  }

  return (
    <PublicLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Reservas</div>
          <div style={{ fontSize: 13, color: "#475569" }}>
            {selectedDay ? "Selecciona un horario disponible" : "Selecciona día y profesional"}
          </div>
        </div>
        {selectedDay && (
          <button onClick={handleBack} style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 12, padding: "10px 12px", cursor: "pointer", fontWeight: 700, color: "#0f172a" }}>
            ← Volver
          </button>
        )}
      </div>

      {loadError && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", padding: 12, borderRadius: 12, marginBottom: 12, fontWeight: 700 }}>
          {loadError}
        </div>
      )}
      {reserveError && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: 12, borderRadius: 12, marginBottom: 12, fontWeight: 700 }}>
          {reserveError}
        </div>
      )}

      {!selectedDay ? (
        <>
          <BannerPrediagnostico />
          {gpsRequerido ? (
            <BannerGPS onReintentar={() => setGeoKey(k => k + 1)} />
          ) : region === undefined || loading ? (
            <div className="agenda-placeholder">Cargando agenda…</div>
          ) : professionals.length === 0 ? (
            <div className="agenda-placeholder">Sin profesionales disponibles en su área.</div>
          ) : (
            <AgendaSummarySelector
              professionals={professionals}
              onSelectDay={setSelectedDay}
              preselectedId={drFromURL}
            />
          )}
        </>
      ) : (
        <>
          <AgendaDayController
            key={agendaReloadKey}
            professional={selectedDay.professional}
            date={selectedDay.date}
            role="PUBLIC"
            onAttend={handleAttend}
          />
          <PatientForm
            open={patientOpen}
            loading={reserving}
            onConfirm={(patient) => reserveSlot(patient.rut)}
            onCreate={(patient)  => reserveSlot(patient.rut)}
            onCancel={() => {
              if (reserving) return;
              setPendingSlot(null); setPatientOpen(false); setReserveError("");
            }}
          />
        </>
      )}

      {showPrediag && (
        <ModalPrediagnostico
          nombre={lastPatient?.nombre}
          rut={lastPatient?.rut}
          edad={lastPatient?.edad}
          genero={lastPatient?.genero}
          onClose={() => setShowPrediag(false)}
        />
      )}
    </PublicLayout>
  );
}
