import React from "react";

export const RepresentanteViewModal = ({ isOpen, onClose, representante }) => {
  if (!isOpen || !representante) return null;

  const formStyles = {
    label: "block text-gray-700 text-sm font-bold mb-2",
    value: "text-gray-900 text-lg",
    sectionTitle: "text-xl font-bold mb-4 text-blue-600 border-b pb-2",
    chipBase:
      "px-2 py-1 text-xs font-bold rounded-full inline-block align-middle",
  };

  const nombreCompleto = `${representante.primer_nombre || ""} ${
    representante.segundo_nombre || ""
  } ${representante.primer_apellido || ""} ${
    representante.segundo_apellido || ""
  }`.trim();

  const estadoPersonaChipClass = `${formStyles.chipBase} ${
    representante.estado === "activo"
      ? "bg-green-200 text-green-800"
      : representante.estado === "incompleto"
      ? "bg-yellow-200 text-yellow-800"
      : "bg-red-200 text-red-800"
  }`;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex justify-center items-start z-50 overflow-y-auto py-10">
      <div className="bg-white/90 backdrop-blur-lg p-8 rounded-lg shadow-2xl w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Detalle de Representante</h2>
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Cerrar
          </button>
        </div>

        {/* Estados */}
        <div className="mb-8">
          <h3 className={formStyles.sectionTitle}>Estado</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={formStyles.label}>Estado Persona</label>
              <p className={formStyles.value}>
                <span className={estadoPersonaChipClass}>
                  {representante.estado_persona_nombre ||
                    representante.estado ||
                    "-"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Información General */}
        <div className="mb-8">
          <h3 className={formStyles.sectionTitle}>Información General</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={formStyles.label}>Nombre Completo</label>
              <p className={formStyles.value}>{nombreCompleto || "-"}</p>
            </div>
            <div>
              <label className={formStyles.label}>Cédula</label>
              <p className={formStyles.value}>{representante.cedula || "-"}</p>
            </div>
            <div>
              <label className={formStyles.label}>Fecha de Nacimiento</label>
              <p className={formStyles.value}>
                {representante.fecha_nacimiento || representante.fecha || "-"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Género</label>
              <p className={formStyles.value}>{representante.genero || "-"}</p>
            </div>
            <div>
              <label className={formStyles.label}>Nacionalidad</label>
              <p className={formStyles.value}>
                {representante.nacionalidad || "-"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Dirección</label>
              <p className={formStyles.value}>
                {representante.direccion || "No especificada"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Teléfono Principal</label>
              <p className={formStyles.value}>
                {representante.telefono_principal || "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Teléfono Secundario</label>
              <p className={formStyles.value}>
                {representante.telefono_secundario || "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Email</label>
              <p className={formStyles.value}>
                {representante.email || "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Tipo de Sangre</label>
              <p className={formStyles.value}>
                {representante.tipo_sangre || "No sabe"}
              </p>
            </div>
          </div>
        </div>

        {/* Datos del Representante (tabla representante) */}
        <div className="mb-8">
          <h3 className={formStyles.sectionTitle}>Datos del Representante</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={formStyles.label}>Profesión</label>
              <p className={formStyles.value}>
                {representante.profesion ||
                  representante.representante?.profesion ||
                  "-"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Oficio</label>
              <p className={formStyles.value}>
                {representante.oficio ||
                  representante.representante?.oficio ||
                  "-"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Nivel Educativo</label>
              <p className={formStyles.value}>
                {representante.nivel_educativo ||
                  representante.representante?.nivel_educativo ||
                  "-"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Lugar de Trabajo</label>
              <p className={formStyles.value}>
                {representante.lugar_trabajo ||
                  representante.representante?.lugar_trabajo ||
                  "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Sección Personal (si aplica) */}
        {representante.personal && (
          <div className="mb-8">
            <h3 className={formStyles.sectionTitle}>Personal</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={formStyles.label}>Cargo</label>
                <p className={formStyles.value}>
                  {representante.personal.nombre_cargo || "-"}
                </p>
              </div>
              <div>
                <label className={formStyles.label}>Función</label>
                <p className={formStyles.value}>
                  {representante.personal.nombre_funcion || "-"}
                </p>
              </div>
              <div>
                <label className={formStyles.label}>Nivel Académico</label>
                <p className={formStyles.value}>
                  {representante.personal.nivel_academico || "-"}
                </p>
              </div>
              <div>
                <label className={formStyles.label}>Horas Trabajo</label>
                <p className={formStyles.value}>
                  {representante.personal.horas_trabajo || "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sección Estudiante (si aplica) */}
        {representante.estudiante && (
          <div className="mb-8">
            <h3 className={formStyles.sectionTitle}>Estudiante</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={formStyles.label}>ID Estudiante</label>
                <p className={formStyles.value}>
                  {representante.estudiante.id_estudiante}
                </p>
              </div>
              <div>
                <label className={formStyles.label}>Fecha Ingreso</label>
                <p className={formStyles.value}>
                  {representante.estudiante.fecha_ingreso_escuela || "-"}
                </p>
              </div>
              <div>
                <label className={formStyles.label}>Edad</label>
                <p className={formStyles.value}>
                  {representante.estudiante.edad || "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alergias */}
        {representante.alergias && representante.alergias.length > 0 && (
          <div className="mb-8">
            <h3 className={formStyles.sectionTitle}>Alergias</h3>
            <div className="flex flex-wrap gap-2">
              {representante.alergias.map((a) => (
                <span
                  key={a.id_lista_alergia}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold"
                >
                  {a.nombre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Vacunas */}
        {representante.vacunas && representante.vacunas.length > 0 && (
          <div className="mb-8">
            <h3 className={formStyles.sectionTitle}>Vacunas</h3>
            <div className="space-y-2">
              {representante.vacunas.map((v) => (
                <div
                  key={v.id_vacuna_estudiante}
                  className="flex justify-between items-center bg-green-50 border border-green-200 rounded px-3 py-1"
                >
                  <span className="text-sm font-medium text-green-800">
                    {v.nombre}
                  </span>
                  <span className="text-xs text-green-600">
                    {v.fecha_aplicacion || "Sin fecha"}{" "}
                    {v.refuerzos && `(Refuerzos: ${v.refuerzos})`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estudiantes Familia (Parentesco) */}
        {representante.estudiantes_familia &&
          representante.estudiantes_familia.length > 0 && (
            <div className="mb-8">
              <h3 className={formStyles.sectionTitle}>
                Estudiantes Vinculados
              </h3>
              <div className="space-y-2">
                {representante.estudiantes_familia.map((e) => (
                  <div
                    key={e.id_estudiante}
                    className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded px-3 py-1"
                  >
                    <span className="text-sm font-medium text-blue-800">
                      {e.primer_nombre} {e.primer_apellido}
                    </span>
                    <span className="text-xs text-blue-600">
                      Cédula: {e.cedula || "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepresentanteViewModal;
