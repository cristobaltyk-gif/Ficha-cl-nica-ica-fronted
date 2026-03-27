import "../../styles/home/home-secretaria.css";
import { useNavigate } from "react-router-dom";

export default function HomeAdmin() {
  const navigate = useNavigate();

  return (
    <div className="home-secretaria">
      <header className="home-header">
        <h1>Administración</h1>
        <p>Panel de gestión del centro médico</p>
      </header>

      <section className="home-grid">

        <button
          className="home-card"
          onClick={() => navigate("contable")}
          aria-label="Contable"
        >
          <span className="icon">📊</span>
          <span className="title">Contable</span>
          <span className="desc">Resumen mensual de pagos</span>
        </button>

        <button
          className="home-card"
          onClick={() => navigate("profesionales")}
          aria-label="Profesionales"
        >
          <span className="icon">🩺</span>
          <span className="title">Profesionales</span>
          <span className="desc">Agenda y horarios</span>
        </button>

        <button
          className="home-card"
          onClick={() => navigate("usuarios")}
          aria-label="Usuarios"
        >
          <span className="icon">👤</span>
          <span className="title">Usuarios</span>
          <span className="desc">Roles y accesos</span>
        </button>

        <button
          className="home-card"
          onClick={() => navigate("informes")}
          aria-label="Informes"
        >
          <span className="icon">📋</span>
          <span className="title">Informes</span>
          <span className="desc">Informes clínicos</span>
        </button>

        <button
          className="home-card"
          onClick={() => navigate("configuracion")}
          aria-label="Configuración"
        >
          <span className="icon">⚙️</span>
          <span className="title">Configuración</span>
          <span className="desc">Parámetros del sistema</span>
        </button>

      </section>
    </div>
  );
}
