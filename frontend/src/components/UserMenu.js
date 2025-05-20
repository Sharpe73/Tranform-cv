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

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", px: 2 }}>
      <Tooltip title="Opciones de usuario">
        <IconButton onClick={handleOpen} size="small" sx={{ ml: 2 }}>
          <Avatar sx={{ bgcolor: "#1976d2", width: 32, height: 32 }}>
            <FaceIcon sx={{ color: "#fff", fontSize: 20 }} />
          </Avatar>
        </IconButton>
      </Tooltip>
      <Typography variant="body1" sx={{ ml: 1, fontWeight: "bold" }}>
        {usuario.nombre} {usuario.apellido}
      </Typography>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={confirmarCerrarSesion}>Cerrar Sesión</MenuItem>
      </Menu>

      
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>¿Cerrar sesión?</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro que deseas cerrar tu sesión?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Cerrar Sesión
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
