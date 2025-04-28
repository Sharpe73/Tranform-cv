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
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditUserModal from "./EditUserModal";
import API_BASE_URL from "../apiConfig";

function MiEquipo() {
  const [usuarios, setUsuarios] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
          await fetch(`${API_BASE_URL}/users/${usuarioSeleccionado.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
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
    setUsuarioSeleccionado((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      if (!response.ok) {
        throw new Error("Error al actualizar usuario");
      }

      await fetchUsuarios();
      handleCloseModal();

      
      alert("✅ Usuario actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        👥 Mi Equipo
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Proyecto</strong></TableCell>
              <TableCell><strong>Nivel de acceso</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.nombre} {usuario.apellido}</TableCell>
                <TableCell>Todos los proyectos</TableCell>
                <TableCell>
                  {usuario.rol === "admin" ? "Administrador" : "Usuario"}
                </TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleMenuOpen(e, usuario)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
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
