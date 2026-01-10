import React, { useState } from "react";
import {
  inscripcionFormClasses,
  inscripcionSummaryClasses,
  typography,
  typographyScale,
  textColors,
  fontWeights,
  typePillBase,
} from "../../EstilosCliente/EstilosClientes";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import { textosInscripcion } from "../textosInscripcion";

const traduccionTipo = (valor, catalogo = []) => {
  const encontrado = catalogo.find((item) => item.valor === valor);
  if (encontrado) {
    return encontrado.etiqueta;
  }
  if (typeof valor === "string") {
    return valor.replace(/_/g, " ");
  }
  return "";
};

const mostrarNumero = (valor) => {
  if (valor === null || valor === undefined || valor === "") {
    return "Sin dato";
  }
  const numero = Number(valor);
  if (Number.isNaN(numero)) {
    return valor;
  }
  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numero);
};

const traducirSiNo = (valor) => (valor === "si" ? "Sí" : "No");
const toSlug = (valor) =>
  String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const gradoNumeroATexto = (valor) => {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === "string" && valor.trim() !== "") {
    return valor;
  }

  const numero = Number(valor);
  if (Number.isNaN(numero)) return null;

  const mapa = {
    0: "Educ. Inicial",
    1: "1.º grado",
    2: "2.º grado",
    3: "3.º grado",
    4: "4.º grado",
    5: "5.º grado",
    6: "6.º grado",
  };

  return mapa[numero] || `${numero}.º grado`;
};

const DOCUMENTOS = [
  { id: "foto_estudiante", etiqueta: "Foto del estudiante" },
  { id: "foto_representante", etiqueta: "Foto del representante" },
  { id: "cedula_estudiante", etiqueta: "Documento del estudiante" },
  { id: "cedula_representante", etiqueta: "Cédula del representante" },
];

const summaryContainerClass =
  "rounded-3xl border border-slate-100 bg-white p-6 shadow-md";
const summaryTitleClass = typography.titleSm;
const summaryDescriptionClass = typography.bodyMutedSm;
const emptyStateContainerClass =
  "rounded-3xl border border-dashed border-slate-200 bg-white p-6";
const emptyStateTitleClass = `${typography.titleSm} mb-2`;
const emptyStateBodyClass = typography.bodyMutedSm;
const sectionTitleClass = `${typographyScale.base} ${fontWeights.semibold} ${textColors.secondary}`;
const gridLabelClass = `${typography.pill} text-slate-400`;
const gridValueClass = `${typographyScale.sm} ${fontWeights.medium} ${textColors.tertiary}`;
const documentStatusDeliveredClass = `${typePillBase} bg-emerald-100 text-emerald-700`;
const documentStatusPendingClass = `${typePillBase} bg-slate-200 text-slate-600`;
const summaryStatusSuccessClass = `${typePillBase} bg-emerald-100 text-emerald-700`;
const summaryStatusPendingClass = `${typePillBase} bg-amber-100 text-amber-700`;
const warningHeadingClass = `${typographyScale.base} ${fontWeights.semibold} text-amber-700`;
const warningBodyClass = `${typographyScale.sm} text-amber-700`;
const ajustesBodyClass = `${typographyScale.sm} text-blue-800`;

