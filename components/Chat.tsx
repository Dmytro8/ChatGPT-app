import React from "react";
import { Button } from "./Button";
import { type ChatGPTMessage, ChatLine, LoadingChatLine } from "./ChatLine";
import { useCookies } from "react-cookie";

const COOKIE_NAME = "nextjs-example-ai-chat-gpt3";

// default first message to display in UI (not necessary to define the prompt)
export const initialMessages: ChatGPTMessage[] = [
  {
    role: "assistant",
    content: "Hi! I am a friendly AI assistant. Ask me anything!",
  },
];

const InputMessage = ({
  input,
  setInput,
  sendMessage,
  speech,
}: {
  input: string;
  setInput: (input: string) => void;
  sendMessage: (message: string) => void;
  speech?: {
    listening: boolean;
    handleStartListening: (e: any) => void;
    handleEndListening: (e: any) => void;
  };
}) => {
  return (
    <div className="mt-6 flex clear-both">
      <input
        type="text"
        aria-label="chat input"
        required
        className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm"
        value={input}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage(input);
            setInput("");
          }
        }}
        onChange={(e) => {
          setInput(e.target.value);
        }}
      />
      <Button
        type="submit"
        className="ml-4 flex-none"
        onClick={() => {
          sendMessage(input);
          setInput("");
        }}
      >
        Say
      </Button>
      {speech && (
        <Button
          type="submit"
          className="ml-4 flex-none select-none"
          onClick={
            speech.listening
              ? speech.handleEndListening
              : speech.handleStartListening
          }
        >
          {speech.listening ? "Stop" : "Start"}
        </Button>
      )}
    </div>
  );
};

export function Chat() {
  const [messages, setMessages] =
    React.useState<ChatGPTMessage[]>(initialMessages);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [cookie, setCookie] = useCookies([COOKIE_NAME]);
  const [listening, setListening] = React.useState(false);
  const recognition = React.useRef<
    | typeof window.SpeechRecognition["prototype"]
    | typeof window.webkitSpeechRecognition["prototype"]
    | undefined
  >();

  React.useEffect(() => {
    if (!cookie[COOKIE_NAME]) {
      // generate a semi random short id
      const randomId = Math.random().toString(36).substring(7);
      setCookie(COOKIE_NAME, randomId);
    }
  }, [cookie, setCookie]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition.current = new SpeechRecognition();
        recognition.current.lang = "uk-UA";
        recognition.current.interimResults = true;
      } catch (error) {
        alert("SpeechRecognition is not supported");
        // console.log("SpeechRecognition is not supported");
      }
    }
    return () => {
      recognition.current?.removeEventListener("result", listenSpeech);
    };
  }, []);

  const listenSpeech = (event: SpeechRecognitionEvent) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join("");
    setInput(transcript);
  };

  const handleStartListening = (e: any) => {
    e.preventDefault();
    setListening(true);
    setInput("");
    recognition.current?.start();
    recognition.current?.addEventListener("result", listenSpeech);
    console.log("recognition started");
  };

  const handleEndListening = (e: any) => {
    e.preventDefault();
    setListening(false);
    recognition.current?.stop();
    recognition.current?.removeEventListener("result", listenSpeech);
    console.log("recognition ended");
  };

  // send message to API /api/chat endpoint
  const sendMessage = async (message: string) => {
    setLoading(true);
    const newMessages = [
      ...messages,
      { role: "user", content: message } as ChatGPTMessage,
    ];
    setMessages(newMessages);
    const last10messages = newMessages.slice(-10); // remember last 10 messages

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: last10messages,
        user: cookie[COOKIE_NAME],
      }),
    });

    console.log("Edge function returned.");

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    let lastMessage = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      lastMessage = lastMessage + chunkValue;

      setMessages([
        ...newMessages,
        { role: "assistant", content: lastMessage } as ChatGPTMessage,
      ]);

      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border-zinc-100  lg:border lg:p-6">
      {messages.map(({ content, role }, index) => (
        <ChatLine key={index} role={role} content={content} />
      ))}

      {loading && <LoadingChatLine />}

      {messages.length < 2 && (
        <span className="mx-auto flex flex-grow text-gray-600 clear-both">
          Type a message to start the conversation
        </span>
      )}
      <InputMessage
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        speech={{
          listening,
          handleStartListening,
          handleEndListening,
        }}
      />
    </div>
  );
}
