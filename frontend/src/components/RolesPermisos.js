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
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderIcon from "@mui/icons-material/Folder";
import SettingsIcon from "@mui/icons-material/Settings";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople"; // Ícono para "Rol"
import API_BASE_URL from "../apiConfig";
import UserMenu from "../components/UserMenu";

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="primary">
          🔐 Roles y Permisos
        </Typography>
        <UserMenu />
      </Box>

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
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmojiPeopleIcon sx={{ color: "#ff9800" }} />
                      <strong>Rol</strong>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      <DashboardIcon color="primary" />
                      <strong>Dashboard</strong>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      <DescriptionIcon color="secondary" />
                      <strong>CVs</strong>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      <FolderIcon sx={{ color: "#6d4c41" }} />
                      <strong>Repositorios</strong>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      <SettingsIcon sx={{ color: "#455a64" }} />
                      <strong>Ajustes</strong>
                    </Box>
                  </TableCell>
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
