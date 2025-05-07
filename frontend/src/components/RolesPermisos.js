import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Chip,
  Button,
} from "@mui/material";
import API_BASE_URL from "../apiConfig";

function RolesPermisos() {
  const [permisos, setPermisos] = useState([]);
  const [original, setOriginal] = useState([]);

  useEffect(() => {
    fetchPermisos();
  }, []);

  const fetchPermisos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/permisos`);
      const data = await response.json();
      setPermisos(data);
      setOriginal(data);
    } catch (error) {
      console.error("Error al obtener permisos:", error);
    }
  };

  const handleChange = (index, field) => {
    const updated = [...permisos];
    updated[index][field] = !updated[index][field];
    setPermisos(updated);
  };

  const handleGuardar = async () => {
    for (const p of permisos) {
      const { acceso_dashboard, acceso_cvs, acceso_repositorios, acceso_ajustes } = p;
      if (!acceso_dashboard && !acceso_cvs && !acceso_repositorios && !acceso_ajustes) {
        return alert(`❌ El rol "${p.rol}" no puede quedar sin ningún permiso asignado.`);
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/permisos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permisos),
      });

      if (response.ok) {
        alert("✅ Permisos actualizados correctamente.");
        fetchPermisos();
      } else {
        alert("❌ Error al guardar los permisos.");
      }
    } catch (error) {
      console.error("Error al guardar permisos:", error);
    }
  };

  const getColorChip = (rol) => {
    switch (rol) {
      case "admin":
        return <Chip label="Administrador" sx={{ backgroundColor: "#1976d2", color: "#fff" }} />;
      case "gerente de proyecto":
        return <Chip label="Gerente de Proyecto" sx={{ backgroundColor: "#9c27b0", color: "#fff" }} />;
      case "usuario":
        return <Chip label="Usuario" sx={{ backgroundColor: "#388e3c", color: "#fff" }} />;
      default:
        return <Chip label={rol} />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom textAlign="center" color="primary">
        🔐 Roles y Permisos
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 4, mb: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><strong>Rol</strong></TableCell>
              <TableCell align="center"><strong>Dashboard</strong></TableCell>
              <TableCell align="center"><strong>CVs</strong></TableCell>
              <TableCell align="center"><strong>Repositorios</strong></TableCell>
              <TableCell align="center"><strong>Ajustes</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permisos.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{getColorChip(row.rol)}</TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={row.acceso_dashboard}
                    onChange={() => handleChange(index, "acceso_dashboard")}
                    disabled={row.rol === "admin"}
                  />
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={row.acceso_cvs}
                    onChange={() => handleChange(index, "acceso_cvs")}
                    disabled={row.rol === "admin"}
                  />
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={row.acceso_repositorios}
                    onChange={() => handleChange(index, "acceso_repositorios")}
                    disabled={row.rol === "admin"}
                  />
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={row.acceso_ajustes}
                    onChange={() => handleChange(index, "acceso_ajustes")}
                    disabled={row.rol === "admin"}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box textAlign="center">
        <Button variant="contained" color="primary" onClick={handleGuardar}>
          Guardar Cambios
        </Button>
      </Box>
    </Container>
  );
}

export default RolesPermisos;
