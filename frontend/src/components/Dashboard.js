import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Tooltip as MuiTooltip,
  Stack,
  useMediaQuery,
  useTheme,
  Container,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import API_BASE_URL from "../apiConfig";
import UserMenu from "./UserMenu";

const COLORS = ["#1976d2", "#ffb74d"];
const ROLE_COLORS = {
  admin: "#1976d2",
  user: "#4caf50",
  "gerente de proyecto": "#9c27b0",
};

function Dashboard() {
  const [consumo, setConsumo] = useState(0);
  const [consumoMaximo, setConsumoMaximo] = useState(null);
  const [dataPorUsuario, setDataPorUsuario] = useState([]);
  const theme = useTheme();
  const esMovil = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetch(`${API_BASE_URL}/cv/limite`)
      .then((res) => res.json())
      .then((data) => setConsumoMaximo(data?.limite))
      .catch((error) => console.error("❌ Error al obtener límite:", error));

    fetch(`${API_BASE_URL}/cv/consumo`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setConsumo(data?.total || 0))
      .catch((error) => console.error("❌ Error al obtener consumo:", error));

    fetch(`${API_BASE_URL}/cv/por-usuario`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const convertidos = data.map((item) => ({
          ...item,
          cantidad: Number(item.cantidad),
        }));
        setDataPorUsuario(convertidos);
      })
      .catch((error) => console.error("❌ Error al obtener datos por usuario:", error));
  }, []);

  if (consumoMaximo === null) {
    return <Typography align="center">Cargando límite mensual...</Typography>;
  }

  const restante = Math.max(consumoMaximo - consumo, 0);
  const porcentaje = Math.min((consumo / consumoMaximo) * 100, 100).toFixed(2);
  const data = [
    { name: "CVs usados", value: consumo },
    { name: "CVs restantes", value: restante },
  ];

  return (
    <Container maxWidth="xl" sx={{ pt: 3, pb: 6 }}>
      
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          px: 2,
        }}
      >
        <Typography
          variant={esMovil ? "h5" : "h4"}
          fontWeight="bold"
          color="primary"
        >
          📊 Consumo de CVs Transformados
        </Typography>
        <UserMenu />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: esMovil ? "column" : "row",
          gap: 3,
          justifyContent: "space-between",
          alignItems: "stretch",
          flexWrap: "wrap",
        }}
      >
        {/* Pie Chart */}
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            minWidth: 300,
            p: 3,
            borderRadius: 4,
            height: esMovil ? "auto" : 450,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" align="center" fontWeight="bold" mb={1}>
            CONSUMO DE CV VS TOTAL X MES
          </Typography>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>

          <Box mt={2}>
            <Typography variant="subtitle1" align="center">
              Progreso mensual: {consumo} de {consumoMaximo} CVs ({porcentaje}%)
            </Typography>
            <MuiTooltip title={`${porcentaje}% utilizado`} arrow>
              <LinearProgress
                variant="determinate"
                value={parseFloat(porcentaje)}
                sx={{
                  height: 12,
                  borderRadius: 5,
                  backgroundColor: "#eee",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#1976d2",
                  },
                }}
              />
            </MuiTooltip>
          </Box>
        </Paper>

        {/* Bar Chart */}
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            minWidth: 300,
            p: 3,
            borderRadius: 4,
            height: esMovil ? "auto" : 450,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" align="center" fontWeight="bold" mb={1}>
            UTILIZACIÓN POR USUARIO
          </Typography>

          <Stack direction="row" justifyContent="center" spacing={2} mb={1}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: ROLE_COLORS.admin, mr: 1 }} />
              <Typography variant="caption">Admin</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: ROLE_COLORS.user, mr: 1 }} />
              <Typography variant="caption">Usuario</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: ROLE_COLORS["gerente de proyecto"], mr: 1 }} />
              <Typography variant="caption">Gerente</Typography>
            </Box>
          </Stack>

          <ResponsiveContainer
            width="100%"
            height={esMovil ? 300 : "100%"}
          >
            <BarChart
              data={dataPorUsuario}
              margin={{ top: 10, right: 10, left: 10, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="usuario"
                interval={0}
                angle={-30}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11 }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="cantidad" isAnimationActive={false}>
                {dataPorUsuario.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={ROLE_COLORS[entry.rol] || "#9e9e9e"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </Container>
  );
}

export default Dashboard;
