import React from "react";
import { Container, Typography } from "@mui/material";

const Home = () => {
  return (
    <Container sx={{ alignContent: "center", height: "100vh" }}>
      <img src="../img/1Fichier-21.svg" alt="" style={{ width: "100%" }} />
      <Typography variant="h2" textAlign={"center"}>
        Scannez le QR Code de la table pour continuer
      </Typography>
    </Container>
  );
};

export default Home;
