import { useRef, useState } from "react";

/*
useWebSpeech — PRODUCCIÓN ICA

✔ Web Speech API real
✔ Compatible móvil / desktop
✔ HTTPS obligatorio
✔ Dictado robusto
✔ Devuelve SOLO texto
*/

export function useWebSpeech(options = {}) {
  const {
    lang = "es-CL"
  } = options;

  const recognitionRef = useRef(null);
  const textBufferRef = useRef("");

  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState(null);

  function start() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      setError("Navegador no soporta dictado");
      return;
    }

    try {
      const recognition = new SpeechRecognition();

      recognition.lang = lang;

      // 🔑 CLAVE PARA MÓVIL
      recognition.continuous = false;
      recognition.interimResults = true;

      textBufferRef.current = "";
      setError(null);

      recognition.onresult = (event) => {
        let interimText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            textBufferRef.current += transcript + " ";
          } else {
            interimText += transcript;
          }
        }

        // fallback móvil: guarda aunque no marque final
        if (!textBufferRef.current && interimText) {
          textBufferRef.current = interimText + " ";
        }
      };

      recognition.onerror = (e) => {
        console.error("Speech error:", e);
        setError("Error de dictado");
        stopInternal();
      };

      recognition.onend = () => {
        setRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setRecording(true);

    } catch (e) {
      console.error("Speech init error:", e);
      setError("No se pudo iniciar dictado");
      setRecording(false);
    }
  }

  function stopInternal() {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setRecording(false);
    setLoading(false);
  }

  function stop() {
    return new Promise((resolve) => {
      if (!recognitionRef.current) {
        resolve("");
        return;
      }

      setLoading(true);

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
