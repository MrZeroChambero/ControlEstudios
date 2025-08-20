import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SeccionBlog } from "./secciones";
import { Rocket, Menu, X } from "lucide-react";
import { navItems } from "./contenido";

export const MenuPrincipal = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const NavClass =
    "flex items-center text-white hover:text-indigo-200 transition-colors duration-300 font-medium";
  const mobileNavItemClass =
    "flex items-center text-white hover:bg-indigo-700 active:bg-indigo-800 p-3 rounded-lg transition-colors duration-300";
  // Define la navegación del menú

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 scroll-smooth border-dark">
      {/* Barra de navegación superior */}
      <nav className=" bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 md:flex md:justify-between md:items-center">
          {/* Logo y botón del menú móvil */}
          <div id="movil" className="flex items-center justify-between">
            <Link to="/" className={NavClass}>
              <Rocket className="mr-2" size={24} />
              Blog Escolar
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              className="md:hidden flex items-center p-2 text-white rounded-lg hover:bg-indigo-500 active:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <span className="sr-only">Abrir menú principal</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Menú de navegación principal (desktop) */}
          <ul className="hidden md:flex md:items-center space-x-6">
            {navItems.map((item) => (
              <li key={item.name}>
                {item.isLink ? (
                  <Link to={item.href} className={NavClass}>
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Link>
                ) : (
                  <a href={`#${item.name}`} className={NavClass}>
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Menú de navegación principal (móvil) */}
        <div
          className={`absolute left-0 w-full md:hidden bg-indigo-600 shadow-lg pb-4 transition-all duration-300 ease-in-out ${
            isMenuOpen ? "block" : "hidden"
          }`}
        >
          <ul id="mobile-menu" className="flex flex-col space-y-2 px-4">
            {navItems.map((item) => (
              <li key={item.name}>
                {item.isLink ? (
                  <Link
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)} // Cierra el menú al hacer clic
                    className={mobileNavItemClass}
                  >
                    {item.icon}
                    <span className="ml-3 font-medium">{item.name}</span>
                  </Link>
                ) : (
                  <a
                    href={`#${item.name}`}
                    onClick={() => setIsMenuOpen(false)} // Cierra el menú al hacer clic
                    className={mobileNavItemClass}
                  >
                    {item.icon}
                    <span className="ml-3 font-medium">{item.name}</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Sección principal (Hero Section) */}
      <header className="relative bg-indigo-600 text-white py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tighter mb-4">
            Bienvenido al Blog Escolar
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8 max-w-2xl mx-auto">
            Noticias, eventos y proyectos de nuestra comunidad educativa.
          </p>
          <Link
            to="/publicaciones" // Ejemplo de ruta
            className="inline-block px-8 py-4 bg-white text-indigo-600 font-bold text-lg rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105"
          >
            Explora las Publicaciones
          </Link>
        </div>
        {/* Fondo abstracto con formas de Tailwind CSS */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-75"></div>
      </header>

      {/* Contenido principal con secciones ancla */}
      <main>
        {navItems
          .filter((item) => !item.isLink) // 1. Filtramos para no renderizar "Inicio" como sección
          .map((item, index) => (
            <SeccionBlog
              key={item.name} // 2. React necesita una key única para elementos en una lista
              id={item.name}
              titulo={item.name}
              contenido={item.contenido}
              fotos={item.fotos}
              texto={item.texto}
              index={index} // 4. Pasamos el índice para alternar la clase
            />
          ))}
      </main>
    </div>
  );
};