const TarjetasPrincipales = ({ resumen, tiposInscripcion }) => {
  const {
    estudiante = {},
    representante = {},
    aula = {},
    datos = {},
    tipoInscripcion,
    resultado = {},
  } = resumen;

  const docenteNombre =
    aula.docente?.nombre || resultado?.aula?.docente?.nombre || "Sin asignar";
  const gradoTexto =
    gradoNumeroATexto(aula.grado) ??
    (aula.grado !== undefined && aula.grado !== null
      ? `${aula.grado}°`
      : "Sin grado");
  const seccionTexto = aula.seccion ?? "Sin sección";
  const gradoSeccion = [gradoTexto, seccionTexto].join(" ").trim();
  const tipoInscripcionTexto =
    traduccionTipo(tipoInscripcion, tiposInscripcion) || "Sin definir";
  const fechaInscripcion = datos.fecha_inscripcion || "Sin registrar";

  return (
    <div
      name="resumen-tarjetas-principales"
      className={inscripcionSummaryClasses.grid}
    >
      <article
        name="tarjeta-resumen-estudiante"
        className={inscripcionSummaryClasses.card}
      >
        <h3 className={inscripcionSummaryClasses.title}>Estudiante</h3>
        <p className={inscripcionSummaryClasses.itemLabel}>Nombre</p>
        <p className={inscripcionSummaryClasses.itemValue}>
          {estudiante.nombre_completo ?? estudiante.nombre ?? "Sin dato"}
        </p>
        <p className={inscripcionSummaryClasses.itemLabel}>Cédula</p>
        <p className={inscripcionSummaryClasses.itemValue}>
          {estudiante.cedula || "Sin cédula"}
        </p>
      </article>

      <article
        name="tarjeta-resumen-representante"
        className={inscripcionSummaryClasses.card}
      >
        <h3 className={inscripcionSummaryClasses.title}>Representante</h3>
        <p className={inscripcionSummaryClasses.itemLabel}>Nombre</p>
        <p className={inscripcionSummaryClasses.itemValue}>
          {representante.nombre_completo ?? representante.nombre ?? "Sin dato"}
        </p>
        <p className={inscripcionSummaryClasses.itemLabel}>Documento</p>
        <p className={inscripcionSummaryClasses.itemValue}>
          {representante.cedula || "Sin cédula"}
        </p>
        <p className={inscripcionSummaryClasses.itemLabel}>Parentesco</p>
        <p className={inscripcionSummaryClasses.itemValue}>
          {representante.tipo_parentesco || "Sin dato"}
        </p>
      </article>

      <article
        name="tarjeta-resumen-aula"
        className={inscripcionSummaryClasses.card}
      >
        <h3 className={inscripcionSummaryClasses.title}>Sección asignada</h3>
        <p className={inscripcionSummaryClasses.itemLabel}>Grado y sección</p>
        <p className={inscripcionSummaryClasses.itemValue}>
          {gradoSeccion || "Sin sección"}
        </p>
        <p className={inscripcionSummaryClasses.itemLabel}>Docente titular</p>
        <p className={inscripcionSummaryClasses.itemValue}>{docenteNombre}</p>
      </article>

      <article
        name="tarjeta-resumen-inscripcion"
        className={inscripcionSummaryClasses.card}
      >
        <h3 className={inscripcionSummaryClasses.title}>Inscripción</h3>
        <p className={inscripcionSummaryClasses.itemLabel}>Tipo</p>
        <p className={inscripcionSummaryClasses.itemValue}>
          {tipoInscripcionTexto}
        </p>
        <p className={inscripcionSummaryClasses.itemLabel}>Fecha</p>
        <p className={inscripcionSummaryClasses.itemValue}>
          {fechaInscripcion}
        </p>
      </article>
    </div>
  );
};

