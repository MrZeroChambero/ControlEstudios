import React from "react";
import DataTable from "react-data-table-component";
import { AreasAprendizajeForm } from "./AreasAprendizajeForm";
import {
  areasModalClasses,
  areasComponentTableClasses,
} from "../EstilosCliente/EstilosClientes";

export const AreasAprendizajeModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentArea,
  formData,
  datosFormulario,
  modo,
}) => {
  if (!isOpen) return null;

  const titulo =
    modo === "ver"
      ? "Ver Área de Aprendizaje"
      : currentArea
      ? "Editar Área de Aprendizaje"
      : "Crear Área de Aprendizaje";

  const columnasComponentes = [
    {
      name: "Nombre",
      selector: (row) => row.nombre_componente ?? "Sin nombre",
      sortable: true,
      wrap: true,
    },
    {
      name: "Descripción",
      selector: (row) => row.descripcion ?? "Sin descripción",
      wrap: true,
    },
    {
      name: "Estado",
      selector: (row) => row.estado ?? row.estado_componente ?? "Desconocido",
      sortable: true,
      width: "120px",
    },
  ];

  const componentes = currentArea?.componentes ?? [];

  return (
    <div className={areasModalClasses.overlay}>
      <div
        className={
          modo === "ver"
            ? areasModalClasses.contentWide
            : areasModalClasses.content
        }
      >
        <h2 className={areasModalClasses.title}>{titulo}</h2>
        <AreasAprendizajeForm
          onSubmit={onSubmit}
          onCancel={onClose}
          currentArea={currentArea}
          formData={formData}
          datosFormulario={datosFormulario}
          modoVer={modo === "ver"}
        />
        {modo === "ver" && (
          <>
            <div className={areasComponentTableClasses.wrapper}>
              <h3 className={areasComponentTableClasses.title}>
                Componentes de aprendizaje asociados
              </h3>
              <DataTable
                columns={columnasComponentes}
                data={componentes}
                noDataComponent={
                  <p className={areasComponentTableClasses.emptyState}>
                    No hay componentes asociados para este registro.
                  </p>
                }
                striped
                highlightOnHover
                dense
              />
            </div>
            <div className={areasModalClasses.footer}>
              <button
                type="button"
                onClick={onClose}
                className={areasModalClasses.closeButton}
              >
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
