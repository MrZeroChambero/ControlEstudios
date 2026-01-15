import React, { useState } from "react";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import { textosInscripcion } from "../textosInscripcion";
import {
  inscripcionFormClasses,
  inscripcionSummaryClasses,
  pasoResumenClasses,
  pasoResumenDetailClasses,
} from "../inscripcionEstilos";

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
    <div
      name="contenedor-detalle-resumen"
      className={pasoResumenDetailClasses.container}
    >
      {resultado?.id_inscripcion ? (
        <div
          name="resumen-mensaje-exito"
          className={pasoResumenDetailClasses.successBanner}
        >
          <p className={pasoResumenDetailClasses.successTitle}>
            Inscripción registrada correctamente.
          </p>
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
        <h3 className={pasoResumenDetailClasses.sectionTitle}>
          Datos del hogar
        </h3>
        <div
          name="resumen-lista-hogar"
          className={pasoResumenDetailClasses.gridTwoCols}
        >
          {hogar.map((item) => (
            <div
              key={item.etiqueta}
              name={`resumen-hogar-${toSlug(item.etiqueta)}`}
              className={pasoResumenDetailClasses.card}
            >
              <p className={pasoResumenDetailClasses.label}>{item.etiqueta}</p>
              <p className={pasoResumenDetailClasses.value}>
                {item.valor || "Sin dato"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section name="resumen-indicadores-antropometricos">
        <h3 className={pasoResumenDetailClasses.sectionTitle}>
          Indicadores antropométricos
        </h3>
        <div
          name="resumen-lista-antropometria"
          className={pasoResumenDetailClasses.gridThreeCols}
        >
          {antropometria.map((item) => (
            <div
              key={item.etiqueta}
              name={`resumen-antropometria-${toSlug(item.etiqueta)}`}
              className={pasoResumenDetailClasses.card}
            >
              <p className={pasoResumenDetailClasses.label}>{item.etiqueta}</p>
              <p className={pasoResumenDetailClasses.value}>
                {item.valor || "Sin dato"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section name="resumen-participacion-documentos">
        <h3 className={pasoResumenDetailClasses.sectionTitle}>
          Participación y documentos
        </h3>
        <div
          name="resumen-grid-participacion-documentos"
          className={pasoResumenDetailClasses.gridTwoCols}
        >
          <div
            name="resumen-participacion"
            className={pasoResumenDetailClasses.participacionCard}
          >
            {participacion.map((item) => (
              <div
                key={item.etiqueta}
                name={`resumen-participacion-${toSlug(item.etiqueta)}`}
              >
                <p className={pasoResumenDetailClasses.label}>
                  {item.etiqueta}
                </p>
                <p className={pasoResumenDetailClasses.value}>
                  {item.valor || "Sin dato"}
                </p>
              </div>
            ))}
          </div>

          <div
            name="resumen-documentos"
            className={pasoResumenDetailClasses.documentsCard}
          >
            {DOCUMENTOS.map((doc) => (
              <div
                key={doc.id}
                name={`resumen-documento-${doc.id}`}
                className={pasoResumenDetailClasses.documentRow}
              >
                <p className={pasoResumenDetailClasses.value}>{doc.etiqueta}</p>
                <span
                  className={
                    (datos[doc.id] ?? "no") === "si"
                      ? pasoResumenDetailClasses.documentDelivered
                      : pasoResumenDetailClasses.documentPending
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
          <h3 className={pasoResumenDetailClasses.warningTitle}>
            Documentos pendientes para completar la inscripción
          </h3>
          <div className={pasoResumenDetailClasses.warningCard}>
            <p className={pasoResumenDetailClasses.warningBody}>
              Presenta{" "}
              {documentosPendientes.length === 1
                ? "el siguiente"
                : "los siguientes"}{" "}
              documento{documentosPendientes.length === 1 ? "" : "s"}:
            </p>
            <ul className={pasoResumenDetailClasses.warningList}>
              {documentosPendientes.map((doc) => (
                <li
                  key={toSlug(doc)}
                  className={pasoResumenDetailClasses.warningBody}
                >
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {ajustesAplicados.length > 0 ? (
        <section name="resumen-ajustes-aplicados">
          <h3 className={pasoResumenDetailClasses.sectionTitle}>
            Ajustes aplicados
          </h3>
          <div className={pasoResumenDetailClasses.adjustmentsCard}>
            <ul className={pasoResumenDetailClasses.adjustmentsList}>
              {ajustesAplicados.map((ajuste) => (
                <li
                  key={toSlug(String(ajuste))}
                  className={pasoResumenDetailClasses.adjustmentsItem}
                >
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
      <section
        name="resumen-incompleto"
        className={pasoResumenClasses.emptyContainer}
      >
        <h3 className={pasoResumenClasses.emptyTitle}>Resumen incompleto</h3>
        <p className={pasoResumenClasses.emptyBody}>
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
    ? pasoResumenClasses.statusChipSuccess
    : pasoResumenClasses.statusChipPending;
  const statusLabel = documentosAlDia
    ? "Documentos al día"
    : `${documentosPendientes.length} pendiente${
        documentosPendientes.length === 1 ? "" : "s"
      }`;

  return (
    <>
      <section
        name="resumen-visual"
        className={pasoResumenClasses.summaryContainer}
      >
        <header className={pasoResumenClasses.summaryHeader}>
          <div>
            <h2 className={pasoResumenClasses.summaryTitle}>
              Resumen del registro
            </h2>
            <p className={pasoResumenClasses.summaryDescription}>
              Verifica los datos seleccionados antes de registrar la
              inscripción.
            </p>
          </div>
          <div className={pasoResumenClasses.actionGroup}>
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
          <div className={pasoResumenClasses.infoAlert}>
            Se aplicaron {ajustesAplicados.length} ajuste
            {ajustesAplicados.length === 1 ? "" : "s"} al guardar la
            inscripción.
          </div>
        ) : null}

        {!documentosAlDia ? (
          <div className={pasoResumenClasses.warningAlert}>
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
        bodyClassName={pasoResumenDetailClasses.modalBody}
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
