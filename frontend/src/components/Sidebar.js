import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Collapse,
  IconButton,
  AppBar,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BarChartIcon from "@mui/icons-material/BarChart";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import GroupIcon from "@mui/icons-material/Group";
import BusinessIcon from "@mui/icons-material/Business";
import SecurityIcon from "@mui/icons-material/Security";
import { jwtDecode } from "jwt-decode";
import { verificarSesionActiva } from "./api";

const drawerWidth = 250;

function Sidebar() {
  const navigate = useNavigate();
  const [rolUsuario, setRolUsuario] = useState("");
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [usuarioNombre, setUsuarioNombre] = useState("");
  const [openAjustes, setOpenAjustes] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsuarioNombre(`${decoded.nombre} ${decoded.apellido}`);
        setRolUsuario(decoded.rol);
      } catch (error) {
        console.error("❌ Error al decodificar token:", error.message);
      }
    }
  }, []);

  const verificarSesion = async () => {
    try {
      await verificarSesionActiva();
    } catch (error) {
      console.error("❌ Sesión no válida:", error);
    }
  };

  const handleNavigate = async (path) => {
    await verificarSesion();
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const hayUsuario = !!localStorage.getItem("token");
  const esAdmin = rolUsuario === "admin";
  const esGerente = rolUsuario === "gerente de proyecto";

  const contenidoSidebar = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 16px", borderBottom: "1px solid #ddd" }}>
          <Typography variant="h6" fontWeight="bold">Opciones</Typography>
        </Box>

        {usuarioNombre && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="body2" color="textSecondary">Bienvenido,</Typography>
            <Typography variant="subtitle1" fontWeight="bold">{usuarioNombre}</Typography>
          </Box>
        )}

        <List>
          <ListItem button onClick={() => handleNavigate("/dashboard")}>
            <ListItemIcon><BarChartIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>

          <ListItem button onClick={() => handleNavigate("/transform")}>
            <ListItemIcon><DescriptionIcon /></ListItemIcon>
            <ListItemText primary="Transformar Documento" />
          </ListItem>

          {(esAdmin || esGerente) && (
            <ListItem button onClick={() => handleNavigate("/procesados")}>
              <ListItemIcon><AssignmentIcon /></ListItemIcon>
              <ListItemText primary="CVs Procesados" />
            </ListItem>
          )}

          {esAdmin && (
            <>
              <ListItem button onClick={() => setOpenAjustes(!openAjustes)}>
                <ListItemIcon><SettingsIcon /></ListItemIcon>
                <ListItemText primary="Ajustes" />
                {openAjustes ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={openAjustes} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem button sx={{ pl: 4 }} onClick={() => handleNavigate("/ajustes/organizacion")}>
                    <ListItemIcon><BusinessIcon /></ListItemIcon>
                    <ListItemText primary="Mi Organización" />
                  </ListItem>
                  <ListItem button sx={{ pl: 4 }} onClick={() => handleNavigate("/ajustes/equipo")}>
                    <ListItemIcon><GroupIcon /></ListItemIcon>
                    <ListItemText primary="Mi Equipo" />
                  </ListItem>
                  <ListItem button sx={{ pl: 4 }} onClick={() => handleNavigate("/ajustes/roles-permisos")}>
                    <ListItemIcon><SecurityIcon /></ListItemIcon>
                    <ListItemText primary="Roles y Permisos" />
                  </ListItem>
                </List>
              </Collapse>

              <ListItem button onClick={() => handleNavigate("/crear-usuario")}>
                <ListItemIcon><PersonAddIcon /></ListItemIcon>
                <ListItemText primary="Crear Usuario" />
              </ListItem>
            </>
          )}

          {hayUsuario && (
            <ListItem button onClick={() => setOpenLogoutDialog(true)}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Cerrar Sesión" />
            </ListItem>
          )}
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: 1300 }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Menú</Typography>
          </Toolbar>
        </AppBar>
      )}

      <Box sx={{ display: "flex" }}>
        {isMobile ? (
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
              },
            }}
          >
            {contenidoSidebar}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            anchor="left"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: {
                width: drawerWidth,
                boxSizing: "border-box",
                backgroundColor: "#f5f5f5",
                boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
                borderRight: "1px solid #ddd",
              },
            }}
          >
            {contenidoSidebar}
          </Drawer>
        )}
      </Box>

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
