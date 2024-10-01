import React from "react";
import Routes from "./components/Routes";

import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./Theme";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes />
    </ThemeProvider>
  );
};
export default App;
