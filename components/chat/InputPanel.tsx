import React from "react";

import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import SendIcon from "@mui/icons-material/Send";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";

export const InputPanel = ({
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
    <InputMessageFooter>
      <Box sx={{ flexGrow: 1 }}>
        <TextField
          type="text"
          required
          sx={{ width: "100%" }}
          value={input}
          placeholder="Введіть своє повідомлення тут"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage(input);
              setInput("");
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
        onClick={() => {
          sendMessage(input);
          setInput("");
        }}
      >
        <SendIcon />
      </InputButton>
      {speech && (
        <InputButton
          size="large"
          type="submit"
          variant="contained"
          onMouseDown={speech.handleStartListening}
          onMouseUp={speech.handleEndListening}
          onTouchStart={speech.handleStartListening}
          onTouchEnd={speech.handleEndListening}
        >
          <KeyboardVoiceIcon />
        </InputButton>
      )}
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
