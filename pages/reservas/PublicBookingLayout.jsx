// pages/reservas/PublicBookingLayout.jsx

export default function PublicLayout({ children }) {
  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#0f172a",
          color: "white",
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}
      >
        <button
          onClick={goBack}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "14px",
            cursor: "pointer",
            opacity: 0.9
          }}
        >
          ← Volver
        </button>

        <div
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: "15px",
            letterSpacing: "0.4px"
          }}
        >
          Instituto de Cirugía Articular
        </div>

        <a
          href="/"
          style={{
            color: "white",
            fontSize: "14px",
            cursor: "pointer",
            opacity: 0.9,
            textDecoration: "none"
          }}
        >
          Inicio
        </a>
      </header>

      {/* CONTENIDO (SIN CARD: la card vive en BookingCerebro) */}
      <main
        style={{
          flex: 1,
          padding: "32px 16px",
          display: "flex",
          justifyContent: "center"
        }}
      >
        <div style={{ width: "100%", maxWidth: "1100px" }}>{children}</div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          background: "#ffffff",
          padding: "18px",
          textAlign: "center",
          fontSize: "13px",
          color: "#64748b",
          borderTop: "1px solid #e2e8f0"
        }}
      >
        © {new Date().getFullYear()} Instituto de Cirugía Articular · Curicó
      </footer>
    </div>
  );
}
