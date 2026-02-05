import { useRef, useState } from "react";

/*
useWebSpeech
PRODUCCION REAL FRONTEND

Dictado por voz en tiempo real usando Web Speech API
Devuelve SOLO texto
No guarda audio
No backend
No fetch
Modulo independiente
*/

export function useWebSpeech(options = {}) {
  const {
    lang = "es-CL",
    continuous = true,
    interimResults = false
  } = options;

  const recognitionRef = useRef(null);
  const textBufferRef = useRef("");

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

    textBufferRef.current = "";

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          textBufferRef.current +=
            event.results[i][0].transcript + " ";
        }
      }
    };

    recognition.onerror = () => {
      recognition.stop();
      recognitionRef.current = null;
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

      const recognition = recognitionRef.current;

      recognition.onend = () => {
        const text = textBufferRef.current.trim();
        recognitionRef.current = null;
        textBufferRef.current = "";
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
    start,
    stop
  };
}
