// roles/KineCerebro.jsx

import { Routes, Route, Navigate } from "react-router-dom";

/*
KineCerebro — PLACEHOLDER PRODUCCIÓN

✔ Existe para no romper router
✔ NO lógica clínica
✔ NO backend
✔ NO agenda
✔ Entrenable a futuro
*/

export default function KineCerebro() {
  return (
    <div className="kine-layout">

      <header style={{ padding: "16px", borderBottom: "1px solid #ddd" }}>
        <h2>Kinesiología</h2>
      </header>

      <main style={{ padding: "16px" }}>
        <Routes>

          {/* HOME */}
          <Route
            index
            element={
              <div>
                <p>Módulo de Kinesiología</p>
                <p>(En construcción)</p>
              </div>
            }
          />

          {/* FALLBACK INTERNO */}
          <Route
            path="*"
            element={<Navigate to="." replace />}
          />

        </Routes>
      </main>
    </div>
  );
}
