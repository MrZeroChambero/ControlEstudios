import React from "react";
import { Navigate } from "react-router-dom";
import { tienePermisoPorNivel } from "../../utils/nivelesUsuario";

export const ProtectorNivel = ({
  nivelesPermitidos = [],
  redireccion = "/login",
  children,
}) => {
  const puedeIngresar = tienePermisoPorNivel(nivelesPermitidos);
  if (!puedeIngresar) {
    return <Navigate to={redireccion} replace />;
  }
  return <>{children}</>;
};
