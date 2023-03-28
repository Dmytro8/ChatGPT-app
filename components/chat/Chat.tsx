import React from "react";
import { useCookies } from "react-cookie";

import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

import { InputPanel } from "./InputPanel";
import {
  ChatGPTMessage,
  ChatMessage,
  ChatMessageSkeleton,
} from "./ChatMessage";

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

  const [loading, setLoading] = React.useState(false);
  const [cookie, setCookie] = useCookies([COOKIE_NAME]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [stopGenerating, setStopGenerating] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!cookie[COOKIE_NAME]) {
      // generate a semi random short id
      const randomId = Math.random().toString(36).substring(7);
      setCookie(COOKIE_NAME, randomId);
    }
  }, [cookie, setCookie]);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  return (
    <ChatContainer>
      <MessagesContainer>
        {[
          ...messages.map(({ content, role }, index, originMessages) => (
            <Box
              key={index}
              ref={originMessages.length === index + 1 ? messagesEndRef : null}
            >
              <ChatMessage role={role} content={content} />
            </Box>
          )),
          loading && <ChatMessageSkeleton />,
        ]}
      </MessagesContainer>

      {messages.length < 2 && (
        <ChatHint>{"Введіть повідомлення, щоб почати розмову"}</ChatHint>
      )}

      <InputPanel sendMessage={sendMessage} disabled={loading || isStreaming} />
    </ChatContainer>
  );
};

const ChatContainer = styled(Box)(() => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  height: "100%",
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  overflowY: "scroll",
  flexGrow: 1,
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const ChatHint = styled("div")({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  width: "100%",
  textAlign: "center",
});
