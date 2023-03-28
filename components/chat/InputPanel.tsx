import React from "react";

import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import SendIcon from "@mui/icons-material/Send";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import { styled } from "@mui/material/styles";

import { useSpeechRecognition } from "../../speech/useRecognition";

export const InputPanel = ({
  sendMessage,
}: {
  sendMessage: (message: string) => void;
}) => {
  const { recognition, isRecogniting, startRecogniting, stopRecogniting } =
    useSpeechRecognition();
  const [input, setInput] = React.useState("");

  React.useEffect(() => {
    setInput(recognition);
  }, [recognition]);

  const handleStartRecognition = (e: any) => {
    e.preventDefault();
    try {
      startRecogniting();
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleStopRecognition = (e: any) => {
    e.preventDefault();
    try {
      stopRecogniting();
      sendMessage(recognition);
      setInput("");
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleSendMessage = () => {
    sendMessage(input);
    setInput("");
  };

  return (
    <InputMessageFooter>
      <Box sx={{ flexGrow: 1 }}>
        <TextField
          type="text"
          required
          sx={{ width: "100%" }}
          value={input}
          disabled={isRecogniting}
          placeholder="Введіть своє повідомлення тут"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          variant="outlined"
        />
      </Box>

      <InputButton
        type="submit"
        variant="contained"
        size="large"
        disabled={isRecogniting}
        onClick={handleSendMessage}
      >
        <SendIcon />
      </InputButton>
      <InputButton
        size="large"
        type="submit"
        variant="contained"
        onMouseDown={handleStartRecognition}
        onMouseUp={handleStopRecognition}
        onTouchStart={handleStartRecognition}
        onTouchEnd={handleStopRecognition}
      >
        <KeyboardVoiceIcon />
      </InputButton>
    </InputMessageFooter>
  );
};

const InputMessageFooter = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const InputButton = styled(Button)(({ theme }) => ({
  height: "100%",
}));
