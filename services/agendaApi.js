const API_URL = import.meta.env.VITE_API_URL;

/**
 * Helper base
 */
async function apiFetch(path, options = {}) {
  if (!API_URL) {
    throw new Error("VITE_API_URL no configurado");
  }

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.detail || data?.message || "Error de agenda";
    throw new Error(msg);
  }

  return data;
}

/**
 * ============================
 * LECTURAS
 * ============================
 */

/**
 * Agenda completa por día
 * GET /agenda?date=YYYY-MM-DD
 */
export function getAgendaDay(date) {
  return apiFetch(`/agenda?date=${date}`, {
    method: "GET"
  });
}

/**
 * Ocupación por hora
 * GET /agenda/occupancy?date=YYYY-MM-DD&time=HH:MM
 */
export function getOccupancy(date, time) {
  return apiFetch(
    `/agenda/occupancy?date=${date}&time=${time}`,
    { method: "GET" }
  );
}

/**
 * ============================
 * MUTACIONES
 * ============================
 */

/**
 * Crear / reservar slot
 * POST /agenda/create
 */
export function createSlot(payload) {
  return apiFetch(`/agenda/create`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * Anular slot
 * POST /agenda/cancel
 */
export function cancelSlot(payload) {
  return apiFetch(`/agenda/cancel`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * Reprogramar slot
 * POST /agenda/reschedule
 */
export function rescheduleSlot(payload) {
  return apiFetch(`/agenda/reschedule`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
