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

const CONSUMO_MAXIMO = 5;
const COLORS = ["#1976d2", "#ffb74d"];
const ROLE_COLORS = {
  admin: "#1976d2",
  user: "#4caf50",
};

function Dashboard() {
  const [consumo, setConsumo] = useState(0);
  const [dataPorUsuario, setDataPorUsuario] = useState([]);
  const theme = useTheme();
  const esMovil = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
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

  const restante = Math.max(CONSUMO_MAXIMO - consumo, 0);
  const porcentaje = Math.min((consumo / CONSUMO_MAXIMO) * 100, 100).toFixed(2);
  const data = [
    { name: "CVs usados", value: consumo },
    { name: "CVs restantes", value: restante },
  ];

  return (
    <Box sx={{ p: esMovil ? 1 : 4, backgroundColor: "#f9fafc", minHeight: "100vh" }}>
      <Typography
        variant={esMovil ? "h5" : "h4"}
        align="center"
        fontWeight="bold"
        color="primary"
        gutterBottom
      >
        📊 Consumo de CVs Transformados
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: esMovil ? "column" : "row",
          gap: 2,
          justifyContent: "center",
          alignItems: "stretch",
          flexWrap: "wrap",
        }}
      >
        <Paper
          elevation={4}
          sx={{
            flex: 1,
            minWidth: 300,
            maxWidth: 600,
            p: 2,
            borderRadius: 4,
            height: esMovil ? "auto" : 430,
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
              Progreso mensual: {consumo} de {CONSUMO_MAXIMO} CVs ({porcentaje}%)
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

        <Paper
          elevation={4}
          sx={{
            flex: 1,
            minWidth: 300,
            maxWidth: 600,
            p: 2,
            borderRadius: 4,
            height: esMovil ? "auto" : 430,
            display: "flex",
            flexDirection: "column",
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
    </Box>
  );
}

export default Dashboard;
