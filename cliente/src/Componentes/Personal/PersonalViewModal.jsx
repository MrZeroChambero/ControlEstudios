import React from "react";

export const PersonalViewModal = ({ isOpen, onClose, personal }) => {
  if (!isOpen || !personal) return null;

  const formStyles = {
    label: "block text-gray-700 text-sm font-bold mb-2",
    value: "text-gray-900 text-lg",
    sectionTitle: "text-xl font-bold mb-4 text-blue-600 border-b pb-2",
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto py-10">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6">
          Información Completa del Personal
        </h2>

        {/* Información Personal */}
        <div className="mb-8">
          <h3 className={formStyles.sectionTitle}>Información Personal</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={formStyles.label}>Nombre Completo</label>
              <p className={formStyles.value}>
                {personal.primer_nombre} {personal.segundo_nombre || ""}{" "}
                {personal.primer_apellido} {personal.segundo_apellido || ""}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Cédula</label>
              <p className={formStyles.value}>{personal.cedula}</p>
            </div>
            <div>
              <label className={formStyles.label}>Fecha de Nacimiento</label>
              <p className={formStyles.value}>
                {new Date(personal.fecha_nacimiento).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Edad</label>
              <p className={formStyles.value}>{personal.edad} años</p>
            </div>
            <div>
              <label className={formStyles.label}>Género</label>
              <p className={formStyles.value}>
                {personal.genero === "M" ? "Masculino" : "Femenino"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Nacionalidad</label>
              <p className={formStyles.value}>{personal.nacionalidad}</p>
            </div>
            <div>
              <label className={formStyles.label}>Tipo de Sangre</label>
              <p className={formStyles.value}>{personal.tipo_sangre}</p>
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="mb-8">
          <h3 className={formStyles.sectionTitle}>Información de Contacto</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={formStyles.label}>Dirección</label>
              <p className={formStyles.value}>{personal.direccion}</p>
            </div>
            <div>
              <label className={formStyles.label}>Teléfono Principal</label>
              <p className={formStyles.value}>{personal.telefono_principal}</p>
            </div>
            <div>
              <label className={formStyles.label}>Teléfono Secundario</label>
              <p className={formStyles.value}>
                {personal.telefono_secundario || "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Email</label>
              <p className={formStyles.value}>
                {personal.email || "No especificado"}
              </p>
            </div>
          </div>
        </div>

        {/* Información Laboral */}
        <div className="mb-8">
          <h3 className={formStyles.sectionTitle}>Información Laboral</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={formStyles.label}>Cargo</label>
              <p className={formStyles.value}>{personal.nombre_cargo}</p>
            </div>
            <div>
              <label className={formStyles.label}>Función</label>
              <p className={formStyles.value}>{personal.nombre_funcion}</p>
            </div>
            <div>
              <label className={formStyles.label}>Tipo de Cargo</label>
              <p className={formStyles.value}>
                <span
                  className={`px-2 py-1 text-xs font-bold rounded-full ${
                    personal.tipo_cargo === "Administrativo"
                      ? "bg-purple-200 text-purple-800"
                      : personal.tipo_cargo === "Docente"
                      ? "bg-blue-200 text-blue-800"
                      : "bg-green-200 text-green-800"
                  }`}
                >
                  {personal.tipo_cargo}
                </span>
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Tipo de Función</label>
              <p className={formStyles.value}>
                <span
                  className={`px-2 py-1 text-xs font-bold rounded-full ${
                    personal.tipo_funcion === "Administrativo"
                      ? "bg-purple-200 text-purple-800"
                      : personal.tipo_funcion === "Docente"
                      ? "bg-blue-200 text-blue-800"
                      : "bg-green-200 text-green-800"
                  }`}
                >
                  {personal.tipo_funcion}
                </span>
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Fecha de Contratación</label>
              <p className={formStyles.value}>
                {new Date(personal.fecha_contratacion).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Nivel Académico</label>
              <p className={formStyles.value}>
                {personal.nivel_academico || "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Horas de Trabajo</label>
              <p className={formStyles.value}>
                {personal.horas_trabajo || "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>RIF</label>
              <p className={formStyles.value}>
                {personal.rif || "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Etnia/Religión</label>
              <p className={formStyles.value}>
                {personal.etnia_religion || "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Cantidad de Hijas</label>
              <p className={formStyles.value}>
                {personal.cantidad_hijas ?? "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>
                Cantidad de Hijos Varones
              </label>
              <p className={formStyles.value}>
                {personal.cantidad_hijos_varones ?? "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Código de Dependencia</label>
              <p className={formStyles.value}>
                {personal.cod_dependencia || "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Estado</label>
              <p className={formStyles.value}>
                <span
                  className={`px-2 py-1 text-xs font-bold rounded-full ${
                    personal.estado === "activo"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {personal.estado}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
