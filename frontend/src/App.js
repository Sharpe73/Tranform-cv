import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Config from "./components/Config";
import Transform from "./components/Transform";
import ProcessedCVs from "./components/ProcessedCVs";
import Dashboard from "./components/Dashboard";
import CreateUser from "./components/CreateUser";
import MiEquipo from "./components/MiEquipo";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validarToken = async () => {
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
    };

    const cargarEstilos = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/styles`, { withCredentials: true });
        if (res.data) {
          setConfig((prev) => ({
            ...prev,
            templateStyle: res.data.templateStyle || "default",
          }));
        }
      } catch (err) {
        console.error("Error cargando estilos:", err);
      }
    };

    Promise.all([validarToken(), cargarEstilos()]).finally(() => setLoading(false));
  }, []);

  const Layout = ({ children }) => {
    const location = useLocation();
    const isLogin = location.pathname === "/login";

    return (
      <Box display="flex">
        {!isLogin && <Sidebar />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            padding: "32px 24px",
            marginLeft: !isLogin ? "250px" : 0,
            maxWidth: !isLogin ? "calc(100% - 250px)" : "100%",
            backgroundColor: "#f9fafc",
            minHeight: "100vh",
          }}
        >
          {children}
        </Box>
      </Box>
    );
  };

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Cargando aplicación...</div>;
  }

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
            {isAdmin && (
              <>
                <Route path="/ajustes/organizacion" element={<Config config={config} setConfig={setConfig} />} />
                <Route path="/ajustes/equipo" element={<MiEquipo />} />
                <Route path="/crear-usuario" element={<CreateUser />} />
              </>
            )}
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
