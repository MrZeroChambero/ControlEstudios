// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import Swal from "sweetalert2";

import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { MenuPrincipal } from "./Componentes/Dashboard/MenuPrincipal.jsx";

// Interceptores globales para log de solicitudes al backend

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <MenuPrincipal Formulario={App} />
    </BrowserRouter>
  </React.StrictMode>
);
