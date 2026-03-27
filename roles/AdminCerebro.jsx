import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import HomeAdmin from "../pages/home/HomeAdmin";
import ContableController from "../components/caja/ContableController";

const API_URL = import.meta.env.VITE_API_URL;

/*
AdminCerebro — PRODUCCIÓN REAL

✔ Cerebro único del rol admin
✔ SOLO navegación
✔ NO pinta UI
✔ HOME primero
*/

export default function AdminCerebro() {
  const navigate = useNavigate();

  const [professionals, setProfessionals] = useState([]);

  useEffect(() => {
    async function loadProfessionals() {
      try {
        const res = await fetch(`${API_URL}/professionals`);
        if (!res.ok) return;
        const data = await res.json();
        setProfessionals(data.map(p => ({ id: p.id, name: p.name })));
      } catch {
        setProfessionals([]);
      }
    }
    loadProfessionals();
  }, []);

  return (
    <Routes>

      <Route index element={<HomeAdmin />} />

      <Route
        path="contable"
        element={<ContableController professionals={professionals} />}
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

      <Route
        path="configuracion"
        element={<div className="agenda-placeholder">Configuración del sistema — próximamente</div>}
      />

    </Routes>
  );
}
