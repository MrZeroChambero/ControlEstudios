import React from "react";
import DataTable from "react-data-table-component";
import { AreasAprendizajeForm } from "./AreasAprendizajeForm";
import { areasComponentTableClasses } from "./areasAprendizajeEstilos";
import VentanaModal from "../EstilosCliente/VentanaModal";

export const AreasAprendizajeModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentArea,
  formData,
  datosFormulario,
  modo,
}) => {
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
    <VentanaModal
      isOpen={isOpen}
      onClose={onClose}
      title={titulo}
      size={modo === "ver" ? "xl" : "lg"}
      bodyClassName={modo === "ver" ? "space-y-6" : "space-y-4"}
    >
      <AreasAprendizajeForm
        onSubmit={onSubmit}
        onCancel={onClose}
        currentArea={currentArea}
        formData={formData}
        datosFormulario={datosFormulario}
        modoVer={modo === "ver"}
      />
      {modo === "ver" && (
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
      )}
    </VentanaModal>
  );
};
