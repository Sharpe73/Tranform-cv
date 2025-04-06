import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3b82f6",
    },
    secondary: {
      main: "#1e40af",
    },
    background: {
      default: "#f4f6f8",
    },
    text: {
      primary: "#000000",
      secondary: "#374151",
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
});

export default theme;


