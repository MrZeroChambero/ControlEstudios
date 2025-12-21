import React, { useState } from "react";
import {
  inscripcionFormClasses,
  inscripcionSummaryClasses,
} from "../../EstilosCliente/EstilosClientes";
import VentanaModal from "../../EstilosCliente/VentanaModal";
import { textosInscripcion } from "../textosInscripcion";

const traduccionTipo = (valor, catalogo) => {
  const encontrado = catalogo?.find((item) => item.valor === valor);
  return encontrado ? encontrado.etiqueta : valor?.replace(/_/g, " ") ?? "";
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

const DetalleResumen = ({ resumen, tiposInscripcion }) => {
  const { estudiante, representante, aula, datos, tipoInscripcion, resultado } =
    resumen;
  const documentosPendientes = Array.isArray(resultado?.documentos_pendientes)
    ? resultado.documentos_pendientes
    : [];
  const ajustesAplicados = Array.isArray(resultado?.ajustes)
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
      {resultado ? (
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
            {estudiante.nombre_completo ?? estudiante.nombre}
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
            {representante.nombre_completo ?? representante.nombre}
          </p>
          <p className={inscripcionSummaryClasses.itemLabel}>Documento</p>
          <p className={inscripcionSummaryClasses.itemValue}>
            {representante.cedula || "Sin cédula"}
          </p>
          <p className={inscripcionSummaryClasses.itemLabel}>Parentesco</p>
          <p className={inscripcionSummaryClasses.itemValue}>
            {representante.tipo_parentesco}
          </p>
        </article>

        <article
          name="tarjeta-resumen-aula"
          className={inscripcionSummaryClasses.card}
        >
          <h3 className={inscripcionSummaryClasses.title}>Sección asignada</h3>
          <p className={inscripcionSummaryClasses.itemLabel}>Grado y sección</p>
          <p className={inscripcionSummaryClasses.itemValue}>
            {aula.grado}° {aula.seccion}
          </p>
          <p className={inscripcionSummaryClasses.itemLabel}>Docente titular</p>
          <p className={inscripcionSummaryClasses.itemValue}>
            {aula.docente?.nombre ||
              resultado?.aula?.docente?.nombre ||
              "Sin asignar"}
          </p>
        </article>

        <article
          name="tarjeta-resumen-inscripcion"
          className={inscripcionSummaryClasses.card}
        >
          <h3 className={inscripcionSummaryClasses.title}>Inscripción</h3>
          <p className={inscripcionSummaryClasses.itemLabel}>Tipo</p>
          <p className={inscripcionSummaryClasses.itemValue}>
            {traduccionTipo(tipoInscripcion, tiposInscripcion)}
          </p>
          <p className={inscripcionSummaryClasses.itemLabel}>Fecha</p>
          <p className={inscripcionSummaryClasses.itemValue}>
            {datos.fecha_inscripcion}
          </p>
        </article>
      </div>

      <section name="resumen-datos-hogar">
        <h3 className="mb-3 text-base font-semibold text-slate-800">
          Datos del hogar
        </h3>
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
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {item.etiqueta}
              </p>
              <p className="text-sm font-medium text-slate-700">
                {item.valor || "Sin dato"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section name="resumen-indicadores-antropometricos">
        <h3 className="mb-3 text-base font-semibold text-slate-800">
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
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {item.etiqueta}
              </p>
              <p className="text-sm font-medium text-slate-700">
                {item.valor || "Sin dato"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section name="resumen-participacion-documentos">
        <h3 className="mb-3 text-base font-semibold text-slate-800">
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
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {item.etiqueta}
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {item.valor || "Sin dato"}
                </p>
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
                <p className="text-sm font-medium text-slate-700">
                  {doc.etiqueta}
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    (datos[doc.id] ?? "no") === "si"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
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
          <h3 className="mb-3 text-base font-semibold text-amber-700">
            Documentos pendientes para completar la inscripción
          </h3>
          <div className="space-y-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            <p>
              Aporta los documentos del grado anterior para finalizar el
              proceso. Puedes hacerlo desde la ficha del estudiante.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              {documentosPendientes.map((item) => {
                const requeridoTexto = gradoNumeroATexto(item.grado_requerido);
                const disponibleTexto = gradoNumeroATexto(
                  item.grado_disponible
                );

                return (
                  <li key={`${item.documento}-${item.grado_requerido}`}>
                    <span className="font-semibold">{item.documento}</span>
                    {requeridoTexto
                      ? ` | Grado requerido: ${requeridoTexto}`
                      : ""}
                    {disponibleTexto
                      ? ` (último registrado: ${disponibleTexto})`
                      : ""}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}

      {ajustesAplicados.length > 0 ? (
        <section name="resumen-ajustes-aplicados">
          <h3 className="mb-3 text-base font-semibold text-slate-800">
            Ajustes aplicados al registro
          </h3>
          <ul className="space-y-2 rounded-3xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            {ajustesAplicados.map((mensaje, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
                <span>{mensaje}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {resultado ? (
        <div
          name="resumen-mensaje-final"
          className="rounded-3xl border border-slate-200 bg-white p-4 text-xs text-slate-500"
        >
          Puedes descargar el comprobante desde el módulo de reportes o iniciar
          una nueva inscripción.
        </div>
      ) : (
        <p className={inscripcionFormClasses.helper}>
          Revisa la información antes de confirmar. Podrás actualizarla luego
          desde la ficha del estudiante.
        </p>
      )}
    </div>
  );
};

export const PasoResumen = ({
  resumen,
  tiposInscripcion,
  mostrarAvisoIncompleto = true,
}) => {
  const [modalAbierto, setModalAbierto] = useState(false);

  if (!resumen) {
    if (!mostrarAvisoIncompleto) {
      return null;
    }
    return (
      <div
        name="resumen-sin-datos"
        className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700"
      >
        {textosInscripcion.resumenIncompleto}
      </div>
    );
  }

  const { resultado } = resumen;
  const pendientesResumen = Array.isArray(resultado?.documentos_pendientes)
    ? resultado.documentos_pendientes
    : [];

  return (
    <div name="contenedor-paso-resumen" className="space-y-6">
      <div
        name="resumen-panel-inscripcion-estudiantil"
        className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600"
      >
        <p className="mt-2 text-base font-semibold text-slate-800">
          Revisa la información registrada antes de confirmar la inscripción.
        </p>
        <div
          name="resumen-panel-acciones"
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            className="rounded-3xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            Detalle del resumen
          </button>
          <button
            type="button"
            disabled
            className="rounded-3xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400 disabled:cursor-not-allowed"
          >
            Inscripción estudiantil
          </button>
        </div>
      </div>

      {pendientesResumen.length > 0 ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">
          <p className="font-semibold">
            Inscripción en proceso: faltan documentos del grado anterior.
          </p>
          <p className="mt-2">
            Completa la consignación de los siguientes documentos para activar
            la inscripción:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {pendientesResumen.map((item) => {
              const requeridoTexto = gradoNumeroATexto(item.grado_requerido);
              return (
                <li key={`${item.documento}-${item.grado_requerido}`}>
                  <span className="font-semibold">{item.documento}</span>
                  {requeridoTexto
                    ? ` · Grado requerido: ${requeridoTexto}`
                    : ""}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {resultado ? (
        <div
          name="resumen-mensaje-exito"
          className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-700"
        >
          <p className="font-semibold">Inscripción registrada correctamente.</p>
          <p>
            Revisa el detalle completo o descarga el comprobante desde el módulo
            de reportes.
          </p>
        </div>
      ) : null}

      <VentanaModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Resumen de la inscripción"
        size="xl"
        bodyClassName="space-y-6"
        contentClassName="max-w-5xl"
      >
        <DetalleResumen resumen={resumen} tiposInscripcion={tiposInscripcion} />
      </VentanaModal>
    </div>
  );
};
