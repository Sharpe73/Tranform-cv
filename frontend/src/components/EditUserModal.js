import React from "react";
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

function EditUserModal({ open, onClose, usuario, onChange, onSave }) {
  if (!usuario) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold", color: "primary.main" }}>
        ✏️ Editar Usuario
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
            InputProps={{
              readOnly: true,
            }}
            fullWidth
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
            <MenuItem value="admin">Administrador</MenuItem>
            <MenuItem value="user">Usuario</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
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
