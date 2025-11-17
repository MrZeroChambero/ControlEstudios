// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { MenuPrincipal } from "./Componentes/Dashboard/MenuPrincipal.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <MenuPrincipal Formulario={App} />
    </BrowserRouter>
  </React.StrictMode>
);
