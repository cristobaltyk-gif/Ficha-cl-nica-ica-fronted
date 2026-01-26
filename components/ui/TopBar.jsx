import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "../../styles/ui/topbar.css";

/* ===============================
   TÍTULOS POR RUTA (CANÓNICO)
   =============================== */
function getTitle(path) {
  if (path.startsWith("/agenda")) return "Agenda";
  if (path.startsWith("/pacientes")) return "Pacientes";
  if (path.startsWith("/administracion")) return "Administración";
  if (path.startsWith("/secretaria")) return "Secretaría";
  if (path.startsWith("/medico")) return "Médico";
  if (path.startsWith("/kine")) return "Kinesiología";
  if (path.startsWith("/informes")) return "Informes";
  if (path.startsWith("/configuracion")) return "Configuración";
  return "Ficha Clínica";
}

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, role, logout } = useAuth();

  const title = getTitle(location.pathname);

  return (
    <div className="topbar">
      {/* ⬅️ ATRÁS */}
      <button
        className="topbar-btn"
        onClick={() => navigate(-1)}
      >
        ⬅️
      </button>

      {/* CENTRO */}
      <div className="topbar-center">
        <strong>{title}</strong>

        <span className="topbar-user">
          {session?.usuario} · {role?.name}
        </span>
      </div>

      {/* 🚪 SALIR */}
      <button
        className="topbar-btn logout"
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        Salir
      </button>
    </div>
  );
}
