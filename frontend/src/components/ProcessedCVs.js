import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
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
  useMediaQuery,
  Chip,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CodeIcon from "@mui/icons-material/Code";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import API_BASE_URL from "../apiConfig"; // ✅ usamos constante

function ProcessedCVs() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchTags, setSearchTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [tabValue, setTabValue] = useState("nombre");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");
  const itemsPerPage = 10;

  const cargarCVs = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/cv/list`)
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

  const descargarJSON = (json, nombre) => {
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CV_${nombre}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const descargarPDF = (id) => {
    fetch(`${API_BASE_URL}/cv/pdf/${id}`)
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cv_${id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("❌ Error al descargar PDF:", err);
      });
  };

  const handleOpenDialog = () => {
    setPin("");
    setPinError("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const confirmarEliminacion = async () => {
    if (!pin) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/limpiar-cvs`, {
        method: "POST",
        headers: {
          "x-admin-secret": pin,
        },
      });

      const data = await res.json();
      if (res.status === 200) {
        setOpenDialog(false);
        setPin("");
        setPinError("");
        alert(data.mensaje || "CVs eliminados correctamente");
        cargarCVs();
      } else {
        setPinError("❌ PIN incorrecto");
      }
    } catch (err) {
      setPinError("❌ Error al eliminar los CVs");
      console.error(err);
    }
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

  return (
    <Box sx={{ px: 2, py: 4, maxWidth: "1200px", mx: "auto", minHeight: "100vh", pb: 8 }}>
      <Typography variant="h4" gutterBottom>
        📄 CVs Procesados
      </Typography>

      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        justifyContent="space-between"
        alignItems={isMobile ? "stretch" : "center"}
        gap={2}
        mb={2}
      >
        <Stack direction="row" spacing={1} justifyContent={isMobile ? "center" : "flex-start"}>
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

        <Button
          variant="contained"
          startIcon={<DeleteIcon />}
          onClick={handleOpenDialog}
          sx={{
            backgroundColor: "#d32f2f",
            fontWeight: "bold",
            px: 3,
            py: 1.2,
            boxShadow: 2,
            width: isMobile ? "100%" : "auto",
            alignSelf: isMobile ? "center" : "auto",
            "&:hover": { backgroundColor: "#b71c1c" },
          }}
        >
          ELIMINAR TODOS LOS CVS
        </Button>
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
                onDelete={() =>
                  setSearchTags(searchTags.filter((_, i) => i !== index))
                }
                color="primary"
              />
            ))}
          </Stack>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Ingresa el PIN de seguridad</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            error={Boolean(pinError)}
            helperText={pinError}
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={confirmarEliminacion} variant="contained" color="error">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {loading ? (
        <Box mt={4} textAlign="center">
          <CircularProgress />
          <Typography>Cargando CVs procesados...</Typography>
        </Box>
      ) : isMobile ? (
        <Stack spacing={2}>
          {paginatedCvs.map((cv) => {
            const parsedJson = cv.json || {};
            const nombre = parsedJson?.informacion_personal?.nombre || "Desconocido";
            return (
              <Paper key={cv.id} sx={{ p: 2 }}>
                <Typography fontWeight="bold">🧑 {nombre}</Typography>
                <Typography sx={{ mb: 1 }}>
                  🗓️ {new Date(cv.created_at).toLocaleString("es-CL")}
                </Typography>
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
                    onClick={() =>
                      descargarJSON(parsedJson, nombre.replace(/\s/g, "_"))
                    }
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
              </Paper>
            );
          })}
        </Stack>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>
                  <strong>🧑 Nombre</strong>
                </TableCell>
                <TableCell>
                  <strong>🗓️ Fecha</strong>
                </TableCell>
                <TableCell>
                  <strong>📄 PDF / JSON</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCvs.map((cv) => {
                const parsedJson = cv.json || {};
                const nombre = parsedJson?.informacion_personal?.nombre || "Desconocido";
                return (
                  <TableRow key={cv.id}>
                    <TableCell>{nombre}</TableCell>
                    <TableCell>
                      {new Date(cv.created_at).toLocaleString("es-CL")}
                    </TableCell>
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
                          onClick={() =>
                            descargarJSON(parsedJson, nombre.replace(/\s/g, "_"))
                          }
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
