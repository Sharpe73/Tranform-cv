// src/components/CambiarPassword.js
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  Paper,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";

const CambiarPassword = ({ usuario }) => {
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_BASE_URL}/users/cambiar-password`,
        { nuevaPassword: password },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMensaje("✅ Contraseña actualizada correctamente.");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("❌ Error al cambiar contraseña:", err.message);
      setError("Hubo un error al actualizar la contraseña.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 4 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h5" gutterBottom>
          Cambiar contraseña temporal
        </Typography>

        {mensaje && <Alert severity="success">{mensaje}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type="password"
            label="Nueva Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            type="password"
            label="Confirmar Contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            margin="normal"
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Guardar nueva contraseña
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default CambiarPassword;
