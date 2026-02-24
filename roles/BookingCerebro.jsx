import { useEffect, useMemo, useState } from "react";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaDayController from "../components/agenda/AgendaDayController";
import PatientForm from "../components/patient/PatientForm";
import { useAuth } from "../auth/AuthContext";
import PublicLayout from "../pages/reservas/PublicBookingLayout";

const API_URL = import.meta.env.VITE_API_URL;

export default function BookingCerebro() {
  const { session, login } = useAuth();

  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedDay, setSelectedDay] = useState(null);

  const [patientOpen, setPatientOpen] = useState(false);
  const [pendingSlot, setPendingSlot] = useState(null);

  const [agendaReloadKey, setAgendaReloadKey] = useState(0);

  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState("");

  const apiOk = useMemo(() => typeof API_URL === "string" && API_URL.length > 5, []);

  // 🔐 AUTO LOGIN PUBLICO
  useEffect(() => {
    if (!session) {
      login({
        usuario: "public_web",
        role: {
          name: "public",
          entry: "/reservas",
          allow: ["agenda_public"]
        },
        professional: "system"
      });
    }
  }, [session, login]);

  // =========================
  // LOAD PROFESSIONALS
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadProfessionals() {
      setLoading(true);
      setLoadError("");
      setReserveError("");

      if (!apiOk) {
        if (!cancelled) {
          setProfessionals([]);
          setLoadError("Falta VITE_API_URL (no se puede cargar profesionales).");
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(`${API_URL}/professionals`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (!cancelled) {
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.professionals)
              ? data.professionals
              : [];

          setProfessionals(list.map((p) => ({ id: p.id, name: p.name })));
        }
      } catch (e) {
        if (!cancelled) {
          setProfessionals([]);
          setLoadError("No se pudo cargar la lista de profesionales.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfessionals();
    return () => {
      cancelled = true;
    };
  }, [apiOk]);

  // =========================
  // SLOT CLICK
  // =========================
  function handleAttend(slot) {
    if (reserving) return;
    if (!slot || slot.status !== "available") return;

    setReserveError("");
    setPendingSlot(slot);
    setPatientOpen(true);
  }

  // =========================
  // RESERVA
  // =========================
  async function reserveSlot(rut) {
    if (!pendingSlot) return;
    if (!rut) {
      setReserveError("RUT inválido.");
      return;
    }
    if (!apiOk) {
      setReserveError("Backend no configurado (VITE_API_URL).");
      return;
    }

    const { date, time, professional } = pendingSlot;

    setReserving(true);
    setReserveError("");

    try {
      const res = await fetch(`${API_URL}/agenda/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, professional, rut })
      });

      if (!res.ok) {
        // intenta leer mensaje si viene
        let msg = "No se pudo reservar.";
        try {
          const j = await res.json();
          msg = j?.detail || j?.error || j?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      // ✅ refresca agenda
      setAgendaReloadKey((k) => k + 1);

      // ✅ cierra modal + limpia slot
      setPatientOpen(false);
      setPendingSlot(null);
    } catch (e) {
      setReserveError(e?.message || "Error reservando la hora.");
      // deja pendingSlot para que el usuario pueda reintentar si quiere
    } finally {
      setReserving(false);
    }
  }

  function handleBack() {
    setReserveError("");
    setPendingSlot(null);
    setPatientOpen(false);
    setSelectedDay(null);
  }

  // =========================
  // RENDER
  // =========================
  return (
    <PublicLayout>
      {/* header simple */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Reservas</div>
          <div style={{ fontSize: 13, color: "#475569" }}>
            {selectedDay ? "Selecciona un horario disponible" : "Selecciona día y profesional"}
          </div>
        </div>

        {selectedDay ? (
          <button
            onClick={handleBack}
            style={{
              border: "1px solid #e2e8f0",
              background: "#fff",
              borderRadius: 12,
              padding: "10px 12px",
              cursor: "pointer",
              fontWeight: 700,
              color: "#0f172a"
            }}
          >
            ← Volver
          </button>
        ) : null}
      </div>

      {/* errores */}
      {loadError ? (
        <div
          style={{
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#9a3412",
            padding: 12,
            borderRadius: 12,
            marginBottom: 12,
            fontWeight: 700
          }}
        >
          {loadError}
        </div>
      ) : null}

      {reserveError ? (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: 12,
            borderRadius: 12,
            marginBottom: 12,
            fontWeight: 700
          }}
        >
          {reserveError}
        </div>
      ) : null}

      {!selectedDay ? (
        loading ? (
          <div className="agenda-placeholder">Cargando agenda…</div>
        ) : professionals.length === 0 ? (
          <div className="agenda-placeholder">Sin profesionales disponibles.</div>
        ) : (
          <AgendaSummarySelector professionals={professionals} onSelectDay={setSelectedDay} />
        )
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
            loading={reserving} // si tu PatientForm no usa esto, no rompe; si lo usa, mejor.
            onConfirm={(patient) => reserveSlot(patient?.rut)}
            onCreate={(patient) => reserveSlot(patient?.rut)}
            onCancel={() => {
              if (reserving) return;
              setPendingSlot(null);
              setPatientOpen(false);
              setReserveError("");
            }}
          />
        </>
      )}
    </PublicLayout>
  );
}
