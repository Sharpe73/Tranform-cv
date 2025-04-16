import CodeIcon from "@mui/icons-material/Code";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  useMediaQuery,
  Tabs,
  Tab,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

function ProcessedCVs() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchTags, setSearchTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [tab, setTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");
  const itemsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    fetch("https://tranform-cv.onrender.com/cv/list")
      .then((res) => res.json())
      .then((data) => {
        setCvs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener CVs:", err);
        setLoading(false);
      });
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
    fetch(`https://tranform-cv.onrender.com/cv/pdf/${id}`)
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

  const confirmarEliminacion = async () => {
    if (!pin) return;
    try {
      const res = await fetch("https://tranform-cv.onrender.com/admin/limpiar-cvs", {
        method: "POST",
        headers: { "x-admin-secret": pin },
      });
      const data = await res.json();
      if (res.status === 200) {
        setOpenDialog(false);
        setPin("");
        setPinError("");
        alert(data.mensaje || "CVs eliminados correctamente");
        setLoading(true);
        fetch("https://tranform-cv.onrender.com/cv/list")
          .then((res) => res.json())
          .then((data) => {
            setCvs(data);
            setLoading(false);
          });
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
    const matchName = nombre.toLowerCase().includes(searchName.toLowerCase());
    const matchTags = searchTags.every((tag) =>
      conocimientos.toLowerCase().includes(tag.toLowerCase())
    );
    return tab === 0 ? matchName : matchTags;
  });

  const totalPages = Math.ceil(filteredCvs.length / itemsPerPage);
  const paginatedCvs = filteredCvs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <Box mt={4} textAlign="center">
        <CircularProgress />
        <Typography>Cargando CVs procesados...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, py: 4, maxWidth: "1200px", mx: "auto", minHeight: "100vh", pb: 8 }}>
      <Typography variant="h4" gutterBottom>
        📄 CVs Procesados
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} variant="fullWidth">
          <Tab label="BUSCAR POR NOMBRE" />
          <Tab label="BUSCAR POR TAGS" />
        </Tabs>

        {tab === 0 ? (
          <TextField
            placeholder="Buscar por nombre"
            fullWidth
            size="small"
            margin="dense"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon /> }}
          />
        ) : (
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Presiona Enter para agregar un tag (ej: Java)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tagInput.trim()) {
                  setSearchTags([...searchTags, tagInput.trim()]);
                  setTagInput("");
                  e.preventDefault();
                }
              }}
            />
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
              {searchTags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => {
                    setSearchTags(searchTags.filter((_, i) => i !== index));
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      <Button
        fullWidth
        variant="contained"
        startIcon={<DeleteIcon />}
        onClick={() => setOpenDialog(true)}
        sx={{ backgroundColor: "#d32f2f", fontWeight: "bold", py: 1.5, "&:hover": { backgroundColor: "#b71c1c" } }}
      >
        ELIMINAR TODOS LOS CVS
      </Button>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
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
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={confirmarEliminacion} variant="contained" color="error">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {isMobile ? (
        <Stack spacing={2} mt={4}>
          {paginatedCvs.map((cv) => {
            const json = cv.json || {};
            const nombre = json.informacion_personal?.nombre || "Desconocido";
            return (
              <Paper key={cv.id} sx={{ p: 2 }}>
                <Typography fontWeight="bold">🧑 {nombre}</Typography>
                <Typography sx={{ mb: 1 }}>📅 {new Date(cv.created_at).toLocaleString("es-CL")}</Typography>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" color="primary" startIcon={<PictureAsPdfIcon />} onClick={() => descargarPDF(cv.id)}>
                    PDF
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CodeIcon />}
                    onClick={() => descargarJSON(json, nombre.replace(/\s/g, "_"))}
                    sx={{ color: "#f29111", borderColor: "#f29111", fontWeight: "bold", "&:hover": { backgroundColor: "#f29111", color: "#fff" } }}
                  >
                    JSON
                  </Button>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell><strong>🧑 Nombre</strong></TableCell>
                <TableCell><strong>🗓️ Fecha</strong></TableCell>
                <TableCell><strong>📄 PDF / JSON</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCvs.map((cv) => {
                const json = cv.json || {};
                const nombre = json.informacion_personal?.nombre || "Desconocido";
                return (
                  <TableRow key={cv.id}>
                    <TableCell>{nombre}</TableCell>
                    <TableCell>{new Date(cv.created_at).toLocaleString("es-CL")}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button variant="contained" color="primary" size="small" startIcon={<PictureAsPdfIcon />} onClick={() => descargarPDF(cv.id)}>
                          PDF
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<CodeIcon />}
                          onClick={() => descargarJSON(json, nombre.replace(/\s/g, "_"))}
                          sx={{ color: "#f29111", borderColor: "#f29111", fontWeight: "bold", "&:hover": { backgroundColor: "#f29111", color: "#fff" } }}
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
        <Pagination count={totalPages} page={currentPage} onChange={(e, page) => setCurrentPage(page)} color="primary" />
      </Box>
    </Box>
  );
}

export default ProcessedCVs;
