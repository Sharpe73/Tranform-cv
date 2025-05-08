import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  Avatar,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import axios from "axios";
import API_BASE_URL from "../apiConfig";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, form);
      const { token, usuario } = response.data;

      console.log("🟢 Login exitoso. Usuario recibido:", usuario);

      if (!usuario.permisos) {
        console.warn("⚠️ El usuario no tiene permisos definidos. Esto causará errores en la app.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // ✅ Se reemplaza redirección con recarga para asegurar lectura del localStorage
      window.location.reload();
    } catch (err) {
      if (err.response?.data?.message === "Usuario eliminado o no encontrado") {
        setError("Tu cuenta ha sido eliminada. Por favor, inicia sesión nuevamente.");
      } else {
        setError(err.response?.data?.message || "Error al iniciar sesión. Verifica tus credenciales.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #e3f2fd, #fce4ec)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          maxWidth: 400,
          width: "100%",
          borderRadius: 4,
          textAlign: "center",
        }}
      >
        <Avatar sx={{ bgcolor: "#1976d2", mx: "auto", mb: 2 }}>
          <LockIcon />
        </Avatar>
        <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
          Iniciar Sesión
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Usuario"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <VpnKeyIcon />
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, py: 1.2, fontWeight: "bold" }}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Ingresar"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
