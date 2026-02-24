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
        overflowX: "hidden"
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#0f172a",
          color: "white",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}
      >
        <div
          style={{
            maxWidth: "980px",
            margin: "0 auto",
            padding: "12px 14px",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center"
          }}
        >
          {/* IZQUIERDA */}
          <div style={{ justifySelf: "start" }}>
            <button
              onClick={goBack}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 800,
                padding: "7px 14px",
                borderRadius: "999px",
                cursor: "pointer",
                transition: "0.15s ease"
              }}
            >
              ← Volver
            </button>
          </div>

          {/* CENTRO */}
          <div
            style={{
              justifySelf: "center",
              textAlign: "center",
              fontWeight: 900,
              fontSize: "14px",
              letterSpacing: "0.2px",
              whiteSpace: "nowrap"
            }}
          >
            Instituto de Cirugía Articular
          </div>

          {/* DERECHA */}
          <div style={{ justifySelf: "end" }}>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "32px",
                padding: "0 14px",
                borderRadius: "999px",
                fontWeight: 900,
                fontSize: "13px",
                textDecoration: "none",
                color: "#ffffff",
                background: "#2563eb",
                transition: "0.15s ease"
              }}
            >
              Inicio
            </a>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main
        style={{
          flex: 1,
          padding: "16px 12px",
          display: "flex",
          justifyContent: "center"
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "980px",
            minWidth: 0,
            overflowX: "hidden"
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
