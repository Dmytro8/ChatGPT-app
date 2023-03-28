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
  height: "100vh",
  overflow: "hidden",
}));

// Home.Layout = Layout;

export default Home;
