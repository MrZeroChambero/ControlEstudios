import React from "react";

export default function AnioEscolarTable({ anios, onAperturar, onRefresh }) {
  return (
    <div className="bg-gray-50 p-4 rounded">
      <h3 className="font-bold mb-2">Años escolares</h3>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {anios && anios.length ? (
            anios.map((a) => (
              <tr key={a.id_anio_escolar} className="border-t">
                <td>{a.id_anio_escolar}</td>
                <td>{a.nombre}</td>
                <td>{a.fecha_inicio}</td>
                <td>{a.fecha_fin}</td>
                <td>{a.estado}</td>
                <td className="text-right">
                  {a.estado !== "activo" && (
                    <>
                      <button
                        onClick={() => onAperturar(a.id_anio_escolar)}
                        className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                      >
                        Aperturar
                      </button>
                      <button
                        onClick={() =>
                          onGestion && onGestion(a.id_anio_escolar)
                        }
                        className="bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        Gestionar Apertura
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>No hay años</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="mt-2 text-right">
        <button onClick={onRefresh} className="text-blue-600">
          Refrescar
        </button>
      </div>
    </div>
  );
}
