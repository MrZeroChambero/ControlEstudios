import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export const PersonalTable = ({ items, isLoading, onEdit, onDelete }) => {
  if (isLoading) return <p>Cargando...</p>;
  if (!items.length) return <p>No hay registros</p>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-2 px-4">ID</th>
            <th className="py-2 px-4">Persona</th>
            <th className="py-2 px-4">Cédula</th>
            <th className="py-2 px-4">Cargo</th>
            <th className="py-2 px-4">Código RAC</th>
            <th className="py-2 px-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => {
            const nombre = `${i.primer_nombre || ""} ${
              i.segundo_nombre || ""
            } ${i.primer_apellido || ""} ${i.segundo_apellido || ""}`
              .replace(/\s+/g, " ")
              .trim();
            return (
              <tr key={i.id_personal} className="border-b">
                <td className="py-2 px-4">{i.id_personal}</td>
                <td className="py-2 px-4">{nombre || i.id_persona}</td>
                <td className="py-2 px-4">{i.cedula || "-"}</td>
                <td className="py-2 px-4">{i.cargo}</td>
                <td className="py-2 px-4">{i.codigo_rac || "-"}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => onEdit(i)}
                    className="mr-2 text-yellow-500"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => onDelete(i.id_personal)}
                    className="text-red-500"
                  >
                    <FaTrash />
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
