import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import API_BASE_URL from "../apiConfig";

function EditUserModal({ open, onClose, usuario, onChange, onSave }) {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/users/roles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        console.error("Error al obtener roles:", error);
      }
    };

    if (open) fetchRoles();
  }, [open]);

  if (!usuario) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold" color="primary">
          ✏️ Editar Usuario
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} mt={1}>
          <TextField
            label="Nombre"
            name="nombre"
            value={usuario.nombre}
            onChange={onChange}
            fullWidth
            required
          />
          <TextField
            label="Apellido"
            name="apellido"
            value={usuario.apellido}
            onChange={onChange}
            fullWidth
            required
          />
          <TextField
            label="Proyecto"
            value="Todos los proyectos"
            fullWidth
            InputProps={{ readOnly: true }}
          />
          <TextField
            select
            label="Rol de Usuario"
            name="rol"
            value={usuario.rol}
            onChange={onChange}
            fullWidth
            required
          >
            {roles.map((rol) => (
              <MenuItem key={rol} value={rol}>
                {rol.charAt(0).toUpperCase() + rol.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary">
          Cancelar
        </Button>
        <Button onClick={onSave} variant="contained" color="primary">
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditUserModal;
