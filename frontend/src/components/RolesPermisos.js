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
  Card,
  CardContent,
  Stack,
  useMediaQuery
} from "@mui/material";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import API_BASE_URL from "../apiConfig";

function RolesPermisos() {
  const [permisos, setPermisos] = useState([]);
  const isMobile = useMediaQuery("(max-width:600px)");

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
        return <Chip label="Administrador" sx={{ backgroundColor: "#1976d2", color: "#fff" }} />;
      case "gerente de proyecto":
        return <Chip label="Gerente de Proyecto" sx={{ backgroundColor: "#9c27b0", color: "#fff" }} />;
      case "usuario":
        return <Chip label="Usuario" sx={{ backgroundColor: "#388e3c", color: "#fff" }} />;
      default:
        return <Chip label={rol} />;
    }
  };

  const renderPermiso = (label, activo) => (
    <Box display="flex" alignItems="center" gap={1}>
      {activo ? <CheckBoxIcon color="success" /> : <CheckBoxOutlineBlankIcon color="disabled" />}
      <Typography>{label}</Typography>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom textAlign="center" color="primary">
        🔐 Roles y Permisos
      </Typography>

      {isMobile ? (
        <Stack spacing={2} mt={2}>
          {permisos.map((row, index) => (
            <Card key={index} sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>{getColorChip(row.rol)}</Typography>
                <Stack spacing={1} mt={1}>
                  {renderPermiso("Dashboard", row.acceso_dashboard)}
                  {renderPermiso("CVs", row.acceso_cvs)}
                  {renderPermiso("Repositorios", row.acceso_repositorios)}
                  {renderPermiso("Ajustes", row.acceso_ajustes)}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <TableContainer component={Paper} sx={{ borderRadius: 4, minWidth: "600px" }}>
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
        </Box>
      )}
    </Container>
  );
}

export default RolesPermisos;
