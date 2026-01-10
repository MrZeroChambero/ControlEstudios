import React from "react";
import {
  formatearFechaCorta,
  formatearFechaHoraCorta,
} from "../../utilidades/formatoFechas";
import VentanaModal from "../EstilosCliente/VentanaModal";
import { usuariosViewModalClasses } from "../EstilosCliente/EstilosClientes";

const getDisplayValue = (value, fallback = "No especificado") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return value;
};

const buildVariantClass = (base, variants, key) => {
  const variant = variants?.[key] || variants?.default || "";
  return `${base} ${variant}`.trim();
};

export const UsuariosViewModal = ({ isOpen, onClose, usuario }) => {
  if (!isOpen || !usuario) return null;

  const Section = ({ title, children, columns = 2 }) => (
    <section className={usuariosViewModalClasses.section.wrapper}>
      <h3 className={usuariosViewModalClasses.section.title}>{title}</h3>
      <div
        className={
          columns === 1
            ? usuariosViewModalClasses.sectionFull
            : usuariosViewModalClasses.section.body
        }
      >
        {children}
      </div>
    </section>
  );

  const Field = ({ label, value, children }) => (
    <div className={usuariosViewModalClasses.field}>
      <span className={usuariosViewModalClasses.label}>{label}</span>
      <div className={usuariosViewModalClasses.valueBox}>
        {children ?? getDisplayValue(value)}
      </div>
    </div>
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

  const estadoClass = buildVariantClass(
    usuariosViewModalClasses.chipBase,
    usuariosViewModalClasses.estadoVariants,
    usuario.estado
  );

  const tipoFuncionClass = buildVariantClass(
    usuariosViewModalClasses.chipBase,
    usuariosViewModalClasses.tipoFuncionVariants,
    usuario.tipo_funcion
  );

  const estudiantesRepresentados = Array.isArray(
    usuario.estudiantes_representados
  )
    ? usuario.estudiantes_representados
    : [];

  const nombreCompleto = [
    usuario.primer_nombre,
    usuario.segundo_nombre,
    usuario.primer_apellido,
    usuario.segundo_apellido,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <VentanaModal
      isOpen={isOpen}
      onClose={onClose}
      title="Información Completa del Usuario"
      size="xl"
      bodyClassName={usuariosViewModalClasses.bodyLayout}
      footer={
        <button
          type="button"
          onClick={onClose}
          className={usuariosViewModalClasses.footerButton}
        >
          Cerrar
        </button>
      }
    >
      <>
        <Section title="Información de la cuenta">
          <Field label="Nombre de usuario" value={usuario.nombre_usuario} />
          <Field label="Rol" value={usuario.rol} />
          <Field label="Estado">
            <span className={estadoClass}>
              {getDisplayValue(usuario.estado)}
            </span>
          </Field>
          <Field label="Último acceso" value={ultimoLogin || "Nunca"} />
          <Field
            label="Intentos fallidos"
            value={usuario.intentos_fallidos ?? 0}
          />
          <Field
            label="Fecha de bloqueo"
            value={fechaBloqueo || "No bloqueado"}
          />
        </Section>

        <Section title="Información personal">
          <Field label="Nombre completo" value={nombreCompleto || null} />
          <Field label="Cédula" value={usuario.cedula} />
          <Field label="Fecha de nacimiento" value={fechaNacimiento} />
          <Field label="Género" value={genero} />
          <Field label="Nacionalidad" value={usuario.nacionalidad} />
          <Field label="Tipo de sangre" value={usuario.tipo_sangre} />
        </Section>

        <Section title="Información de contacto">
          <Field label="Dirección" value={usuario.direccion} />
          <Field
            label="Teléfono principal"
            value={usuario.telefono_principal}
          />
          <Field
            label="Teléfono secundario"
            value={usuario.telefono_secundario}
          />
          <Field label="Correo electrónico" value={usuario.email} />
        </Section>

        <Section title="Información laboral">
          <Field label="Cargo" value={usuario.nombre_cargo} />
          <Field label="Función" value={usuario.funcion_personal} />
          <Field label="Tipo de función">
            <span className={tipoFuncionClass}>
              {getDisplayValue(usuario.tipo_funcion)}
            </span>
          </Field>
          <Field label="Fecha de contratación" value={fechaContratacion} />
          <Field label="Nivel académico" value={usuario.nivel_academico} />
          <Field label="Horas de trabajo" value={usuario.horas_trabajo} />
          <Field label="RIF" value={usuario.rif} />
          <Field label="Etnia / Religión" value={usuario.etnia_religion} />
          <Field
            label="Cantidad de hijas"
            value={
              typeof usuario.cantidad_hijas === "number"
                ? usuario.cantidad_hijas
                : undefined
            }
          />
          <Field
            label="Cantidad de hijos varones"
            value={
              typeof usuario.cantidad_hijos_varones === "number"
                ? usuario.cantidad_hijos_varones
                : undefined
            }
          />
        </Section>

        <Section title="Estudiantes representados" columns={1}>
          {estudiantesRepresentados.length > 0 ? (
            <div className={usuariosViewModalClasses.table.wrapper}>
              <table className={usuariosViewModalClasses.table.table}>
                <thead className={usuariosViewModalClasses.table.head}>
                  <tr>
                    <th className={usuariosViewModalClasses.table.headCell}>
                      Nombre completo
                    </th>
                    <th className={usuariosViewModalClasses.table.headCell}>
                      Cédula
                    </th>
                    <th className={usuariosViewModalClasses.table.headCell}>
                      Cédula escolar
                    </th>
                    <th className={usuariosViewModalClasses.table.headCell}>
                      Grado
                    </th>
                    <th className={usuariosViewModalClasses.table.headCell}>
                      Edad
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {estudiantesRepresentados.map((estudiante) => {
                    const nombre =
                      [
                        estudiante.primer_nombre,
                        estudiante.segundo_nombre,
                        estudiante.primer_apellido,
                        estudiante.segundo_apellido,
                      ]
                        .filter(Boolean)
                        .join(" ") || "-";

                    return (
                      <tr
                        key={`${estudiante.id_estudiante}-${estudiante.cedula}`}
                        className={usuariosViewModalClasses.table.row}
                      >
                        <td className={usuariosViewModalClasses.table.cell}>
                          {nombre}
                        </td>
                        <td className={usuariosViewModalClasses.table.cell}>
                          {getDisplayValue(estudiante.cedula, "-")}
                        </td>
                        <td className={usuariosViewModalClasses.table.cell}>
                          {getDisplayValue(estudiante.cedula_escolar, "-")}
                        </td>
                        <td className={usuariosViewModalClasses.table.cell}>
                          {estudiante.grado
                            ? `Grado ${estudiante.grado}`
                            : "No inscrito"}
                        </td>
                        <td className={usuariosViewModalClasses.table.cell}>
                          {typeof estudiante.edad === "number"
                            ? `${estudiante.edad} años`
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={usuariosViewModalClasses.bannerWarning}>
              Este usuario no representa a ningún estudiante actualmente.
            </div>
          )}
        </Section>
      </>
    </VentanaModal>
  );
};
