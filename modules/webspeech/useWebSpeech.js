import { useRef, useState } from "react";

/*
useWebSpeech — PRODUCCIÓN ICA (AUTO-CICLO)

✔ Dictado continuo real (por ciclos)
✔ Acumula texto automáticamente
✔ Médico controla inicio / fin
✔ Robusto en móvil
✔ Sin lógica clínica
✔ Cerebro orquesta
*/

export function useWebSpeech(options = {}) {
  const {
    lang = "es-CL",
    onChunk // 👈 callback: texto confirmado
  } = options;

  const recognitionRef = useRef(null);
  const textBufferRef = useRef("");
  const manualStopRef = useRef(false);

  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState(null);

  // =========================
  // CREAR RECOGNITION
  // =========================
  function createRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      setError("Navegador no soporta dictado");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;

    // ⚠️ IMPORTANTE:
    // En móvil "continuous=true" NO es confiable,
    // el auto-ciclo lo maneja el cerebro
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          textBufferRef.current += transcript.trim() + " ";
        } else {
          interimText += transcript;
        }
      }

      // 🛟 fallback móvil: nunca perder texto
      if (!textBufferRef.current && interimText) {
        textBufferRef.current = interimText.trim() + " ";
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e);
      stopInternal(true);
    };

    recognition.onend = () => {
      // 🔁 AUTO-CICLO
      flushBuffer();

      if (!manualStopRef.current) {
        startInternal(); // relanza automáticamente
      } else {
        setRecording(false);
      }
    };

    return recognition;
  }

  // =========================
  // FLUSH TEXTO CONFIRMADO
  // =========================
  function flushBuffer() {
    const text = textBufferRef.current.trim();
    if (text) {
      onChunk?.(text);
      textBufferRef.current = "";
    }
  }

  // =========================
  // START INTERNO (1 CICLO)
  // =========================
  function startInternal() {
    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  // =========================
  // START PÚBLICO (MÉDICO)
  // =========================
  function start() {
    manualStopRef.current = false;
    setError(null);
    startInternal();
  }

  // =========================
  // STOP INTERNO
  // =========================
  function stopInternal(final = false) {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (final) flushBuffer();

    setRecording(false);
    setLoading(false);
  }

  // =========================
  // STOP DEFINITIVO (MÉDICO)
  // =========================
  function stop() {
    return new Promise((resolve) => {
      manualStopRef.current = true;
      setLoading(true);

      if (!recognitionRef.current) {
        resolve("");
        return;
      }

      const recognition = recognitionRef.current;

      recognition.onend = () => {
        const text = textBufferRef.current.trim();
        textBufferRef.current = "";
        recognitionRef.current = null;
        setRecording(false);
        setLoading(false);
        resolve(text);
      };

      recognition.stop();
    });
  }

  return {
    supported,
    recording,
    loading,
    error,
    start,
    stop
  };
}
