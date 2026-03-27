import { Routes, Route } from "react-router-dom";

import HomeAdmin from "../pages/home/HomeAdmin";
import ContableController from "../components/caja/ContableController";

/*
AdminCerebro — PRODUCCIÓN REAL

✔ Cerebro único del rol admin
✔ SOLO navegación
✔ NO pinta UI
✔ HOME primero
*/

export default function AdminCerebro() {
  return (
    <Routes>

      <Route index element={<HomeAdmin />} />

      <Route
        path="contable"
        element={<ContableController />}
      />

      <Route
        path="profesionales"
        element={<div className="agenda-placeholder">Configuración de profesionales — próximamente</div>}
      />

      <Route
        path="usuarios"
        element={<div className="agenda-placeholder">Usuarios y roles — próximamente</div>}
      />

      <Route
        path="informes"
        element={<div className="agenda-placeholder">Informes clínicos — próximamente</div>}
      />

    </Routes>
  );
}
