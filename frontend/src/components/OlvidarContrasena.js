import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Avatar,
  InputAdornment,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockResetIcon from "@mui/icons-material/LockReset";
import axios from "axios";
import API_BASE_URL from "../apiConfig";
import { useNavigate } from "react-router-dom";

const OlvidarContrasena = () => {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/olvide-clave`, { email });
      setMensaje(response.data.message || "Revisa tu correo para una nueva contraseña temporal.");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("El correo ingresado no está registrado.");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(err.response?.data?.message || "Hubo un error al enviar la solicitud.");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
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
        sx={{ p: 4, maxWidth: 400, width: "100%", borderRadius: 4, textAlign: "center" }}
      >
        <Avatar sx={{ bgcolor: "#1976d2", mx: "auto", mb: 2 }}>
          <LockResetIcon />
        </Avatar>
        <Typography variant="h6" gutterBottom>
          Recuperar contraseña
        </Typography>

        {mensaje && <Alert severity="success" sx={{ mb: 2 }}>{mensaje}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Correo registrado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            margin="normal"
            error={Boolean(error)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Enviar contraseña temporal
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default OlvidarContrasena;
