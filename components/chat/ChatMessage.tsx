import React from "react";

import upperFirst from "lodash/upperFirst";

import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

import { styled } from "@mui/material/styles";

type ChatGPTAgent = "user" | "system" | "assistant";

export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}

export const ChatMessageSkeleton = () => (
  <Card>
    <MessageAuthor>
      <Skeleton sx={{ width: "20%" }} />
    </MessageAuthor>
    <Box display="flex" gap={1}>
      <Skeleton sx={{ width: "40%" }} /> <Skeleton sx={{ width: "20%" }} />{" "}
      <Skeleton sx={{ width: "40%" }} />
    </Box>
    <Box display="flex" gap={1}>
      <Skeleton sx={{ width: "10%" }} /> <Skeleton sx={{ width: "50%" }} />{" "}
      <Skeleton sx={{ width: "20%" }} />
    </Box>
    <Box display="flex" gap={1}>
      <Skeleton sx={{ width: "40%" }} /><Skeleton sx={{ width: "30%" }} />
    </Box>
  </Card>
);

// util helper to convert new lines to <br /> tags
const convertNewLines = (text: string) =>
  text.split("\n").map((line, i) => (
    <span key={i}>
      {line}
      <br />
    </span>
  ));

export const ChatMessage = ({
  role = "assistant",
  content,
}: ChatGPTMessage) => {
  if (!content) {
    return null;
  }
  const formatteMessage = convertNewLines(content);

  const messageRole = role === "user" ? "Я" : "ШІ";

  return (
    <Card background={role === "assistant" || role === "system"}>
      <MessageAuthor>{upperFirst(messageRole)}</MessageAuthor>
      {formatteMessage}
    </Card>
  );
};

const Card = styled("div")<{ background?: boolean }>(
  ({ theme, background }) => ({
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    boxShadow: "none",
    ...(background && {
      backgroundColor: "#edf5ff",
    }),
  })
);

const MessageAuthor = styled("span")({
  fontSize: "0.8rem",
  color: "#999",
  display: "block",
  marginBottom: "0.2rem",
});
