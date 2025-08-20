import React, { useEffect } from "react";
import { initFlowbite } from "flowbite";
import {
  CircleChevronRight,
  CircleArrowRight,
  CircleChevronLeft,
  CircleDot,
} from "lucide-react";

export const Carrusel = ({ images, titulo }) => {
  useEffect(() => {
    initFlowbite();
  }, []);

  if (!Array.isArray(images) || images.length === 0) {
    console.error("La prop 'images' debe ser un array no vacío de URLs.");
    return null;
  }

  return (
    <div
      id={`carousel-${titulo}`}
      className="relative w-full"
      data-carousel="slide"
    >
      <div className="relative h-56 overflow-hidden rounded-lg md:h-96">
        {images.map((url, index) => (
          <div
            key={index}
            className="hidden duration-700 ease-in-out"
            data-carousel-item={index === 0 ? "active" : ""}
          >
            {/* Imagen de fondo desenfocada y expandida */}
            <img
              src={url}
              className="absolute block w-full h-full object-cover blur-lg brightness-50"
              alt="" // Alt vacío para imágenes decorativas
            />
            {/* Imagen principal contenida y centrada */}
            <img
              src={url}
              className="absolute block w-full h-full object-contain top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              alt={`${titulo} - Imagen ${index + 1}`}
            />
          </div>
        ))}
        <div className="absolute z-30 flex -translate-x-1/2 space-x-3 rtl:space-x-reverse bottom-5 left-1/2">
          {images.map((url, index) => (
            <button
              type="button"
              className="w-3 h-3 rounded-full dark:bg-indigo-600/60 dark:group-hover:bg-indigo-600"
              aria-current="false"
              aria-label={`Slide ${index + 1}`}
              key={index}
              data-carousel-slide-to={index}
            ></button>
          ))}
        </div>
        <button
          type="button"
          className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
          data-carousel-prev
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-indigo-600/60 group-hover:bg-white/50 dark:group-hover:bg-indigo-600 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
            {/* Aquí se coloca el componente de Lucide */}
            <CircleChevronLeft className="w-6 h-6 text-white dark:text-white-800 rtl:rotate-180" />
            <span className="sr-only">Next</span>
          </span>
        </button>

        <button
          type="button"
          className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
          data-carousel-next
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-indigo-600/60 group-hover:bg-white/50 dark:group-hover:bg-indigo-600 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
            {/* Aquí se coloca el componente de Lucide */}
            <CircleChevronRight className="w-6 h-6 text-white dark:text-white-800 rtl:rotate-180" />
            <span className="sr-only">Next</span>
          </span>
        </button>
      </div>
    </div>
  );
};
export const Carruseltext = ({ texto, titulo }) => {
  useEffect(() => {
    initFlowbite();
  }, []);

  // Verificar si la prop texto es un array válido
  if (!Array.isArray(texto) || texto.length === 0) {
    console.error("La prop 'texto' debe ser un array no vacío de objetos.");
    return null;
  }

  return (
    <div
      id={`carousel-${titulo}`}
      className="relative w-full"
      data-carousel="slide"
    >
      <div className="relative h-56 overflow-hidden rounded-lg md:h-96 flex items-center justify-center">
        {texto.map((item, index) => (
          <div
            key={index}
            className="hidden duration-700 ease-in-out absolute inset-0 flex flex-col justify-center items-center p-8"
            data-carousel-item={index === 0 ? "active" : ""}
          >
            <h3 className="text-2xl font-bold text-center mb-4 text-indigo-600 dark: text-gray-600">
              {item.titulo}
            </h3>
            {/* Aquí se usa la lógica condicional */}
            {Array.isArray(item.info) ? (
              <ul className="list-disc list-inside text-center max-w-3xl mx-auto mb-12 text-lg text-gray-700">
                {item.info.map((punto, i) => (
                  <li key={i}>{punto}</li>
                ))}
              </ul>
            ) : (
              <p className="text-center max-w-3xl mx-auto mb-12 text-lg text-gray-700 dark: text-gray-600">
                {item.info}
              </p>
            )}
          </div>
        ))}

        <div className="absolute z-30 flex -translate-x-1/2 space-x-3 rtl:space-x-reverse bottom-5 left-1/2">
          {texto.map((_, index) => (
            <button
              key={index}
              type="button"
              className="w-3 h-3 rounded-full dark:bg-indigo-600/60 dark:group-hover:bg-indigo-600"
              aria-current={index === 0 ? "true" : "false"}
              aria-label={`Slide ${index + 1}`}
              data-carousel-slide-to={index}
            ></button>
          ))}
        </div>

        <button
          type="button"
          className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
          data-carousel-prev
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-indigo-600/60 group-hover:bg-white/50 dark:group-hover:bg-indigo-600 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
            <CircleChevronLeft className="w-6 h-6 text-white dark:text-white-800 rtl:rotate-180" />
            <span className="sr-only">Previous</span>
          </span>
        </button>

        <button
          type="button"
          className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
          data-carousel-next
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-indigo-600/60 group-hover:bg-white/50 dark:group-hover:bg-indigo-600 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
            <CircleChevronRight className="w-6 h-6 text-white dark:text-white-800 rtl:rotate-180" />
            <span className="sr-only">Next</span>
          </span>
        </button>
      </div>
    </div>
  );
};
