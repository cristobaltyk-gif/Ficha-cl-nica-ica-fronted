import { useLocation, Navigate } from "react-router-dom";
import DashboardAtencion from "../pages/dashboard-atencion.jsx";

/*
MedicoAtencionCerebro — PRODUCCIÓN REAL

✔ Recibe pase desde MedicoCerebro (agenda)
✔ Valida state
✔ NO UI propia
✔ NO lógica clínica
✔ SOLO entrega el mando al dashboard de atención
*/

export default function MedicoAtencionCerebro() {
  const { state } = useLocation();

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
    // acceso inválido → vuelve a agenda médico
    return <Navigate to="/medico/agenda" replace />;
  }

  // =========================
  // ENTREGA DE MANDO
  // =========================
  return (
    <DashboardAtencion
      rut={state.rut}
      date={state.date}
      time={state.time}
      professional={state.professional}
    />
  );
}
