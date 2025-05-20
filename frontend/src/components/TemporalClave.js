import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";

export default function CambiarClave() {
  const [nuevaClave, setNuevaClave] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const navigate = useNavigate();

  const handleCambiar = async () => {
    if (nuevaClave !== confirmacion) {
      alert("❗ Las contraseñas no coinciden.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/cambiar-clave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nuevaClave }),
      });

      if (!response.ok) {
        throw new Error("Error al cambiar la contraseña");
      }

      alert("✅ Contraseña actualizada. Por favor inicia sesión nuevamente.");
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      navigate("/login");
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Hubo un error al cambiar la contraseña.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 10 }}>
        <Typography variant="h5" gutterBottom>
          Cambiar Contraseña
        </Typography>
        <TextField
          fullWidth
          label="Nueva contraseña"
          type="password"
          margin="normal"
          value={nuevaClave}
          onChange={(e) => setNuevaClave(e.target.value)}
        />
        <TextField
          fullWidth
          label="Confirmar contraseña"
          type="password"
          margin="normal"
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
        />
        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={handleCambiar}>
            Guardar contraseña
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
