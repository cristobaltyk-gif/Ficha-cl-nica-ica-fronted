import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import HomeAdmin from "../pages/home/HomeAdmin";
import ContableController from "../components/caja/ContableController";
import CajaResumenController from "../components/caja/CajaResumenController";
import EquipoAdmin from "./EquipoAdmin.jsx";
import RRHHController from "../components/rrhh/RRHHController.jsx";
import SuscripcionesAdmin from "./SuscripcionesAdmin.jsx";

const API_URL = import.meta.env.VITE_API_URL;

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
        element={<ContableController />}
      />

      <Route
        path="caja"
        element={<CajaResumenController professionals={professionals} />}
      />

      <Route
        path="equipo"
        element={<EquipoAdmin />}
      />

      <Route
        path="rrhh"
        element={<RRHHController />}
      />

      <Route
        path="suscripciones"
        element={<SuscripcionesAdmin />}
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
