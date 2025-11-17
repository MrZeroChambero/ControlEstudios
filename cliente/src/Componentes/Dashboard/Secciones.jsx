import {
  MdAddCircle,
  MdBarChart,
  MdSettings,
  MdVideocam,
} from "react-icons/md";

export const MultimediaSection = () => {
  return (
    <>
      {" "}
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Sección Multimedia
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
          <h3 className="text-xl font-semibold mb-2">Imagen de Muestra</h3>
          <img
            src="https://placehold.co/600x400/22c55e/ffffff?text=Imagen+Multimedia"
            alt="Placeholder"
            className="w-full h-auto rounded-lg"
          />
        </div>
        <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
          <h3 className="text-xl font-semibold mb-2">Video de Muestra</h3>
          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Espacio para video</p>
          </div>
        </div>
      </div>
    </>
  );
};
export const GraficosSection = () => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Sección de Gráficos
      </h2>
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mt-4">
        <p className="text-gray-500">Espacio para gráfico</p>
      </div>
    </>
  );
};
export const BotonesSection = () => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Sección de Botones
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <button className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500">
          <MdAddCircle className="h-10 w-10 text-blue-500 mb-2" />
          <span className="text-sm font-semibold">Crear Nuevo</span>
        </button>
        <button className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-500">
          <MdBarChart className="h-10 w-10 text-green-500 mb-2" />
          <span className="text-sm font-semibold">Generar Informe</span>
        </button>
        <button className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-yellow-500">
          <MdSettings className="h-10 w-10 text-yellow-500 mb-2" />
          <span className="text-sm font-semibold">Configuración</span>
        </button>
      </div>
    </>
  );
};
