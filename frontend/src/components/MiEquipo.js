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
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Button,
  Container,
  Chip,
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
  const isMobile = useMediaQuery("(max-width:600px)");

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
          const response = await fetch(`${API_BASE_URL}/users/${usuarioSeleccionado.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Error al eliminar usuario");
          }

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

      alert("✅ Usuario actualizado correctamente.");
      fetchUsuarios();
      handleCloseModal();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  const mapearRol = (rol, es_dueno) => {
    const chips = [];

    if (rol === "admin") {
      chips.push(<Chip key="admin" label="Administrador" color="primary" size="small" />);
    } else if (rol === "gerente de proyecto") {
      chips.push(
        <Chip
          key="gerente"
          label="Gerente de Proyecto"
          size="small"
          sx={{ backgroundColor: "#9c27b0", color: "#fff" }}
        />
      );
    } else {
      chips.push(<Chip key="user" label="Usuario" color="success" size="small" />);
    }

    if (es_dueno) {
      chips.push(
        <Chip
          key="dueno"
          label="Dueño"
          size="small"
          sx={{ backgroundColor: "#000", color: "#fff", ml: 1 }}
        />
      );
    }

    return <Box display="flex" gap={1}>{chips}</Box>;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom textAlign="center" color="primary">
        👥 Mi Equipo
      </Typography>

      {isMobile ? (
        <Stack spacing={2}>
          {usuarios.map((usuario) => (
            <Card key={usuario.id} sx={{ borderRadius: 4, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6">
                  {usuario.nombre} {usuario.apellido}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Correo: {usuario.email || "-"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Proyecto: Todos los proyectos
                </Typography>
                <Box mt={1}>{mapearRol(usuario.rol, usuario.es_dueno)}</Box>
                {!usuario.es_dueno && usuario.id !== currentUserId && (
                  <Box mt={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => handleMenuOpen(e, usuario)}
                      endIcon={<MoreVertIcon />}
                    >
                      Opciones
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell><strong>Correo</strong></TableCell>
                <TableCell><strong>Proyecto</strong></TableCell>
                <TableCell><strong>Acceso</strong></TableCell>
                <TableCell><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>{usuario.nombre} {usuario.apellido}</TableCell>
                  <TableCell>{usuario.email || "-"}</TableCell>
                  <TableCell>Todos los proyectos</TableCell>
                  <TableCell>{mapearRol(usuario.rol, usuario.es_dueno)}</TableCell>
                  <TableCell>
                    {!usuario.es_dueno && usuario.id !== currentUserId && (
                      <IconButton onClick={(e) => handleMenuOpen(e, usuario)}>
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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
    </Container>
  );
}

export default MiEquipo;
