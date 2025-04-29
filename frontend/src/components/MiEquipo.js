
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditUserModal from "./EditUserModal";
import API_BASE_URL from "../apiConfig";

function MiEquipo() {
  const [usuarios, setUsuarios] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchUsuarios();
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(decoded.id);
    }
  }, []);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  const handleMenuOpen = (event, usuario) => {
    setAnchorEl(event.currentTarget);
    setUsuarioSeleccionado(usuario);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditar = () => {
    setOpenModal(true);
    handleMenuClose();
  };

  const handleEliminar = async () => {
    if (usuarioSeleccionado) {
      if (window.confirm(`¿Seguro que quieres eliminar a ${usuarioSeleccionado.nombre}?`)) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_BASE_URL}/users/${usuarioSeleccionado.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error("Error al eliminar usuario");
          alert("✅ Usuario eliminado correctamente.");
          fetchUsuarios();
        } catch (error) {
          console.error("Error al eliminar usuario:", error);
        }
      }
    }
    handleMenuClose();
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setUsuarioSeleccionado(null);
  };

  const handleChangeUsuario = (e) => {
    const { name, value } = e.target;
    setUsuarioSeleccionado((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardarCambios = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/${usuarioSeleccionado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: usuarioSeleccionado.nombre,
          apellido: usuarioSeleccionado.apellido,
          rol: usuarioSeleccionado.rol,
        }),
      });
      if (!response.ok) throw new Error("Error al actualizar usuario");
      alert("✅ Usuario actualizado correctamente.");
      fetchUsuarios();
      handleCloseModal();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  return (
    <Box sx={{ px: 2, py: 4, maxWidth: "1200px", mx: "auto" }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        👥 Mi Equipo
      </Typography>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f9f9f9" }}>
            <TableRow>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Correo</strong></TableCell>
              <TableCell><strong>Proyecto</strong></TableCell>
              <TableCell><strong>Acceso</strong></TableCell>
              <TableCell align="center"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow
                key={usuario.id}
                hover
                sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
              >
                <TableCell>{usuario.nombre} {usuario.apellido}</TableCell>
                <TableCell>{usuario.email || "-"}</TableCell>
                <TableCell>Todos los proyectos</TableCell>
                <TableCell>{usuario.rol === "admin" ? "Administrador" : "Usuario"}</TableCell>
                <TableCell align="center">
                  {usuario.id !== currentUserId && (
                    <Tooltip title="Opciones">
                      <IconButton onClick={(e) => handleMenuOpen(e, usuario)}>
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEditar}>Editar</MenuItem>
        <MenuItem onClick={handleEliminar}>Eliminar</MenuItem>
      </Menu>

      <EditUserModal
        open={openModal}
        onClose={handleCloseModal}
        usuario={usuarioSeleccionado}
        onChange={handleChangeUsuario}
        onSave={handleGuardarCambios}
      />
    </Box>
  );
}

export default MiEquipo;
