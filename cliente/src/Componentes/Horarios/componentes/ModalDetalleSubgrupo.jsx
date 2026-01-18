import React, { useState } from "react";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import { FaTrash, FaFilePdf, FaEdit } from "react-icons/fa";
import ModalSeleccionEstudiantes from "./ModalSeleccionEstudiantes";
import { exportarListadoSubgrupo } from "../../../utilidades/exportadorPDF";
import {
  horariosFormClasses,
  horariosTableClasses,
} from "../../EstilosCliente/EstilosClientes";

const ModalDetalleSubgrupo = ({
  abierto,
  alCerrar,
  bloque,
  onRemoverEstudiante,
  onActualizarSubgrupo,
  puedeGestionar,
}) => {
  if (!bloque) return null;

  const [seleccionEstudiantesVisible, setSeleccionEstudiantesVisible] =
    useState(false);

  const estudiantes = bloque.estudiantes || [];

  const handleExportar = () => {
    exportarListadoSubgrupo({
      componente: bloque.nombre_componente,
      aula: `Grado ${bloque.grado} - Sección ${bloque.seccion}`,
      estudiantes: estudiantes,
    });
  };

  return (
    <VentanaModal
      isOpen={abierto}
      onClose={alCerrar}
      title="Detalle del Subgrupo"
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-800">
              {bloque.nombre_componente}
            </h3>
            {(bloque.especialista === "si" || bloque.compartido === "si") && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                Componente compartido
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">
            {`Grado ${bloque.grado} - Sección ${bloque.seccion} | ${bloque.dia_semana} de ${bloque.hora_inicio_texto} a ${bloque.hora_fin_texto}`}
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleExportar}
            className={horariosFormClasses.primaryButton}
            disabled={estudiantes.length === 0}
          >
            <FaFilePdf className="mr-2" />
            Exportar Lista
          </button>
          {bloque.grupo === "subgrupo" && puedeGestionar ? (
            <button
              type="button"
              onClick={() => setSeleccionEstudiantesVisible(true)}
              className={horariosFormClasses.secondaryButton}
            >
              <FaEdit className="mr-2" />
              Editar selección
            </button>
          ) : null}
        </div>

        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className={horariosTableClasses.celdaEncabezado}
                >
                  Estudiante
                </th>
                <th
                  scope="col"
                  className={horariosTableClasses.celdaEncabezado}
                >
                  Cédula Escolar
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Remover</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {estudiantes.length > 0 ? (
                estudiantes.map((est) => (
                  <tr key={est.id_estudiante}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {est.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {est.cedula_escolar}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() =>
                          onRemoverEstudiante(
                            bloque.id_horario,
                            est.id_estudiante
                          )
                        }
                        className={`${horariosTableClasses.actionButton} ${horariosTableClasses.deleteButton}`}
                        title="Remover estudiante del subgrupo"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No hay estudiantes asignados a este subgrupo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {seleccionEstudiantesVisible && (
        <ModalSeleccionEstudiantes
          abierto={seleccionEstudiantesVisible}
          alCerrar={() => setSeleccionEstudiantesVisible(false)}
          idAula={bloque.fk_aula}
          estudiantesSeleccionados={(bloque.estudiantes || []).map(
            (e) => e.id_estudiante
          )}
          onGuardar={(nuevosIds) => {
            if (typeof onActualizarSubgrupo === "function") {
              onActualizarSubgrupo(bloque.id_horario, nuevosIds);
            }
            setSeleccionEstudiantesVisible(false);
          }}
        />
      )}

      <div className="pt-6 flex justify-end">
        <button
          type="button"
          onClick={alCerrar}
          className={horariosFormClasses.secondaryButton}
        >
          Cerrar
        </button>
      </div>
    </VentanaModal>
  );
};

export default ModalDetalleSubgrupo;
