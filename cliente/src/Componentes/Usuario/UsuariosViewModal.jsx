import React from "react";
import {
  formatearFechaCorta,
  formatearFechaHoraCorta,
} from "../../utilidades/formatoFechas";

export const UsuariosViewModal = ({ isOpen, onClose, usuario }) => {
  if (!isOpen || !usuario) return null;

  const formStyles = {
    label: "block text-gray-700 text-sm font-bold mb-2",
    value: "text-gray-900 text-lg",
    sectionTitle: "text-xl font-bold mb-4 text-blue-600 border-b pb-2",
  };

  const ultimoLogin = formatearFechaHoraCorta(usuario.ultimo_login);
  const fechaBloqueo = formatearFechaHoraCorta(usuario.fecha_bloqueo);
  const fechaNacimiento = formatearFechaCorta(usuario.fecha_nacimiento);
  const fechaContratacion = formatearFechaCorta(usuario.fecha_contratacion);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start z-50 overflow-y-auto py-10">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6">
          Información Completa del Usuario
        </h2>

        {/* Información del Usuario */}
        <div className="mb-8">
          <h3 className={formStyles.sectionTitle}>Información de la Cuenta</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={formStyles.label}>Nombre de Usuario</label>
              <p className={formStyles.value}>{usuario.nombre_usuario}</p>
            </div>
            <div>
              <label className={formStyles.label}>Rol</label>
              <p className={formStyles.value}>{usuario.rol}</p>
            </div>
            <div>
              <label className={formStyles.label}>Estado</label>
              <p className={formStyles.value}>
                <span
                  className={`px-2 py-1 text-xs font-bold rounded-full ${
                    usuario.estado === "activo"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {usuario.estado}
                </span>
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Último Login</label>
              <p className={formStyles.value}>{ultimoLogin || "Nunca"}</p>
            </div>
            <div>
              <label className={formStyles.label}>Intentos Fallidos</label>
              <p className={formStyles.value}>
                {usuario.intentos_fallidos || 0}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Fecha de Bloqueo</label>
              <p className={formStyles.value}>
                {fechaBloqueo || "No bloqueado"}
              </p>
            </div>
          </div>
        </div>

        {/* Información Personal */}
        <div className="mb-8">
          <h3 className={formStyles.sectionTitle}>Información Personal</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={formStyles.label}>Nombre Completo</label>
              <p className={formStyles.value}>
                {usuario.primer_nombre} {usuario.segundo_nombre || ""}{" "}
                {usuario.primer_apellido} {usuario.segundo_apellido || ""}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Cédula</label>
              <p className={formStyles.value}>{usuario.cedula}</p>
            </div>
            <div>
              <label className={formStyles.label}>Fecha de Nacimiento</label>
              <p className={formStyles.value}>{fechaNacimiento || "-"}</p>
            </div>
            <div>
              <label className={formStyles.label}>Género</label>
              <p className={formStyles.value}>
                {usuario.genero === "M" ? "Masculino" : "Femenino"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Nacionalidad</label>
              <p className={formStyles.value}>{usuario.nacionalidad}</p>
            </div>
            <div>
              <label className={formStyles.label}>Tipo de Sangre</label>
              <p className={formStyles.value}>{usuario.tipo_sangre}</p>
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="mb-8">
          <h3 className={formStyles.sectionTitle}>Información de Contacto</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={formStyles.label}>Dirección</label>
              <p className={formStyles.value}>{usuario.direccion}</p>
            </div>
            <div>
              <label className={formStyles.label}>Teléfono Principal</label>
              <p className={formStyles.value}>{usuario.telefono_principal}</p>
            </div>
            <div>
              <label className={formStyles.label}>Teléfono Secundario</label>
              <p className={formStyles.value}>
                {usuario.telefono_secundario || "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Email</label>
              <p className={formStyles.value}>
                {usuario.email || "No especificado"}
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
              <p className={formStyles.value}>
                {usuario.nombre_cargo || "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Función</label>
              <p className={formStyles.value}>
                {usuario.funcion_personal || "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Tipo de Función</label>
              <p className={formStyles.value}>
                <span
                  className={`px-2 py-1 text-xs font-bold rounded-full ${
                    usuario.tipo_funcion === "Administrativo"
                      ? "bg-purple-200 text-purple-800"
                      : usuario.tipo_funcion === "Docente"
                      ? "bg-blue-200 text-blue-800"
                      : "bg-green-200 text-green-800"
                  }`}
                >
                  {usuario.tipo_funcion || "No especificado"}
                </span>
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Fecha de Contratación</label>
              <p className={formStyles.value}>
                {fechaContratacion || "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Nivel Académico</label>
              <p className={formStyles.value}>
                {usuario.nivel_academico || "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Horas de Trabajo</label>
              <p className={formStyles.value}>
                {usuario.horas_trabajo || "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>RIF</label>
              <p className={formStyles.value}>
                {usuario.rif || "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Etnia/Religión</label>
              <p className={formStyles.value}>
                {usuario.etnia_religion || "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>Cantidad de Hijas</label>
              <p className={formStyles.value}>
                {usuario.cantidad_hijas ?? "No especificado"}
              </p>
            </div>
            <div>
              <label className={formStyles.label}>
                Cantidad de Hijos Varones
              </label>
              <p className={formStyles.value}>
                {usuario.cantidad_hijos_varones ?? "No especificado"}
              </p>
            </div>
          </div>
        </div>

        {/* Estudiantes Representados */}
        {usuario.estudiantes_representados &&
          usuario.estudiantes_representados.length > 0 && (
            <div className="mb-8">
              <h3 className={formStyles.sectionTitle}>
                Estudiantes Representados
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Nombre Completo
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Cédula
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Cédula Escolar
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Grado
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Edad
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuario.estudiantes_representados.map(
                      (estudiante, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">
                            {estudiante.primer_nombre}{" "}
                            {estudiante.segundo_nombre || ""}{" "}
                            {estudiante.primer_apellido}{" "}
                            {estudiante.segundo_apellido || ""}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {estudiante.cedula}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {estudiante.cedula_escolar}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {estudiante.grado
                              ? `Grado ${estudiante.grado}`
                              : "No inscrito"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {estudiante.edad} años
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {(!usuario.estudiantes_representados ||
          usuario.estudiantes_representados.length === 0) && (
          <div className="mb-8">
            <h3 className={formStyles.sectionTitle}>
              Estudiantes Representados
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-center">
                Este usuario no representa a ningún estudiante actualmente.
              </p>
            </div>
          </div>
        )}

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
