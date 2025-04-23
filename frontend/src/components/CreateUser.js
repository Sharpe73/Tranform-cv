import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";

const CreateUser = () => {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    rol: "user",
  });

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || usuario.rol !== "admin") {
      navigate("/dashboard"); // redirige si no es admin
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_BASE_URL}/usuarios`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMensaje(response.data.message);
      setForm({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        rol: "user",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear usuario");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 500, mx: "auto" }}>
        <Typography variant="h5" gutterBottom>
          Crear nuevo usuario
        </Typography>

        {mensaje && <Alert severity="success">{mensaje}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Apellido"
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            margin="normal"
            required
            type="email"
          />
          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            value={form.password}
            onChange={handleChange}
            margin="normal"
            required
            type="password"
          />

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Crear Usuario
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateUser;
