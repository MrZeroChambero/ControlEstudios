import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export const PersonaTable = ({ personas, isLoading, onEdit, onDelete }) => {
  if (isLoading) {
    return <p className="text-center text-gray-500">Cargando personas...</p>;
  }

  if (personas.length === 0) {
    return (
      <p className="text-center text-gray-500">No hay personas para mostrar.</p>
    );
  }

  const getNombreCompleto = (persona) => {
    return `${persona.primer_nombre} ${persona.segundo_nombre || ""} ${
      persona.primer_apellido
    } ${persona.segundo_apellido || ""}`
      .replace(/\s+/g, " ")
      .trim();
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 uppercase font-semibold text-sm text-left">
              Nombre Completo
            </th>
            <th className="py-3 px-4 uppercase font-semibold text-sm text-left">
              Cédula
            </th>
            <th className="py-3 px-4 uppercase font-semibold text-sm text-left">
              Teléfono
            </th>
            <th className="py-3 px-4 uppercase font-semibold text-sm text-left">
              Tipo
            </th>
            <th className="py-3 px-4 uppercase font-semibold text-sm text-center">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {personas.map((persona) => (
            <tr key={persona.id_persona} className="border-b hover:bg-gray-100">
              <td className="py-3 px-4">{getNombreCompleto(persona)}</td>
              <td className="py-3 px-4">{persona.cedula || "N/A"}</td>
              <td className="py-3 px-4">{persona.telefono_principal}</td>
              <td className="py-3 px-4 capitalize">
                {persona.tipo_persona || "No asignado"}
              </td>
              <td className="py-3 px-4 text-center">
                <button
                  onClick={() => onEdit(persona)}
                  className="text-yellow-500 hover:text-yellow-700 mr-4"
                  title="Editar"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => onDelete(persona.id_persona)}
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
