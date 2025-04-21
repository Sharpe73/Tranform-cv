import React, { useState } from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BarChartIcon from "@mui/icons-material/BarChart";
import CloseIcon from "@mui/icons-material/Close";

function Sidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setIsOpen(open);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

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
              padding: "10px 20px",
              borderBottom: "1px solid #ddd",
              position: "relative",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ marginLeft: "10px", marginTop: "-5px" }}
            >
              Opciones
            </Typography>
            <IconButton
              onClick={toggleDrawer(false)}
              sx={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

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

            <ListItem button onClick={() => handleNavigate("/")}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Configuración" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default Sidebar;
