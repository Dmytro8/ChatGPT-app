import MuiContainer from "@mui/material/Container";
import { styled } from "@mui/material/styles";

import { Chat } from "../components";

function Home() {
  return (
    <Container maxWidth={"sm"}>
      <Chat />
    </Container>
  );
}

const Container = styled(MuiContainer)(({ theme }) => ({
  height: "100%",
  overflow: "hidden",
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
}));

// Home.Layout = Layout;

export default Home;
