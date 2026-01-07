// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import Swal from "sweetalert2";
import axios from "axios";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { MenuPrincipal } from "./Componentes/Dashboard/MenuPrincipal.jsx";
import instalarGestorAlertas from "./utilidades/gestorAlertas.js";

instalarGestorAlertas(Swal, 5000);

// Interceptores globales para log de solicitudes al backend
axios.interceptors.request.use(
  (config) => {
    try {
      const method = (config.method || "get").toUpperCase();
      const url = config.url || "<unknown>";
      const time = new Date().toISOString();
      const dataPreview = config.data
        ? typeof config.data === "string"
          ? config.data
          : JSON.stringify(config.data)
        : null;
      console.log(
        `[API REQUEST] ${time} - ${method} ${url}`,
        dataPreview ? dataPreview : "(no body)"
      );
    } catch (e) {
      console.warn("[API REQUEST] error al formatear log:", e);
    }
    return config;
  },
  (error) => {
    console.error("[API REQUEST ERROR] ", error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    try {
      const method = (response.config?.method || "get").toUpperCase();
      const url = response.config?.url || "<unknown>";
      const time = new Date().toISOString();
      console.log(
        `[API RESPONSE] ${time} - ${method} ${url} -> ${response.status}`,
        response.data
      );
    } catch (e) {
      console.warn("[API RESPONSE] error al formatear log:", e);
    }
    return response;
  },
  (error) => {
    try {
      const cfg = error.config || {};
      const method = (cfg.method || "get").toUpperCase();
      const url = cfg.url || "<unknown>";
      const time = new Date().toISOString();
      if (error.response) {
        console.error(
          `[API RESPONSE ERROR] ${time} - ${method} ${url} -> ${error.response.status}`,
          error.response.data
        );
      } else if (error.request) {
        console.error(
          `[API NO RESPONSE] ${time} - ${method} ${url} -> no response`,
          error.message
        );
      } else {
        console.error(
          `[API ERROR] ${time} - ${method} ${url} ->`,
          error.message
        );
      }
    } catch (e) {
      console.warn("[API INTERCEPTOR] error al formatear error:", e);
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <MenuPrincipal Formulario={App} />
    </BrowserRouter>
  </React.StrictMode>
);
