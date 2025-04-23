import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Config from "./components/Config";
import Transform from "./components/Transform";
import ProcessedCVs from "./components/ProcessedCVs";
import Dashboard from "./components/Dashboard";
import CreateUser from "./components/CreateUser";
import Login from "./components/Login";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import API_BASE_URL from "./apiConfig";

function App() {
  const [config, setConfig] = useState({
    font: "Helvetica",
    fontSize: 14,
    fontColor: "#000000",
    templateStyle: "default",
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/styles`, {
        withCredentials: true,
      })
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp > now) {
          setIsAdmin(decoded.rol === "admin");
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("❌ Token inválido:", err.message);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const Layout = ({ children }) => {
    const location = useLocation();
    const isLogin = location.pathname === "/login";

    return (
      <Box display="flex">
        {!isLogin && <Sidebar />}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {children}
        </Box>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route
              path="/"
              element={isAuthenticated ? <Config config={config} setConfig={setConfig} /> : <Navigate to="/login" />}
            />
            <Route
              path="/transform"
              element={isAuthenticated ? <Transform config={config} /> : <Navigate to="/login" />}
            />
            <Route
              path="/procesados"
              element={isAuthenticated ? <ProcessedCVs /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard"
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
            />
            {isAdmin && <Route path="/crear-usuario" element={<CreateUser />} />}
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
