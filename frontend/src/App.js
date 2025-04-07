import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./Sidebar";
import Config from "./Config";
import Transform from "./Transform";
import axios from "axios";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";

function App() {
  const [config, setConfig] = useState({
    font: "Helvetica",
    fontSize: 14,
    fontColor: "#000000",
    templateStyle: "default",
  });

  useEffect(() => {
    axios
      .get("https://tranform-cv.onrender.com/styles")
      .then((response) => {
        if (response.data) {
          setConfig((prevConfig) => ({
            ...prevConfig,
            templateStyle: response.data.templateStyle || "default",
          }));
        }
      })
      .catch((error) => console.error("Error cargando estilos:", error));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box display="flex">
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={<Config config={config} setConfig={setConfig} />} />
              <Route path="/transform" element={<Transform config={config} />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
