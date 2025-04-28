import axios from "axios";
import API_BASE_URL from "./apiConfig";

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
          alert("❗ Tu cuenta ha sido eliminada o tu sesión ha expirado. Vuelve a iniciar sesión.");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
