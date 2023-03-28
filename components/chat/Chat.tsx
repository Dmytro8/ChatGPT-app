import React from "react";
import { useCookies } from "react-cookie";

import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

import { type ChatGPTMessage, ChatLine } from "../ChatLine";
import { InputPanel } from "./InputPanel";

const COOKIE_NAME = "nextjs-example-ai-chat-gpt3";

// default first message to display in UI (not necessary to define the prompt)
export const initialMessages: ChatGPTMessage[] = [
  {
    role: "assistant",
    content: "Привіт! Я Ваш помічник ШІ. З радістю відповім на Ваші питання.",
  },
];

export const Chat = () => {
  const [messages, setMessages] =
    React.useState<ChatGPTMessage[]>(initialMessages);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [cookie, setCookie] = useCookies([COOKIE_NAME]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [stopGenerating, setStopGenerating] = React.useState(false);
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
    sendMessage(input);
    setInput("");
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

    while (!done && !stopGenerating) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      setIsStreaming(!doneReading);
      if (doneReading) {
        setStopGenerating(false);
      }
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
    <ChatContainer>
      <MessagesContainer>
        {messages.map(({ content, role }, index) => (
          <ChatLine key={index} role={role} content={content} />
        ))}
      </MessagesContainer>

      {/* {loading && <LoadingChatLine />} */}

      {messages.length < 2 && (
        <ChatHint>{"Введіть повідомлення, щоб почати розмову"}</ChatHint>
      )}
      <InputPanel
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        speech={{
          listening,
          handleStartListening,
          handleEndListening,
        }}
      />
    </ChatContainer>
  );
};

const ChatContainer = styled(Box)(() => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  height: "100%",
}));

const MessagesContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  overflowY: "auto",
  flexGrow: 1,
}));

const ChatHint = styled("div")({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  whiteSpace: "nowrap",
});
