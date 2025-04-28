import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
} from "@mui/material";
import API_BASE_URL from "../apiConfig";

function EditUserModal({ open, onClose, usuario, onUpdate }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    rol: "",
  });

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre || "",
        apellido: usuario.apellido || "",
        rol: usuario.rol || "user",
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/users/${usuario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      onUpdate(); // Refrescar la tabla
      onClose();  // Cerrar el modal
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  if (!usuario) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Usuario</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Proyecto"
            value="Todos los proyectos"
            InputProps={{
              readOnly: true,
            }}
            fullWidth
          />
          <TextField
            select
            label="Nivel de Acceso"
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="admin">Administrador</MenuItem>
            <MenuItem value="user">Usuario</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditUserModal;
