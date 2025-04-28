import axios from "axios";
import API_BASE_URL from "../apiConfig";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        const mensaje = data.message || "";

        if (
          mensaje.includes("Token inválido") ||
          mensaje.includes("Token expirado") ||
          mensaje.includes("usuario eliminado") ||
          mensaje.includes("No autorizado") ||
          mensaje.includes("Usuario no encontrado")
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");

          setTimeout(() => {
            alert("❗ Tu cuenta ha sido eliminada o tu sesión ha expirado. Vuelve a iniciar sesión.");
            window.location.href = "/login";
          }, 300);
        }
      }
    }

    return Promise.reject(error);
  }
);


export async function verificarSesionActiva() {
  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }

  try {
    const res = await api.get("/auth/verificar", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.status === 200;
  } catch (error) {
    return false;
  }
}

export default api;
