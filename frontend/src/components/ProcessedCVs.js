// src/components/ProcessedCVs.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
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
import SearchIcon from "@mui/icons-material/Search";
import CodeIcon from "@mui/icons-material/Code";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteIcon from "@mui/icons-material/Delete";

function ProcessedCVs() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState("nombre");
  const [searchName, setSearchName] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
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
        window.location.reload();
      } else {
        setPinError("❌ PIN incorrecto");
      }
    } catch (err) {
      setPinError("❌ Error al eliminar los CVs");
    }
  };

  const filtrarCVs = () => {
    return cvs.filter((cv) => {
      const nombre = cv.json?.informacion_personal?.nombre || "";
      const conocimientos = (cv.json?.conocimientos_informaticos || []).join(" ");
      const coincideNombre = nombre.toLowerCase().includes(searchName.toLowerCase());
      const coincideTags = tags.every((tag) =>
        conocimientos.toLowerCase().includes(tag.toLowerCase())
      );
      return searchMode === "nombre" ? coincideNombre : coincideTags;
    });
  };

  if (loading) {
    return (
      <Box mt={4} textAlign="center">
        <CircularProgress />
        <Typography>Cargando CVs procesados...</Typography>
      </Box>
    );
  }

  const cvsFiltrados = filtrarCVs();

  return (
    <Box sx={{ px: 2, py: 4, maxWidth: "1200px", mx: "auto", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom>
        📄 CVs Procesados
      </Typography>

      <Tabs
        value={searchMode}
        onChange={(e, val) => {
          setSearchMode(val);
          setSearchName("");
          setTags([]);
        }}
        sx={{ mb: 1 }}
      >
        <Tab label="BUSCAR POR NOMBRE" value="nombre" />
        <Tab label="BUSCAR POR TAGS" value="tags" />
      </Tabs>

      {searchMode === "nombre" ? (
        <TextField
          fullWidth
          placeholder="Buscar por nombre"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ mb: 2 }}
        />
      ) : (
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Presiona Enter para agregar un tag (ej: Java)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && tagInput.trim()) {
                setTags([...tags, tagInput.trim()]);
                setTagInput("");
              }
            }}
          />
          <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
            {tags.map((tag, idx) => (
              <Chip
                key={idx}
                label={tag}
                onDelete={() => setTags(tags.filter((_, i) => i !== idx))}
                color="primary"
              />
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setOpenDialog(true)}
        >
          ELIMINAR TODOS LOS CVS
        </Button>
      </Box>

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
        <Stack spacing={2}>
          {cvsFiltrados.map((cv) => {
            const parsedJson = cv.json || { error: "JSON inválido" };
            const nombre = parsedJson?.informacion_personal?.nombre || "Desconocido";
            return (
              <Paper key={cv.id} sx={{ p: 2 }}>
                <Typography fontWeight="bold">🧑 {nombre}</Typography>
                <Typography sx={{ mb: 1 }}>📅 {new Date(cv.created_at).toLocaleString("es-CL")}</Typography>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" color="primary" startIcon={<PictureAsPdfIcon />} onClick={() => descargarPDF(cv.id)}>PDF</Button>
                  <Button variant="outlined" startIcon={<CodeIcon />} onClick={() => descargarJSON(parsedJson, nombre.replace(/\s/g, "_"))} sx={{ color: "#f29111", borderColor: "#f29111", fontWeight: "bold", '&:hover': { backgroundColor: "#f29111", color: "#fff" } }}>JSON</Button>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>🧑 Nombre</strong></TableCell>
                <TableCell><strong>📅 Fecha</strong></TableCell>
                <TableCell><strong>📄 PDF / JSON</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cvsFiltrados.map((cv) => {
                const parsedJson = cv.json || { error: "JSON inválido" };
                const nombre = parsedJson?.informacion_personal?.nombre || "Desconocido";
                return (
                  <TableRow key={cv.id}>
                    <TableCell>{nombre}</TableCell>
                    <TableCell>{new Date(cv.created_at).toLocaleString("es-CL")}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button variant="contained" color="primary" startIcon={<PictureAsPdfIcon />} onClick={() => descargarPDF(cv.id)}>PDF</Button>
                        <Button variant="outlined" startIcon={<CodeIcon />} onClick={() => descargarJSON(parsedJson, nombre.replace(/\s/g, "_"))} sx={{ color: "#f29111", borderColor: "#f29111", fontWeight: "bold", '&:hover': { backgroundColor: "#f29111", color: "#fff" } }}>JSON</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default ProcessedCVs;
