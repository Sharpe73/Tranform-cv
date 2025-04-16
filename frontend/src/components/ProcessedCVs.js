import CodeIcon from "@mui/icons-material/Code";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
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
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

function ProcessedCVs() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");
  const itemsPerPage = 10;

  const cargarCVs = () => {
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
      const res = await fetch("https://tranform-cv.onrender.com/admin/limpiar-cvs", {
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

  const handleTagKeyPress = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      setTags((prev) => [...prev, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const filteredCvs = cvs.filter((cv) => {
    const nombre = cv.json?.informacion_personal?.nombre?.toLowerCase() || "";
    const conocimientos = cv.json?.conocimientos_informaticos?.map(c => c.toLowerCase()) || [];
    const matchNombre = nombre.includes(searchName.toLowerCase());
    const matchTags = tags.every(tag => conocimientos.includes(tag));
    return matchNombre && matchTags;
  });

  const totalPages = Math.ceil(filteredCvs.length / itemsPerPage);
  const paginatedCvs = filteredCvs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <Box mt={4} textAlign="center">
        <CircularProgress />
        <Typography>Cargando CVs procesados...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, py: 4, maxWidth: "900px", mx: "auto", minHeight: "100vh", pb: 8 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        📄 CVs Procesados
      </Typography>

      <Box display="flex" flexDirection="column" gap={2} mb={3}>
        <TextField
          placeholder="Buscar por nombre"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          InputProps={{ startAdornment: (<SearchIcon sx={{ mr: 1 }} />) }}
        />

        <TextField
          placeholder="Presiona Enter para agregar un tag (ej: Java)"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyPress}
        />

        <Stack direction="row" spacing={1} flexWrap="wrap">
          {tags.map((tag, index) => (
            <Chip key={index} label={tag} onDelete={() => removeTag(index)} />
          ))}
        </Stack>

        <Button
          variant="contained"
          color="error"
          onClick={handleOpenDialog}
          startIcon={<DeleteIcon />}
          sx={{ alignSelf: "center", px: 4 }}
        >
          ELIMINAR TODOS LOS CVS
        </Button>
      </Box>

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

      {isMobile ? (
        <Stack spacing={2}>
          {paginatedCvs.map((cv) => {
            const parsedJson = cv.json || { error: "JSON inválido" };
            const nombre = parsedJson?.informacion_personal?.nombre || "Desconocido";
            return (
              <Paper key={cv.id} sx={{ p: 2 }}>
                <Typography fontWeight="bold">🧑 {nombre}</Typography>
                <Typography sx={{ mb: 1 }}>🗓️ {new Date(cv.created_at).toLocaleString("es-CL")}</Typography>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" color="primary" startIcon={<PictureAsPdfIcon />} onClick={() => descargarPDF(cv.id)}>PDF</Button>
                  <Button variant="outlined" startIcon={<CodeIcon />} onClick={() => descargarJSON(parsedJson, nombre.replace(/\s/g, "_"))}>
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
                <TableCell><strong>🧑 Nombre</strong></TableCell>
                <TableCell><strong>🗓️ Fecha</strong></TableCell>
                <TableCell><strong>📥 PDF / JSON</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCvs.map((cv) => {
                const parsedJson = cv.json || { error: "JSON inválido" };
                const nombre = parsedJson?.informacion_personal?.nombre || "Desconocido";
                return (
                  <TableRow key={cv.id}>
                    <TableCell>{nombre}</TableCell>
                    <TableCell>{new Date(cv.created_at).toLocaleString("es-CL")}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button variant="contained" color="primary" startIcon={<PictureAsPdfIcon />} onClick={() => descargarPDF(cv.id)}>
                          PDF
                        </Button>
                        <Button variant="outlined" startIcon={<CodeIcon />} onClick={() => descargarJSON(parsedJson, nombre.replace(/\s/g, "_"))}>
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
