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
  Chip
} from "@mui/material";
import API_BASE_URL from "../apiConfig";

function RolesPermisos() {
  const [permisos, setPermisos] = useState([]);

  useEffect(() => {
    fetchPermisos();
  }, []);

  const fetchPermisos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/permisos`);
      const data = await response.json();
      setPermisos(data);
    } catch (error) {
      console.error("Error al obtener permisos:", error);
    }
  };

  const getColorChip = (rol) => {
    switch (rol) {
      case "admin":
        return <Chip label="Administrador" color="primary" />;
      case "gerente de proyecto":
        return <Chip label="Gerente de Proyecto" sx={{ backgroundColor: "#1976d2", color: "#fff" }} />;
      case "usuario":
        return <Chip label="Usuario" color="success" />;
      default:
        return <Chip label={rol} />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom textAlign="center" color="primary">
        🔐 Roles y Permisos
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
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
                  <Checkbox checked={row.acceso_dashboard} disabled />
                </TableCell>
                <TableCell align="center">
                  <Checkbox checked={row.acceso_cvs} disabled />
                </TableCell>
                <TableCell align="center">
                  <Checkbox checked={row.acceso_repositorios} disabled />
                </TableCell>
                <TableCell align="center">
                  <Checkbox checked={row.acceso_ajustes} disabled />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default RolesPermisos;
