import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  MenuItem,
  Container,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";

const CreateUser = () => {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    rol: "user",
  });

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [emailValido, setEmailValido] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || usuario.rol !== "admin") {
      navigate("/transform");
    }
  }, [navigate]);

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "email") {
      setEmailValido(validarEmail(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_BASE_URL}/users/admin/invitar-usuario`,
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
        rol: "user",
      });
      setEmailValido(true);
    } catch (err) {
      if (
        err.response?.data?.message?.includes("duplicate key value") ||
        err.response?.data?.message?.includes("ya está registrado")
      ) {
        setError("El correo ya existe en la base de datos. Por favor, ingrese otro.");
      } else {
        setError(err.response?.data?.message || "Error al invitar usuario");
      }
    }
  };

  const formularioInvalido =
    !form.nombre || !form.apellido || !form.email || !emailValido;

  return (
    <Container maxWidth="sm" sx={{ pt: 4, pb: 6, minHeight: "100vh" }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" gutterBottom color="primary" textAlign="center">
          ✉️ Invitar nuevo usuario
        </Typography>

        {mensaje && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {mensaje}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

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
            error={!emailValido && form.email !== ""}
            helperText={
              !emailValido && form.email !== ""
                ? "Correo no válido. Por favor, ingrese un correo válido."
                : ""
            }
          />
          <TextField
            fullWidth
            select
            label="Rol"
            name="rol"
            value={form.rol}
            onChange={handleChange}
            margin="normal"
            required
          >
            <MenuItem value="user">Usuario</MenuItem>
            <MenuItem value="admin">Administrador</MenuItem>
          </TextField>

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={formularioInvalido}>
            Enviar Invitación
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateUser;
