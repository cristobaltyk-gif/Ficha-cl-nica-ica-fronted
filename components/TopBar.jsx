import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "../styles/ui/topbar.css";

export default function TopBar({ title }) {
  const navigate = useNavigate();
  const { role, logout } = useAuth();

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
        <strong>{title || "Ficha Clínica"}</strong>
        <span className="role">
          {role?.name || ""}
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
