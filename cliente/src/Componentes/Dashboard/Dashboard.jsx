import React from "react";
import { Sidebar } from "./sidebar.jsx";
import { MenuPrincipal } from "./MenuPrincipal.jsx";
import { Main } from "./Secciones.jsx";

export const Dashboard = () => {
  return <MenuPrincipal Formulario={Main} />;
};
