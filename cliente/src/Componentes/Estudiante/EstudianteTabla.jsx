import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const EstudianteTabla = ({
  estudiantes = [],
  isCargando = false,
  info = "no se muestra",
  onEditar,
  onActivar,
  onDesactivar,
  onEliminar,
  onVer,
}) => {
  if (isCargando)
    return <p className="text-center text-gray-500">Cargando estudiantes...</p>;
  if (!Array.isArray(estudiantes) || estudiantes.length === 0)
    console.log("en la tabla", "estudiantes:", estudiantes);
  if (!Array.isArray(estudiantes) || estudiantes.length === 0)
    return <p className="text-center text-gray-500">{info}</p>;

  const obtenerNombre = (p) =>
    `${p.primer_nombre || ""} ${p.segundo_nombre || ""} ${
      p.primer_apellido || ""
    } ${p.segundo_apellido || ""}`
      .replace(/\s+/g, " ")
      .trim();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 uppercase font-semibold text-sm text-left">
              Nombre
            </th>
            <th className="py-3 px-4 uppercase font-semibold text-sm text-left">
              Apellidos
            </th>
            <th className="py-3 px-4 uppercase font-semibold text-sm text-left">
              Estado
            </th>
            <th className="py-3 px-4 uppercase font-semibold text-sm text-center">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {estudiantes.map((est) => {
            const nombre = `${est.primer_nombre || ""} ${
              est.segundo_nombre || ""
            }`.trim();
            const apellidos = `${est.primer_apellido || ""} ${
              est.segundo_apellido || ""
            }`.trim();
            return (
              <tr
                key={est.id_estudiante}
                className="border-b hover:bg-gray-100"
              >
                <td className="py-3 px-4">{nombre}</td>
                <td className="py-3 px-4">{apellidos}</td>
                <td className="py-3 px-4">{est.estado || "activo"}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => onEditar && onEditar(est)}
                    className="text-yellow-500 hover:text-yellow-700 mr-4"
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  {est.estado === "activo" ? (
                    <button
                      onClick={() => onDesactivar && onDesactivar(est)}
                      className="text-red-500 hover:text-red-700 mr-4"
                      title="Desactivar"
                    >
                      Desactivar
                    </button>
                  ) : (
                    <button
                      onClick={() => onActivar && onActivar(est)}
                      className="text-green-500 hover:text-green-700 mr-4"
                      title="Activar"
                    >
                      Activar
                    </button>
                  )}
                  <button
                    onClick={() => onEliminar && onEliminar(est)}
                    className="text-red-500 hover:text-red-700 mr-4"
                    title="Eliminar"
                  >
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => onVer && onVer(est)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Ver"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EstudianteTabla;
