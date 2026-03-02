import "../styles/pacientes/dashboard-pacientes.css";

export default function DashboardPacientes({
  title = "Pacientes",
  subtitle,
  actions,
  children
}) {
  return (
    <div className="dashboard-pacientes-wrapper">
      <div className="dashboard-pacientes-container">

        <header className="dashboard-pacientes-header">
          <div className="dashboard-pacientes-title">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>

          {actions && (
            <div className="dashboard-pacientes-actions">
              {actions}
            </div>
          )}
        </header>

        <div className="dashboard-pacientes-content">
          {children}
        </div>

      </div>
    </div>
  );
}
