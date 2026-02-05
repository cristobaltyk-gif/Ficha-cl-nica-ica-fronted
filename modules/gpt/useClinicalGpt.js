import { useState } from "react";

/*
useClinicalGpt
MODULO GPT CLINICO (FRONTEND)

✔ Recibe TEXTO CRUDO
✔ Devuelve TEXTO ORDENADO
✔ NO UI
✔ NO estado clínico
✔ Cerebro decide cuándo llamar
*/

export function useClinicalGpt() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function order(rawText) {
    if (!rawText || rawText.trim().length === 0) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // 🔴 ESTE FETCH ES INTENCIONAL
      // apunta a TU backend GPT (lo haces después)
      const res = await fetch("/api/gpt/clinical-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: rawText
        })
      });

      if (!res.ok) {
        throw new Error("GPT_ERROR");
      }

      const data = await res.json();

      return {
        atencion: data.atencion || "",
        receta: data.receta || "",
        examenes: data.examenes || "",
        ordenKinesica: data.ordenKinesica || "",
        indicaciones: data.indicaciones || "",
        indicacionQuirurgica: data.indicacionQuirurgica || ""
      };
    } catch (e) {
      setError("No se pudo ordenar clínicamente");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    order,
    loading,
    error
  };
}
