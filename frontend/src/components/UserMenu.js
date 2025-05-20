import React, { useState, useEffect } from "react";
import {
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import FaceIcon from "@mui/icons-material/Face";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function UserMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem("usuario");
    if (data) {
      setUsuario(JSON.parse(data));
    }
  }, []);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const confirmarCerrarSesion = () => {
    setOpenDialog(true);
    handleClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  if (!usuario) return null;

  // Color por rol
  let iconColor = "#4caf50";
  if (usuario.rol === "admin") iconColor = "#1976d2";
  else if (usuario.rol === "gerente de proyecto") iconColor = "#9c27b0";

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Tooltip title="Opciones de usuario">
        <IconButton onClick={handleOpen} size="small">
          <Avatar sx={{ bgcolor: iconColor, width: 48, height: 48 }}>
            <FaceIcon sx={{ color: "#fff", fontSize: 28 }} />
          </Avatar>
        </IconButton>
      </Tooltip>
      <Box onClick={handleOpen} sx={{ cursor: "pointer" }}>
        <Typography fontWeight="bold" variant="subtitle2">
          {usuario.nombre} {usuario.apellido}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {usuario.email}
        </Typography>
      </Box>
      <IconButton onClick={handleOpen}>
        <ArrowDropDownIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={confirmarCerrarSesion}>Cerrar sesión</MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>¿Cerrar sesión?</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro que deseas cerrar tu sesión?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
