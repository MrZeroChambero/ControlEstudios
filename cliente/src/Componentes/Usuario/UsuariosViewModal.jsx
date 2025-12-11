import React from "react";
import {
  formatearFechaCorta,
  formatearFechaHoraCorta,
} from "../../utilidades/formatoFechas";
import VentanaModal from "../EstilosCliente/VentanaModal";

export const UsuariosViewModal = ({ isOpen, onClose, usuario }) => {
  if (!isOpen || !usuario) return null;

  const formStyles = {
    label: "text-sm font-semibold text-slate-600",
    value: "text-base text-slate-900",
    sectionTitle:
      "mb-4 text-xl font-semibold text-blue-600 border-b border-slate-200 pb-2",
  };

  const Section = ({ title, children }) => (
    <section className="space-y-4">
      <h3 className={formStyles.sectionTitle}>{title}</h3>
      {children}
    </section>
  );

  const ultimoLogin = formatearFechaHoraCorta(usuario.ultimo_login);
  const fechaBloqueo = formatearFechaHoraCorta(usuario.fecha_bloqueo);
  const fechaNacimiento = formatearFechaCorta(usuario.fecha_nacimiento);
  const fechaContratacion = formatearFechaCorta(usuario.fecha_contratacion);
  const genero =
    usuario.genero === "M"
      ? "Masculino"
      : usuario.genero === "F"
      ? "Femenino"
      : "No especificado";

  const estadoChipClass =
    usuario.estado === "activo"
      ? "bg-emerald-200 text-emerald-800"
      : "bg-rose-200 text-rose-800";

  const tipoFuncionChipClass = (() => {
    if (usuario.tipo_funcion === "Administrativo") {
      return "bg-purple-200 text-purple-800";
    }
    if (usuario.tipo_funcion === "Docente") {
      return "bg-blue-200 text-blue-800";
    }
    if (usuario.tipo_funcion) {
      return "bg-emerald-200 text-emerald-800";
    }
    return "bg-slate-200 text-slate-700";
  })();

  const estudiantesRepresentados = Array.isArray(
    usuario.estudiantes_representados
  )
    ? usuario.estudiantes_representados
    : [];

  return (
    <VentanaModal
      isOpen={isOpen}
      onClose={onClose}
      title="Información Completa del Usuario"
      size="xl"
      bodyClassName="space-y-8"
      contentClassName="max-w-4xl"
    >
      <>
        <Section title="Información de la Cuenta">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className={formStyles.label}>Nombre de Usuario</p>
              <p className={formStyles.value}>{usuario.nombre_usuario}</p>
            </div>
            <div>
              <p className={formStyles.label}>Rol</p>
              <p className={formStyles.value}>{usuario.rol}</p>
            </div>
            <div>
              <p className={formStyles.label}>Estado</p>
              <p className={formStyles.value}>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${estadoChipClass}`}
                >
                  {usuario.estado || "No especificado"}
                </span>
              </p>
            </div>
            <div>
              <p className={formStyles.label}>Último Login</p>
              <p className={formStyles.value}>{ultimoLogin || "Nunca"}</p>
            </div>
            <div>
              <p className={formStyles.label}>Intentos Fallidos</p>
              <p className={formStyles.value}>
                {usuario.intentos_fallidos || 0}
              </p>
            </div>
            <div>
              <p className={formStyles.label}>Fecha de Bloqueo</p>
              <p className={formStyles.value}>
                {fechaBloqueo || "No bloqueado"}
              </p>
            </div>
          </div>
        </Section>

        <Section title="Información Personal">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className={formStyles.label}>Nombre Completo</p>
              <p className={formStyles.value}>
                {[
                  usuario.primer_nombre,
                  usuario.segundo_nombre,
                  usuario.primer_apellido,
                  usuario.segundo_apellido,
                ]
                  .filter(Boolean)
                  .join(" ") || "No especificado"}
              </p>
            </div>
            <div>
              <p className={formStyles.label}>Cédula</p>
              <p className={formStyles.value}>
                {usuario.cedula || "No especificado"}
              </p>
            </div>
            <div>
              <p className={formStyles.label}>Fecha de Nacimiento</p>
              <p className={formStyles.value}>
                {fechaNacimiento || "No especificado"}
              </p>
            </div>
            <div>
              <p className={formStyles.label}>Género</p>
              <p className={formStyles.value}>{genero}</p>
            </div>
            <div>
              <p className={formStyles.label}>Nacionalidad</p>
              <p className={formStyles.value}>
                {usuario.nacionalidad || "No especificado"}
              </p>
            </div>
            <div>
              <p className={formStyles.label}>Tipo de Sangre</p>
              <p className={formStyles.value}>
                {usuario.tipo_sangre || "No especificado"}
              </p>
            </div>
          </div>
        </Section>

        <Section title="Información de Contacto">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className={formStyles.label}>Dirección</p>
              <p className={formStyles.value}>
                {usuario.direccion || "No especificado"}
              </p>
            </div>
            <div>
              <p className={formStyles.label}>Teléfono Principal</p>
              <p className={formStyles.value}>
                {usuario.telefono_principal || "No especificado"}
              </p>
            </div>
            <div>
              <p className={formStyles.label}>Teléfono Secundario</p>
              <p className={formStyles.value}>
                {usuario.telefono_secundario || "No especificado"}
              </p>
            </div>
            <div>
              <p className={formStyles.label}>Email</p>
              <p className={formStyles.value}>
                {usuario.email || "No especificado"}
              </p>
            </div>
          </div>
        </Section>

        <Section title="Información Laboral">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className={formStyles.label}>Cargo</p>
              <p className={formStyles.value}>
                {usuario.nombre_cargo || "No especificado"}
              </p>
            </div>
            <div>
              <p className={formStyles.label}>Función</p>
              <p className={formStyles.value}>
                {usuario.funcion_personal || "No especificado"}
              </p>
            </div>
            <div>
              <p className={formStyles.label}>Tipo de Función</p>
              <p className={formStyles.value}>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${tipoFuncionChipClass}`}
                >
                  {usuario.tipo_funcion || "No especificado"}
                </span>
              </p>
            </div>
            <div>
              <p className={formStyles.label}>Fecha de Contratación</p>
              <p className={formStyles.value}>
                {fechaContratacion || "No especificado"}
              </p>
            </div>
            <div>
              <p className={formStyles.label}>Nivel Académico</p>
              <p className={formStyles.value}>
                {usuario.nivel_academico || "No especificado"}
              </p>
            </div>
            <div>
              <p className={formStyles.label}>Horas de Trabajo</p>
              <p className={formStyles.value}>
                {usuario.horas_trabajo || "No especificado"}
              </p>
            </div>
            <div>
              <p className={formStyles.label}>RIF</p>
              <p className={formStyles.value}>
                {usuario.rif || "No especificado"}
              </p>
            </div>
            <div>
              <p className={formStyles.label}>Etnia/Religión</p>
              <p className={formStyles.value}>
                {usuario.etnia_religion || "No especificado"}
              </p>
            </div>
            <div>
              <p className={formStyles.label}>Cantidad de Hijas</p>
              <p className={formStyles.value}>
                {typeof usuario.cantidad_hijas === "number"
                  ? usuario.cantidad_hijas
                  : "No especificado"}
              </p>
            </div>
            <div>
              <p className={formStyles.label}>Cantidad de Hijos Varones</p>
              <p className={formStyles.value}>
                {typeof usuario.cantidad_hijos_varones === "number"
                  ? usuario.cantidad_hijos_varones
                  : "No especificado"}
              </p>
            </div>
          </div>
        </Section>

        <Section title="Estudiantes Representados">
          {estudiantesRepresentados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse border border-slate-200 text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-200 px-4 py-2 text-left">
                      Nombre Completo
                    </th>
                    <th className="border border-slate-200 px-4 py-2 text-left">
                      Cédula
                    </th>
                    <th className="border border-slate-200 px-4 py-2 text-left">
                      Cédula Escolar
                    </th>
                    <th className="border border-slate-200 px-4 py-2 text-left">
                      Grado
                    </th>
                    <th className="border border-slate-200 px-4 py-2 text-left">
                      Edad
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {estudiantesRepresentados.map((estudiante, index) => {
                    const nombreCompleto =
                      [
                        estudiante.primer_nombre,
                        estudiante.segundo_nombre,
                        estudiante.primer_apellido,
                        estudiante.segundo_apellido,
                      ]
                        .filter(Boolean)
                        .join(" ") || "-";

                    return (
                      <tr key={index} className="transition hover:bg-slate-50">
                        <td className="border border-slate-200 px-4 py-2">
                          {nombreCompleto}
                        </td>
                        <td className="border border-slate-200 px-4 py-2">
                          {estudiante.cedula || "No especificado"}
                        </td>
                        <td className="border border-slate-200 px-4 py-2">
                          {estudiante.cedula_escolar || "No especificado"}
                        </td>
                        <td className="border border-slate-200 px-4 py-2">
                          {estudiante.grado
                            ? `Grado ${estudiante.grado}`
                            : "No inscrito"}
                        </td>
                        <td className="border border-slate-200 px-4 py-2">
                          {typeof estudiante.edad === "number"
                            ? `${estudiante.edad} años`
                            : "No especificado"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Este usuario no representa a ningún estudiante actualmente.
            </div>
          )}
        </Section>
      </>
    </VentanaModal>
  );
};
