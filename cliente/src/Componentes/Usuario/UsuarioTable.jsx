import React from "react";
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";

export const UsuarioTable = ({
  usuarios,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  if (isLoading) {
    return <p className="text-center text-gray-500">Cargando usuarios...</p>;
  }

  if (usuarios.length === 0) {
    return (
      <p className="text-center text-gray-500">No hay usuarios para mostrar.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 uppercase font-semibold text-sm text-center">
              ID
            </th>
            <th className="py-3 px-4 uppercase font-semibold text-sm text-left">
              Nombre de Usuario
            </th>
            <th className="py-3 px-4 uppercase font-semibold text-sm text-left">
              Rol
            </th>
            <th className="py-3 px-4 uppercase font-semibold text-sm text-center">
              Estado
            </th>
            <th className="py-3 px-4 uppercase font-semibold text-sm text-center">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {usuarios.map((usuario) => (
            <tr key={usuario.id_usuario} className="border-b hover:bg-gray-100">
              <td className="py-3 px-4 text-center">{usuario.id_usuario}</td>
              <td className="py-3 px-4">{usuario.nombre_usuario}</td>
              <td className="py-3 px-4">{usuario.rol}</td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`px-2 py-1 text-xs font-bold rounded-full ${
                    usuario.estado === "activo"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {usuario.estado}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <button
                  onClick={() => onToggleStatus(usuario)}
                  className={`text-2xl mr-2 ${
                    usuario.estado === "activo"
                      ? "text-green-500 hover:text-green-600"
                      : "text-gray-400 hover:text-gray-500"
                  }`}
                  title={usuario.estado === "activo" ? "Desactivar" : "Activar"}
                >
                  {usuario.estado === "activo" ? (
                    <FaToggleOn />
                  ) : (
                    <FaToggleOff />
                  )}
                </button>
                <button
                  onClick={() => onEdit(usuario)}
                  className="text-yellow-500 hover:text-yellow-700 mr-2"
                  title="Editar"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => onDelete(usuario.id_usuario)}
                  className="text-red-500 hover:text-red-700"
                  title="Eliminar"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
