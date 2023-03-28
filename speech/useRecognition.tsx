import React from "react";

import debounce from "lodash/debounce";

type Response = {
  recognition: string;
  isRecogniting: boolean;
  startRecogniting: () => void;
  stopRecogniting: () => void;
};

const speechRecognitionTimeout = 500;

export const useSpeechRecognition = (): Response => {
  const [isRecogniting, setIsRecogniting] = React.useState(false);
  const [recognition, setRecognition] = React.useState("");
  const recognitionRef = React.useRef<
    | typeof window.SpeechRecognition["prototype"]
    | typeof window.webkitSpeechRecognition["prototype"]
    | undefined
  >();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = "uk-UA";
        recognitionRef.current.interimResults = true;
        recognitionRef.current.addEventListener("result", listenSpeech);
      } catch (error) {
        alert("SpeechRecognition is not supported by your browser.");
      }
    }
    return () => {
      recognitionRef.current?.removeEventListener("result", listenSpeech);
    };
  }, []);

  const listenSpeech = (event: SpeechRecognitionEvent) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join("");
    setRecognition(transcript);
  };

  const startRecogniting = React.useCallback(
    debounce(() => {
      if (recognitionRef.current === undefined) return;
      setIsRecogniting(true);
      setRecognition("");
      recognitionRef.current!.start();
    }, speechRecognitionTimeout),
    [JSON.stringify(recognitionRef.current)]
  );

  const stopRecogniting = React.useCallback(
    debounce(() => {
      if (recognitionRef.current === undefined) return;
      setIsRecogniting(false);
      recognitionRef.current!.stop();
    }, speechRecognitionTimeout),
    [JSON.stringify(recognitionRef.current)]
  );

  return {
    recognition,
    isRecogniting,
    startRecogniting,
    stopRecogniting,
  };
};
