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
  Collapse,
  IconButton,
  AppBar,
  Toolbar,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BarChartIcon from "@mui/icons-material/BarChart";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import GroupIcon from "@mui/icons-material/Group";
import BusinessIcon from "@mui/icons-material/Business";
import SecurityIcon from "@mui/icons-material/Security";
import { jwtDecode } from "jwt-decode";

const drawerWidth = 250;

function Sidebar() {
  const navigate = useNavigate();
  const [rolUsuario, setRolUsuario] = useState("");
  const [usuarioNombre, setUsuarioNombre] = useState("");
  const [requiereCambioClave, setRequiereCambioClave] = useState(false);
  const [openAjustes, setOpenAjustes] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("usuario");

    if (token && storedUser) {
      try {
        const decoded = jwtDecode(token);
        const usuario = JSON.parse(storedUser);
        setUsuarioNombre(`${decoded.nombre} ${decoded.apellido}`);
        setRolUsuario(decoded.rol);
        setRequiereCambioClave(usuario.requiereCambioClave === true);
      } catch (error) {
        console.error("❌ Error al decodificar token:", error.message);
      }
    }
  }, []);

  const handleNavigate = (path) => {
    if (!requiereCambioClave) {
      navigate(path);
      if (isMobile) setMobileOpen(false);
    }
  };

  const esAdmin = rolUsuario === "admin";
  const esGerente = rolUsuario === "gerente de proyecto";

  const disabledItem = (text, icon) => (
    <Tooltip title="Debe cambiar su contraseña" placement="right">
      <ListItem button disabled>
        <ListItemIcon sx={{ color: "#ccc" }}>{icon}</ListItemIcon>
        <ListItemText primary={text} sx={{ color: "#ccc" }} />
      </ListItem>
    </Tooltip>
  );

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
          {requiereCambioClave
            ? disabledItem("Dashboard", <BarChartIcon />)
            : (
              <ListItem button onClick={() => handleNavigate("/dashboard")}>
                <ListItemIcon><BarChartIcon /></ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
            )}

          {requiereCambioClave
            ? disabledItem("Transformar Documento", <DescriptionIcon />)
            : (
              <ListItem button onClick={() => handleNavigate("/transform")}>
                <ListItemIcon><DescriptionIcon /></ListItemIcon>
                <ListItemText primary="Transformar Documento" />
              </ListItem>
            )}

          {(esAdmin || esGerente) && (
            requiereCambioClave
              ? disabledItem("CVs Procesados", <AssignmentIcon />)
              : (
                <ListItem button onClick={() => handleNavigate("/procesados")}>
                  <ListItemIcon><AssignmentIcon /></ListItemIcon>
                  <ListItemText primary="CVs Procesados" />
                </ListItem>
              )
          )}

          {esAdmin && (
            <>
              <ListItem button onClick={() => setOpenAjustes(!openAjustes)} disabled={requiereCambioClave}>
                <ListItemIcon><SettingsIcon /></ListItemIcon>
                <ListItemText primary="Ajustes" />
                {openAjustes ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={openAjustes} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem button sx={{ pl: 4 }} onClick={() => handleNavigate("/ajustes/organizacion")} disabled={requiereCambioClave}>
                    <ListItemIcon><BusinessIcon /></ListItemIcon>
                    <ListItemText primary="Mi Organización" />
                  </ListItem>
                  <ListItem button sx={{ pl: 4 }} onClick={() => handleNavigate("/ajustes/equipo")} disabled={requiereCambioClave}>
                    <ListItemIcon><GroupIcon /></ListItemIcon>
                    <ListItemText primary="Mi Equipo" />
                  </ListItem>
                  <ListItem button sx={{ pl: 4 }} onClick={() => handleNavigate("/ajustes/roles-permisos")} disabled={requiereCambioClave}>
                    <ListItemIcon><SecurityIcon /></ListItemIcon>
                    <ListItemText primary="Roles y Permisos" />
                  </ListItem>
                </List>
              </Collapse>
            </>
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
    </>
  );
}

export default Sidebar;
