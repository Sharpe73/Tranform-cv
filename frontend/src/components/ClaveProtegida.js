import React from "react";
import { Navigate } from "react-router-dom";
import { Alert } from "@mui/material";

const ClaveProtegida = ({ requiereCambioClave, children }) => {
  if (requiereCambioClave) {
    return (
      <Alert severity="warning">
        ⚠️ Debes cambiar tu contraseña antes de continuar. Por favor, actualízala.
      </Alert>
    );
  }

  return children;
};

export default ClaveProtegida;
