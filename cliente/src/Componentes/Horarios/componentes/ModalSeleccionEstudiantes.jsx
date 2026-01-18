import React, { useState, useEffect, useCallback } from "react";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import { getEstudiantesPorAula } from "../../../api/horariosService"; 
import { horariosFormClasses } from "../../EstilosCliente/EstilosClientes";

const ModalSeleccionEstudiantes = ({
  abierto,
  alCerrar,
  idAula,
  estudiantesSeleccionados: seleccionInicial,
  onGuardar,
}) => {
  const [todosLosEstudiantes, setTodosLosEstudiantes] = useState([]);
  const [seleccionActual, setSeleccionActual] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (abierto && idAula) {
      setCargando(true);
      setError(null);
      getEstudiantesPorAula(idAula)
        .then((respuesta) => {
          if (respuesta.datos) {
            setTodosLosEstudiantes(respuesta.datos);
            // Inicializar seleccionados solo una vez cuando se cargan los datos
            setSeleccionActual(seleccionInicial || []);
          } else {
            throw new Error("No se recibieron datos de estudiantes.");
          }
        })
        .catch((err) => {
          setError(
            "Error al cargar los estudiantes. Intente de nuevo más tarde."
          );
          console.error(err);
        })
        .finally(() => {
          setCargando(false);
        });
    } else {
      // Limpiar estado cuando se cierra o no hay aula
      setTodosLosEstudiantes([]);
      setSeleccionActual([]);
      setCargando(false);
      setError(null);
    }
  }, [abierto, idAula]);

  // Sincronizar el estado interno si la prop externa cambia mientras el modal está abierto
  useEffect(() => {
    if(abierto){
        setSeleccionActual(seleccionInicial || []);
    }
  }, [seleccionInicial, abierto]);

  const manejarCambioCheckbox = (idEstudiante) => {
    setSeleccionActual((prev) =>
      prev.includes(idEstudiante)
        ? prev.filter((id) => id !== idEstudiante)
        : [...prev, idEstudiante]
    );
  };

  const manejarGuardar = () => {
    onGuardar(seleccionActual);
    alCerrar();
  };

  const toggleSeleccionarTodos = () => {
    if (seleccionActual.length === todosLosEstudiantes.length) {
      setSeleccionActual([]);
    } else {
      setSeleccionActual(todosLosEstudiantes.map((e) => e.id_estudiante));
    }
  };


  return (
    <VentanaModal
      isOpen={abierto}
      onClose={alCerrar}
      title="Asignar Estudiantes al Subgrupo"
      size="md"
    >
      <div className="space-y-4">
        {cargando && <p>Cargando estudiantes...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!cargando && !error && todosLosEstudiantes.length > 0 && (
          <>
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={toggleSeleccionarTodos}
                    className={horariosFormClasses.secondaryButton}
                >
                    {seleccionActual.length === todosLosEstudiantes.length
                    ? "Deseleccionar Todos"
                    : "Seleccionar Todos"}
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-2">
              {todosLosEstudiantes.map((estudiante) => (
                <label
                  key={estudiante.id_estudiante}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={seleccionActual.includes(estudiante.id_estudiante)}
                    onChange={() => manejarCambioCheckbox(estudiante.id_estudiante)}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-700">
                    {`${estudiante.primer_apellido}, ${estudiante.primer_nombre}`}
                  </span>
                  <span className="text-sm text-gray-500">
                    (C.E.: {estudiante.cedula})
                  </span>
                </label>
              ))}
            </div>
          </>
        )}
        {!cargando && !error && todosLosEstudiantes.length === 0 && (
          <p>No hay estudiantes activos en esta aula.</p>
        )}
      </div>
      <div className="pt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={alCerrar}
          className={horariosFormClasses.secondaryButton}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={manejarGuardar}
          className={horariosFormClasses.primaryButton}
          disabled={cargando}
        >
          Guardar Selección
        </button>
      </div>
    </VentanaModal>
  );
};

export default ModalSeleccionEstudiantes;
