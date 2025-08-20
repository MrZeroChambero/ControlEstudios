import { Carrusel, Carruseltext } from "./carrusel";

export const SeccionBlog = ({ titulo, contenido, fotos, id, index, texto }) => {
  // Alterna el color de fondo basado en si el índice es par o impar
  const bgColorClass = index % 2 === 0 ? "bg-white" : "bg-gray-50";

  return (
    // Usamos el id dinámico para los enlaces de ancla y la clase de color alterna
    <section id={id} className={`py-20 px-4 sm:px-6 lg:px-8 ${bgColorClass}`}>
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">{titulo}</h2>
        <p className="text-center max-w-3xl mx-auto mb-12 text-lg text-gray-600">
          {contenido ||
            `Aquí iría el contenido de la sección ${titulo}. Este es un texto de relleno.`}
        </p>
        {/* Renderizamos el carrusel solo si la sección tiene fotos */}
        {fotos && fotos.length > 0 ? (
          <Carrusel images={fotos} titulo={titulo} />
        ) : (
          <Carruseltext texto={texto} titulo={titulo} />
        )}
      </div>
    </section>
  );
};
