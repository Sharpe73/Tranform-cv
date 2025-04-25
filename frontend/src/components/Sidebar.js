import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BarChartIcon from "@mui/icons-material/BarChart";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LogoutIcon from "@mui/icons-material/Logout";
import { jwtDecode } from "jwt-decode";

function Sidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [usuarioNombre, setUsuarioNombre] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsuarioNombre(`${decoded.nombre} ${decoded.apellido}`);
        if (decoded.rol === "admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("❌ Error al decodificar token:", error.message);
      }
    }
  }, []);

  const toggleDrawer = (open) => () => setIsOpen(open);

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const hayUsuario = !!localStorage.getItem("token");

  return (
    <>
      <IconButton
        onClick={toggleDrawer(true)}
        sx={{
          position: "fixed",
          top: 20,
          left: 20,
          zIndex: 1300,
        }}
      >
        <MenuIcon sx={{ fontSize: 30, color: "black" }} />
      </IconButton>

      <Drawer anchor="left" open={isOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250, bgcolor: "#f5f5f5", height: "100vh" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 20px",
              borderBottom: "1px solid #ddd",
              position: "relative",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Opciones
            </Typography>
            <IconButton onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {usuarioNombre && (
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Bienvenido,
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                {usuarioNombre}
              </Typography>
            </Box>
          )}

          <List>
            <ListItem button onClick={() => handleNavigate("/dashboard")}>
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>

            <ListItem button onClick={() => handleNavigate("/transform")}>
              <ListItemIcon>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText primary="Transformar Documento" />
            </ListItem>

            <ListItem button onClick={() => handleNavigate("/procesados")}>
              <ListItemIcon>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary="CVs Procesados" />
            </ListItem>

            {isAdmin && (
              <ListItem button onClick={() => handleNavigate("/")}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Ajustes" />
              </ListItem>
            )}

            {isAdmin && (
              <ListItem button onClick={() => handleNavigate("/crear-usuario")}>
                <ListItemIcon>
                  <PersonAddIcon />
                </ListItemIcon>
                <ListItemText primary="Crear Usuario" />
              </ListItem>
            )}

            {hayUsuario && (
              <ListItem button onClick={() => setOpenLogoutDialog(true)}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Cerrar Sesión" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>

      <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)}>
        <DialogTitle>¿Cerrar sesión?</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas cerrar tu sesión?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogoutDialog(false)}>Cancelar</Button>
          <Button onClick={handleLogout} variant="contained" color="error">
            Cerrar Sesión
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Sidebar;
