// src/theme.js
import { createTheme } from "@mui/material/styles";

const fonts = "Roboto Condensed, system-ui";

const theme = createTheme({
  typography: { fontFamily: fonts },
  palette: {
    primary: {
      main: "#1f4493",
    },
    secondary: {
      main: "#cbdaf1",
    },
  },
  MuiCssBaseline: {
    styleOverrides: {
      "@global": { body: { fontFamily: fonts } },
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
        },
      },
      defaultProps: {
        variant: "contained",
      },
    },
  },
});

export default theme;
