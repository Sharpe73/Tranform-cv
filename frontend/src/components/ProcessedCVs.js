import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  InputAdornment,
  Chip,
  useMediaQuery,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CodeIcon from "@mui/icons-material/Code";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../apiConfig";

function capitalizarTexto(texto) {
  if (!texto || typeof texto !== "string") return "";
  if (texto.length <= 4 && texto === texto.toUpperCase()) return texto;
  if (texto === texto.toUpperCase()) {
    return texto
      .toLowerCase()
      .split(" ")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  }
  return texto;
}

function ProcessedCVs() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchTags, setSearchTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [tabValue, setTabValue] = useState("nombre");
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useMediaQuery("(max-width:600px)");
  const itemsPerPage = 10;
  const [isAdmin, setIsAdmin] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuCvId, setMenuCvId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsAdmin(decoded.rol === "admin");
      } catch (err) {
        console.error("Token inválido");
      }
    }
  }, []);

  const cargarCVs = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/cv/list`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setCvs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener CVs:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarCVs();
  }, []);

  const eliminarCV = async (cvId) => {
    const confirmar = window.confirm("¿Estás seguro que deseas eliminar este CV?");
    if (!confirmar) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/cv/eliminar/${cvId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      const data = await res.json();
      if (res.status === 200) {
        alert(data.mensaje || "CV eliminado correctamente");
        setCvs((prev) => prev.filter((cv) => cv.id !== cvId));
        setAnchorEl(null);
        setMenuCvId(null);
      } else {
        alert(data.mensaje || "Error al eliminar el CV");
      }
    } catch (err) {
      console.error("❌ Error al eliminar el CV:", err);
      alert("Ocurrió un error al intentar eliminar el CV.");
    }
  };

  const descargarJSON = (json, nombre) => {
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CV_${nombre}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const descargarPDF = (id) => {
    fetch(`${API_BASE_URL}/cv/pdf/${id}`, { credentials: "include" })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cv_${id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => console.error("❌ Error al descargar PDF:", err));
  };

  const filteredCvs = cvs.filter((cv) => {
    const nombre = cv.json?.informacion_personal?.nombre || "";
    const conocimientos = cv.json?.conocimientos_informaticos?.join(" ") || "";
    return tabValue === "nombre"
      ? nombre.toLowerCase().includes(searchName.toLowerCase())
      : searchTags.every((tag) => conocimientos.toLowerCase().includes(tag.toLowerCase()));
  });

  const totalPages = Math.ceil(filteredCvs.length / itemsPerPage);
  const paginatedCvs = filteredCvs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleMenuOpen = (event, cvId) => {
    setAnchorEl(event.currentTarget);
    setMenuCvId(cvId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCvId(null);
  };

  return (
    <Box sx={{ px: 2, py: 4, maxWidth: "1200px", mx: "auto", minHeight: "100vh", pb: 8 }}>
      <Typography variant="h4" gutterBottom>
        📄 CVs Procesados
      </Typography>

      <Box display="flex" flexDirection={isMobile ? "column" : "row"} justifyContent="space-between" alignItems={isMobile ? "stretch" : "center"} gap={2} mb={2}>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={() => setTabValue("nombre")}
            variant={tabValue === "nombre" ? "contained" : "text"}
          >
            BUSCAR POR NOMBRE
          </Button>
          <Button
            onClick={() => setTabValue("tags")}
            variant={tabValue === "tags" ? "contained" : "text"}
          >
            BUSCAR POR TAGS
          </Button>
        </Stack>
      </Box>

      {tabValue === "nombre" ? (
        <TextField
          variant="outlined"
          placeholder="Buscar por nombre"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      ) : (
        <Box sx={{ mb: 2 }}>
          <TextField
            variant="outlined"
            placeholder="Presiona Enter para agregar un tag (ej: Java)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && tagInput.trim() !== "") {
                setSearchTags([...searchTags, tagInput.trim()]);
                setTagInput("");
                e.preventDefault();
              }
            }}
            fullWidth
          />
          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
            {searchTags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => setSearchTags(searchTags.filter((_, i) => i !== index))}
                color="primary"
              />
            ))}
          </Stack>
        </Box>
      )}

      {loading ? (
        <Box mt={4} textAlign="center">
          <CircularProgress />
          <Typography>Cargando CVs procesados...</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell><strong>🧑 Nombre</strong></TableCell>
                <TableCell><strong>🗓️ Fecha</strong></TableCell>
                <TableCell><strong>👤 Transformado por</strong></TableCell>
                <TableCell><strong>📄 PDF / JSON</strong></TableCell>
                {isAdmin && <TableCell><strong>Acciones</strong></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCvs.map((cv) => {
                const parsedJson = cv.json || {};
                const nombreOriginal = parsedJson?.informacion_personal?.nombre || "Desconocido";
                const nombre = capitalizarTexto(nombreOriginal);
                return (
                  <TableRow key={cv.id}>
                    <TableCell>{nombre}</TableCell>
                    <TableCell>{new Date(cv.created_at).toLocaleString("es-CL")}</TableCell>
                    <TableCell>{cv.usuario || "Admin"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<PictureAsPdfIcon />}
                          onClick={() => descargarPDF(cv.id)}
                        >
                          PDF
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<CodeIcon />}
                          onClick={() => descargarJSON(parsedJson, nombre.replace(/\s/g, "_"))}
                          sx={{
                            color: "#f29111",
                            borderColor: "#f29111",
                            fontWeight: "bold",
                            "&:hover": {
                              backgroundColor: "#f29111",
                              color: "#fff",
                            },
                          }}
                        >
                          JSON
                        </Button>
                      </Stack>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <IconButton onClick={(e) => handleMenuOpen(e, cv.id)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && menuCvId === cv.id}
                          onClose={handleMenuClose}
                        >
                          <MenuItem onClick={() => eliminarCV(cv.id)}>
                            <DeleteIcon /> Eliminar
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box mt={2} display="flex" justifyContent="center">
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(e, page) => setCurrentPage(page)}
          color="primary"
        />
      </Box>
    </Box>
  );
}

export default ProcessedCVs;
