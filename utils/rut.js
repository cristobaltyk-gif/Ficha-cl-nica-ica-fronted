/*
Validación RUT chileno (CANÓNICA)

- No depende de React
- No formatea UI
- Solo valida y normaliza
*/

export function normalizeRut(rut) {
  if (!rut) return null;

  return rut
    .toUpperCase()
    .replace(/\./g, "")
    .replace(/\s+/g, "")
    .trim();
}

export function isValidRut(rut) {
  if (!rut) return false;

  const clean = normalizeRut(rut);

  if (!/^\d{1,8}-[\dK]$/.test(clean)) {
    return false;
  }

  const [body, dv] = clean.split("-");
  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const mod = 11 - (sum % 11);
  let expectedDv;

  if (mod === 11) expectedDv = "0";
  else if (mod === 10) expectedDv = "K";
  else expectedDv = String(mod);

  return dv === expectedDv;
}
