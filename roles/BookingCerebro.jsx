import { useEffect, useMemo, useState } from "react";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaDayController from "../components/agenda/AgendaDayController";
import PatientForm from "../components/patient/PatientForm";
import { useAuth } from "../auth/AuthContext";
import PublicLayout from "../pages/reservas/PublicBookingLayout";
import "../styles/public-booking.css";

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
    <div className="pb-wrap">
      <div className="pb-card">

        <div className="pb-header">
          <div className="pb-title">
            <h1>Reservas</h1>
            <p>
              {selectedDay
                ? "Selecciona un horario disponible"
                : "Selecciona día y profesional"}
            </p>
          </div>

          <div className="pb-actions">
            {selectedDay ? (
              <button className="pb-btn pb-btn-secondary" onClick={handleBack}>
                ← Volver
              </button>
            ) : null}

            <a href="/" className="pb-btn pb-btn-primary">
              Inicio
            </a>
          </div>
        </div>

        <div className="pb-body">
          {loadError ? (
            <div className="pb-alert pb-alert-warn">{loadError}</div>
          ) : null}

          {reserveError ? (
            <div className="pb-alert pb-alert-error">{reserveError}</div>
          ) : null}

          {!selectedDay ? (
            loading ? (
              <div className="agenda-placeholder">Cargando agenda…</div>
            ) : professionals.length === 0 ? (
              <div className="agenda-placeholder">Sin profesionales disponibles.</div>
            ) : (
              <div className="pb-panel">
                <div className="pb-panel-scroll">
                  <AgendaSummarySelector
                    professionals={professionals}
                    onSelectDay={setSelectedDay}
                  />
                </div>
              </div>
            )
          ) : (
            <div className="pb-section">
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
                onConfirm={(patient) => reserveSlot(patient?.rut)}
                onCreate={(patient) => reserveSlot(patient?.rut)}
                onCancel={() => {
                  if (reserving) return;
                  setPendingSlot(null);
                  setPatientOpen(false);
                  setReserveError("");
                }}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  </PublicLayout>
);
