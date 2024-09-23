// src/theme.js
import { createTheme } from "@mui/material/styles";
import RobotoCondensed from "./assets/fonts/RobotoCondensed-VariableFont_wght.ttf";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1f4493",
    },
    secondary: {
      main: "#cbdaf1",
    },
  },
  typography: {
    fontFamily: "Roboto Condensed",
    h1: {
      fontSize: 28,
      fontWeight: 700,
    },
    h2: {
      fontSize: 24,
      fontWeight: 700,
    },
    h3: {
      fontSize: 18,
      fontWeight: 700,
    },
    h4: {
      fontSize: 14,
      fontWeight: 700,
    },
    body1: {
      fontSize: 14,
      fontWeight: 700,
      fontFamily: "sans-serif",
    },
    body2: {
      fontSize: 12,
      fontWeight: 400,
      fontFamily: "sans-serif",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Roboto Condesed';
          src: local('Roboto Condesed'), local('Roboto-Condesed-Regular'), url(${RobotoCondensed}) format('ttf');
          unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
        }
      `,
    },
    MuiButton: {
      defaultProps: {
        variant: "contained",
      },
    },
  },
});

export default theme;
