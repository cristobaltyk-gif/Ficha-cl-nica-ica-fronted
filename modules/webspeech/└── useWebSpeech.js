import { useRef, useState } from "react";

/*
useWebSpeech — PRODUCCIÓN REAL (FRONTEND)

✔ Dictado en tiempo real (Web Speech API)
✔ Devuelve TEXTO (no audio)
✔ Sin backend
✔ Sin fetch
✔ Sin mock
✔ Sin guardar audio
✔ Módulo independiente
*/

export function useWebSpeech({
  lang = "es-CL",
  continuous = true,
  interimResults = false
} = {}) {
  const recognitionRef = useRef(null);
  const bufferRef = useRef("");

  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);

  function start() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    bufferRef.current = "";

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          bufferRef.current += event.results[i][0].transcript + " ";
        }
      }
    };

    recognition.onerror = () => {
      stop();
    };

    recognition.onend = () => {
      setRecording(false);
      setLoading(false);
    };

    recognitionRef.current = recognition;
    recognition.start();

    setRecording(true);
  }

  function stop() {
    return new Promise((resolve) => {
      if (!recognitionRef.current) {
        resolve("");
        return;
      }

      setLoading(true);

      recognitionRef.current.onend = () => {
        const text = bufferRef.current.trim();
        recognitionRef.current = null;
        bufferRef.current = "";
        setRecording(false);
        setLoading(false);
        resolve(text);
      };

      recognitionRef.current.stop();
    });
  }

  return {
    supported,
    recording,
    loading,
    start,
    stop
  };
}
