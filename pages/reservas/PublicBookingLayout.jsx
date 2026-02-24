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
        flexDirection: "column",
        overflowX: "hidden" // ✅ CLAVE: mata el desborde lateral
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#0f172a",
          color: "white",
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          position: "sticky", // ✅ se mantiene arriba
          top: 0,
          zIndex: 50
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
            fontSize: "14px",
            letterSpacing: "0.3px",
            lineHeight: 1.15
          }}
        >
          Instituto de
          <br />
          Cirugía Articular
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

      {/* CONTENIDO */}
      <main
        style={{
          flex: 1,
          padding: "16px 12px", // ✅ móvil
          display: "flex",
          justifyContent: "center"
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "920px", // ✅ más razonable
            overflowX: "hidden" // ✅ si algún hijo se pasa, se recorta
          }}
        >
          {children}
        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          background: "#ffffff",
          padding: "14px",
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
