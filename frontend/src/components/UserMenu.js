import React, { useState, useEffect } from "react";
import {
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Box,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import FaceIcon from "@mui/icons-material/Face";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

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

  
  let iconColor = "#4caf50"; 
  if (usuario.rol === "admin") iconColor = "#1976d2";
  else if (usuario.rol === "gerente de proyecto") iconColor = "#9c27b0";

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", px: 2 }}>
      <Tooltip title="Opciones de usuario">
        <Box
          onClick={handleOpen}
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <Avatar sx={{ bgcolor: iconColor, width: 40, height: 40 }}>
            <FaceIcon sx={{ color: "#fff", fontSize: 28 }} />
          </Avatar>
          <Box sx={{ ml: 1, textAlign: "left" }}>
            <Typography fontWeight="bold" fontSize="0.9rem">
              {usuario.nombre} {usuario.apellido}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {usuario.email}
            </Typography>
          </Box>
          <KeyboardArrowDownIcon sx={{ ml: 1 }} />
        </Box>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 1 }}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 250 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {usuario.nombre} {usuario.apellido}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {usuario.email}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={confirmarCerrarSesion}>
          <LogoutIcon sx={{ mr: 1, color: "orange" }} />
          Cerrar Sesión
        </MenuItem>
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