const DetalleResumen = ({ resumen, tiposInscripcion }) => {
  const { datos = {}, resultado = {} } = resumen;

  const documentosPendientes = Array.isArray(resultado.documentos_pendientes)
    ? resultado.documentos_pendientes
    : [];
  const ajustesAplicados = Array.isArray(resultado.ajustes)
    ? resultado.ajustes
    : [];

  const hogar = [
    { etiqueta: "Fecha de inscripción", valor: datos.fecha_inscripcion },
    { etiqueta: "Vive con", valor: datos.vive_con },
    { etiqueta: "Tipo de vivienda", valor: datos.tipo_vivienda },
    { etiqueta: "Zona", valor: datos.zona_vivienda },
    { etiqueta: "Tenencia", valor: datos.tenencia_viviencia },
    { etiqueta: "Miembros familiares", valor: datos.miembros_familia },
    {
      etiqueta: "Ingreso mensual (Bs)",
      valor: mostrarNumero(datos.ingreso_familiar),
    },
  ];

  const antropometria = [
    { etiqueta: "Altura (cm)", valor: mostrarNumero(datos.altura) },
    { etiqueta: "Peso (kg)", valor: mostrarNumero(datos.peso) },
    { etiqueta: "Talla zapatos", valor: datos.talla_zapatos },
    { etiqueta: "Talla camisa", valor: datos.talla_camisa },
    { etiqueta: "Talla pantalón", valor: datos.talla_pantalon },
  ];

  const participacion = [
    {
      etiqueta: "Tareas comunitarias",
      valor: traducirSiNo(datos.tareas_comunitarias),
    },
    {
      etiqueta: "Participará en comité",
      valor: traducirSiNo(datos.participar_comite),
    },
    {
      etiqueta: "Detalle participación",
      valor: datos.detalles_participacion,
    },
  ];

  return (
    <div name="contenedor-detalle-resumen" className="space-y-6">
      {resultado?.id_inscripcion ? (
        <div
          name="resumen-mensaje-exito"
          className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-700"
        >
          <p className="font-semibold">Inscripción registrada correctamente.</p>
          <p>
            Código interno: <strong>{resultado.id_inscripcion}</strong>. Fecha
            registrada: <strong>{resultado.fecha_inscripcion}</strong>.
          </p>
        </div>
      ) : null}

      <TarjetasPrincipales
        resumen={resumen}
        tiposInscripcion={tiposInscripcion}
      />

      <section name="resumen-datos-hogar">
        <h3 className={`mb-3 ${sectionTitleClass}`}>Datos del hogar</h3>
        <div
          name="resumen-lista-hogar"
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {hogar.map((item) => (
            <div
              key={item.etiqueta}
              name={`resumen-hogar-${toSlug(item.etiqueta)}`}
              className="rounded-3xl border border-slate-100 bg-slate-50 p-4"
            >
              <p className={gridLabelClass}>{item.etiqueta}</p>
              <p className={gridValueClass}>{item.valor || "Sin dato"}</p>
            </div>
          ))}
        </div>
      </section>

      <section name="resumen-indicadores-antropometricos">
        <h3 className={`mb-3 ${sectionTitleClass}`}>
          Indicadores antropométricos
        </h3>
        <div
          name="resumen-lista-antropometria"
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {antropometria.map((item) => (
            <div
              key={item.etiqueta}
              name={`resumen-antropometria-${toSlug(item.etiqueta)}`}
              className="rounded-3xl border border-slate-100 bg-slate-50 p-4"
            >
              <p className={gridLabelClass}>{item.etiqueta}</p>
              <p className={gridValueClass}>{item.valor || "Sin dato"}</p>
            </div>
          ))}
        </div>
      </section>

      <section name="resumen-participacion-documentos">
        <h3 className={`mb-3 ${sectionTitleClass}`}>
          Participación y documentos
        </h3>
        <div
          name="resumen-grid-participacion-documentos"
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div
            name="resumen-participacion"
            className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50 p-4"
          >
            {participacion.map((item) => (
              <div
                key={item.etiqueta}
                name={`resumen-participacion-${toSlug(item.etiqueta)}`}
              >
                <p className={gridLabelClass}>{item.etiqueta}</p>
                <p className={gridValueClass}>{item.valor || "Sin dato"}</p>
              </div>
            ))}
          </div>

          <div
            name="resumen-documentos"
            className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50 p-4"
          >
            {DOCUMENTOS.map((doc) => (
              <div
                key={doc.id}
                name={`resumen-documento-${doc.id}`}
                className="flex items-center justify-between"
              >
                <p className={gridValueClass}>{doc.etiqueta}</p>
                <span
                  className={
                    (datos[doc.id] ?? "no") === "si"
                      ? documentStatusDeliveredClass
                      : documentStatusPendingClass
                  }
                >
                  {(datos[doc.id] ?? "no") === "si" ? "Entregado" : "Pendiente"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {documentosPendientes.length > 0 ? (
        <section name="resumen-documentos-pendientes">
          <h3 className={`mb-3 ${warningHeadingClass}`}>
            Documentos pendientes para completar la inscripción
          </h3>
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
            <p className={warningBodyClass}>
              Presenta{" "}
              {documentosPendientes.length === 1
                ? "el siguiente"
                : "los siguientes"}{" "}
              documento{documentosPendientes.length === 1 ? "" : "s"}:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {documentosPendientes.map((doc) => (
                <li key={toSlug(doc)} className={warningBodyClass}>
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {ajustesAplicados.length > 0 ? (
        <section name="resumen-ajustes-aplicados">
          <h3 className={`mb-3 ${sectionTitleClass}`}>Ajustes aplicados</h3>
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4">
            <ul className="list-disc space-y-1 pl-5">
              {ajustesAplicados.map((ajuste) => (
                <li key={toSlug(String(ajuste))} className={ajustesBodyClass}>
                  {ajuste}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export const PasoResumen = ({
  resumen,
  tiposInscripcion = [],
  mostrarAvisoIncompleto = true,
}) => {
  const [modalAbierto, setModalAbierto] = useState(false);

  if (!resumen) {
    if (!mostrarAvisoIncompleto) {
      return null;
    }

    return (
      <section name="resumen-incompleto" className={emptyStateContainerClass}>
        <h3 className={emptyStateTitleClass}>Resumen incompleto</h3>
        <p className={emptyStateBodyClass}>
          {textosInscripcion.resumenIncompleto}
        </p>
      </section>
    );
  }

  const documentosPendientes = Array.isArray(
    resumen?.resultado?.documentos_pendientes
  )
    ? resumen.resultado.documentos_pendientes
    : [];
  const ajustesAplicados = Array.isArray(resumen?.resultado?.ajustes)
    ? resumen.resultado.ajustes
    : [];
  const documentosAlDia = documentosPendientes.length === 0;
  const statusClass = documentosAlDia
    ? summaryStatusSuccessClass
    : summaryStatusPendingClass;
  const statusLabel = documentosAlDia
    ? "Documentos al día"
    : `${documentosPendientes.length} pendiente${
        documentosPendientes.length === 1 ? "" : "s"
      }`;

  return (
    <>
      <section name="resumen-visual" className={summaryContainerClass}>
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className={summaryTitleClass}>Resumen del registro</h2>
            <p className={summaryDescriptionClass}>
              Verifica los datos seleccionados antes de registrar la
              inscripción.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={statusClass}>{statusLabel}</span>
            <button
              type="button"
              onClick={() => setModalAbierto(true)}
              className={`${inscripcionFormClasses.secondaryButton} justify-center`}
            >
              Ver detalle
            </button>
          </div>
        </header>

        <TarjetasPrincipales
          resumen={resumen}
          tiposInscripcion={tiposInscripcion}
        />

        {ajustesAplicados.length > 0 ? (
          <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
            Se aplicaron {ajustesAplicados.length} ajuste
            {ajustesAplicados.length === 1 ? "" : "s"} al guardar la
            inscripción.
          </div>
        ) : null}

        {!documentosAlDia ? (
          <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Asegúrate de consignar los documentos pendientes antes de finalizar.
          </div>
        ) : null}
      </section>

      <VentanaModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Detalle del resumen"
        subtitle="Revisa la información consolidada del proceso de inscripción."
        size="lg"
        bodyClassName="space-y-6"
        footer={
          <button
            type="button"
            onClick={() => setModalAbierto(false)}
            className={`${inscripcionFormClasses.secondaryButton} justify-center`}
          >
            Cerrar
          </button>
        }
      >
        <DetalleResumen resumen={resumen} tiposInscripcion={tiposInscripcion} />
      </VentanaModal>
    </>
  );
};

export default PasoResumen;
