import React from "react";
// Importamos los componentes clave de React Router para manejar las rutas.
// BrowserRouter: envuelve toda la aplicación para habilitar el enrutamiento.
// Routes: define un grupo de rutas.
// Route: define una ruta individual.
// Link: componente para la navegación, similar a una etiqueta <a>.
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { MenuPrincipal } from "./componentes/menu/menu.jsx";

export default function App() {
  return (
    // BrowserRouter envuelve toda la aplicación para que las rutas funcionen.
    <BrowserRouter>
      <Routes>
        {/* El componente Route define la página que se mostrará en una URL específica */}

        <Route path="/" element={<MenuPrincipal />} />
      </Routes>
    </BrowserRouter>
  );
}
{
  /* El componente Routes define el área donde se renderizarán las páginas */
}
