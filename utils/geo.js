/**
 * utils/geo.js
 * Resuelve región geográfica desde GPS del navegador o IP como fallback.
 * Reutilizable en BookingCerebro, SecretariaCerebro, o cualquier componente.
 *
 * Uso:
 *   import { resolverRegion } from "../utils/geo";
 *   const { region, nombre, ok } = await resolverRegion(API_URL);
 */

const GEO_TIMEOUT_MS = 7000;

// ── Pide GPS al navegador ────────────────────────────────────
function _pedirGPS() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("GPS no disponible"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: GEO_TIMEOUT_MS, maximumAge: 60000 }
    );
  });
}

// ── Llama al backend con o sin coordenadas ───────────────────
async function _llamarBackend(apiUrl, lat = null, lon = null) {
  const params = new URLSearchParams();
  if (lat !== null) params.set("lat", String(lat));
  if (lon !== null) params.set("lon", String(lon));

  const url = `${apiUrl}/geo/sede${params.toString() ? "?" + params.toString() : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

// ── Función principal exportada ──────────────────────────────
/**
 * Resuelve la región del usuario.
 * 1) Intenta GPS nativo (navegador/teléfono)
 * 2) Fallback: backend resuelve por IP
 *
 * @param {string} apiUrl — base URL del backend ICA
 * @returns {Promise<{ ok: boolean, region: string|null, nombre: string|null }>}
 */
export async function resolverRegion(apiUrl) {
  try {
    // 1) GPS nativo
    const { lat, lon } = await _pedirGPS();
    const data = await _llamarBackend(apiUrl, lat, lon);
    return {
      ok:     data.ok ?? false,
      region: data.region ?? null,
      nombre: data.nombre ?? null,
    };
  } catch {
    // 2) Fallback por IP
    try {
      const data = await _llamarBackend(apiUrl);
      return {
        ok:     data.ok ?? false,
        region: data.region ?? null,
        nombre: data.nombre ?? null,
      };
    } catch {
      return { ok: false, region: null, nombre: null };
    }
  }
}
