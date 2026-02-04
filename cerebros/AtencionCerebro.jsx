import { useLocation, useNavigate } from "react-router-dom";
import DashboardAtencion from "../pages/dashboard-atencion";

export default function AtencionCerebro() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state;

  // =========================
  // VALIDACIÓN DURA
  // =========================
  if (
    !state ||
    !state.rut ||
    !state.date ||
    !state.time ||
    !state.professional
  ) {
    // ❌ sin contexto → volver a agenda médico
    navigate("/medico/agenda", { replace: true });
    return null;
  }

  // =========================
  // CONTEXTO ATENCIÓN
  // =========================
  const atencionContext = {
    rut: state.rut,
    date: state.date,
    time: state.time,
    professional: state.professional
  };

  // =========================
  // RENDER
  // =========================
  return <DashboardAtencion context={atencionContext} />;
}
