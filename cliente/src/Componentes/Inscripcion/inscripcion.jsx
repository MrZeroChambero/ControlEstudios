import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  contenidosLayout,
  inscripcionControlClasses,
  inscripcionFormClasses,
  inscripcionLayout,
} from "../EstilosCliente/EstilosClientes";
import { useInscripcion } from "./hooks/useInscripcion";
import { PasoPrecondiciones } from "./componentes/PasoPrecondiciones";
import { PasoEstudiante } from "./componentes/PasoEstudiante";
import { PasoAula } from "./componentes/PasoAula";
import { PasoRepresentante } from "./componentes/PasoRepresentante";
import { PasoDatosFamilia } from "./componentes/PasoDatosFamilia";
import { PasoCompromisos } from "./componentes/PasoCompromisos";
import { PasoResumen } from "./componentes/PasoResumen";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import { textosInscripcion } from "./textosInscripcion";
import Swal from "sweetalert2";
import { listarResumenInscripciones } from "./inscripcionService";
import ResumenInscripcionesModal from "./componentes/ResumenInscripcionesModal";

const cardWrapperClass =
  "rounded-3xl border border-slate-100 bg-white p-6 shadow-md";
const CAMPOS_GENERALES = [
  "fecha_inscripcion",
  "vive_con",
  "tipo_vivienda",
  "zona_vivienda",
  "tenencia_viviencia",
];
const CAMPOS_INDICADORES = [
  "ingreso_familiar",
  "miembros_familia",
  "altura",
  "peso",
  "talla_zapatos",
  "talla_camisa",
  "talla_pantalon",
];

const tieneValor = (valor) =>
  valor !== undefined && valor !== null && String(valor).trim() !== "";

const normalizarGrado = (valor) =>
  valor === null || valor === undefined ? "" : String(valor).trim();

export const Inscripcion = () => {
  const [modalResumenAbierto, setModalResumenAbierto] = useState(false);
  const [datosResumenInscripciones, setDatosResumenInscripciones] =
    useState(null);
  const [cargandoResumenInscripciones, setCargandoResumenInscripciones] =
    useState(false);

  const {
    precondiciones,
    cargandoPrecondiciones,
    cargarPrecondiciones,
    estudiantes,
    cargandoEstudiantes,
    estudianteSeleccionado,
    seleccionarEstudiante,
    aulas,
    cargandoAulas,
    aulaSeleccionada,
    seleccionarAula,
    representantes,
    cargandoRepresentantes,
    representanteSeleccionado,
    seleccionarRepresentante,
    datosFormulario,
    actualizarDato,
    alternarDatoSiNo,
    erroresFormulario,
    tipoInscripcion,
    actualizarTipoInscripcion,
    tiposInscripcion,
    estadoSeccionesFamilia,
    resumen,
    guardarInscripcion,
    guardando,
    reiniciar,
  } = useInscripcion();

  const aulasPermitidas = useMemo(() => {
    if (!Array.isArray(aulas) || aulas.length === 0) {
      return [];
    }

    const permitidosCrudos = Array.isArray(
      estudianteSeleccionado?.grados_permitidos
    )
      ? estudianteSeleccionado.grados_permitidos
      : [];

    const permitidosNormalizados = permitidosCrudos
      .map((grado) => normalizarGrado(grado))
      .filter((grado) => grado.length > 0);

    if (permitidosNormalizados.length === 0) {
      return aulas;
    }

    const permitidosSet = new Set(permitidosNormalizados);
    return aulas.filter((aula) =>
      permitidosSet.has(normalizarGrado(aula?.grado))
    );
  }, [aulas, estudianteSeleccionado]);

  useEffect(() => {
    if (!aulaSeleccionada) {
      return;
    }

    const existe = aulasPermitidas.some(
      (aula) => aula.id_aula === aulaSeleccionada.id_aula
    );

    if (!existe) {
      seleccionarAula(null);
    }
  }, [aulasPermitidas, aulaSeleccionada, seleccionarAula]);

  const datosGeneralesCompletos = useMemo(
    () => CAMPOS_GENERALES.every((campo) => tieneValor(datosFormulario[campo])),
    [datosFormulario]
  );

  const indicadoresValidos = useMemo(
    () =>
      CAMPOS_INDICADORES.every((campo) => {
        const valor = datosFormulario[campo];
        if (!tieneValor(valor)) {
          return false;
        }
        const numero = Number(valor);
        if (Number.isNaN(numero) || numero < 0) {
          return false;
        }
        if (campo === "miembros_familia" && numero < 1) {
          return false;
        }
        return true;
      }),
    [datosFormulario]
  );

  const tipoSeleccionValido = Boolean(tipoInscripcion);
  const datosFamiliaListos =
    tipoSeleccionValido && datosGeneralesCompletos && indicadoresValidos;

  const checklist = useMemo(
    () => [
      {
        id: "precondiciones",
        label: precondiciones?.listo
          ? "Precondiciones verificadas"
          : "Verifica las precondiciones del año escolar",
        ready: precondiciones?.listo === true,
      },
      {
        id: "estudiante",
        label: estudianteSeleccionado
          ? `Estudiante seleccionado: ${estudianteSeleccionado.nombre_completo}`
          : "Selecciona un estudiante elegible",
        ready: Boolean(estudianteSeleccionado),
      },
      {
        id: "aula",
        label: aulaSeleccionada
          ? `Sección asignada: ${aulaSeleccionada.grado}° ${aulaSeleccionada.seccion}`
          : "Asigna un grado y sección disponibles",
        ready: Boolean(aulaSeleccionada),
      },
      {
        id: "representante",
        label: representanteSeleccionado
          ? `Representante: ${representanteSeleccionado.nombre_completo}`
          : "Selecciona al representante autorizado",
        ready: Boolean(representanteSeleccionado),
      },
      {
        id: "datos",
        label: "Completa los datos del hogar e indicadores socioeconómicos",
        ready: datosFamiliaListos,
      },
    ],
    [
      precondiciones,
      estudianteSeleccionado,
      aulaSeleccionada,
      representanteSeleccionado,
      datosFamiliaListos,
    ]
  );

  const botonGuardarDeshabilitado = guardando || !precondiciones?.listo;
  const mostrarResumen = Boolean(resumen);

  const recargarResumenInscripciones = useCallback(async () => {
    setCargandoResumenInscripciones(true);
    try {
      const datos = await listarResumenInscripciones(Swal);
      setDatosResumenInscripciones(datos);
    } finally {
      setCargandoResumenInscripciones(false);
    }
  }, [listarResumenInscripciones, Swal]);

  const manejarAbrirModalResumen = useCallback(async () => {
    setModalResumenAbierto(true);
    setDatosResumenInscripciones(null);
    await recargarResumenInscripciones();
  }, [recargarResumenInscripciones]);

  const manejarCerrarModalResumen = () => {
    setModalResumenAbierto(false);
  };

  return (
    <div name="contenedor-principal-inscripcion" className="space-y-6">
      <section className={cardWrapperClass}>
        <div name="general" className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div name="informacion-general-inscripcion" className="space-y-2">
              <h1 className={inscripcionLayout.title}>
                {textosInscripcion.tituloPrincipal}
              </h1>
              <p className={inscripcionLayout.description}>
                Completa la información del estudiante, selecciona su sección y
                confirma los datos del hogar en un solo formulario.
              </p>
            </div>
            <button
              type="button"
              onClick={manejarAbrirModalResumen}
              disabled={cargandoResumenInscripciones}
              className={`${contenidosLayout.addButton} justify-center disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {cargandoResumenInscripciones
                ? "Consultando..."
                : "Ver inscripciones activas"}
            </button>
          </div>

          <PasoPrecondiciones
            resultado={precondiciones}
            cargando={cargandoPrecondiciones}
            onReintentar={cargarPrecondiciones}
          />

          {!resumen ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              {textosInscripcion.resumenIncompleto}
            </div>
          ) : null}

          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-800">
              {textosInscripcion.tituloChecklist}
            </h2>
            <ul className="space-y-3">
              {checklist.map((item) => (
                <li key={item.id} className="flex items-start gap-2">
                  {item.ready ? (
                    <FiCheckCircle className="mt-0.5 h-4 w-4 text-emerald-500" />
                  ) : (
                    <FiClock className="mt-0.5 h-4 w-4 text-slate-400" />
                  )}
                  <span
                    className={`text-sm ${
                      item.ready ? "text-emerald-700" : "text-slate-600"
                    }`}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              <button
                type="button"
                onClick={guardarInscripcion}
                disabled={botonGuardarDeshabilitado}
                className={`${inscripcionFormClasses.primaryButton} justify-center`}
              >
                {guardando ? "Guardando..." : "Registrar inscripción"}
              </button>
              <button
                type="button"
                onClick={reiniciar}
                className={`${inscripcionControlClasses.tertiary} justify-center`}
              >
                Limpiar formulario
              </button>
              <p className="text-xs text-slate-500">
                El resumen se actualiza automáticamente cuando completes la
                información requerida.
              </p>
            </div>
          </div>

          {mostrarResumen ? (
            <PasoResumen
              resumen={resumen}
              tiposInscripcion={tiposInscripcion}
              mostrarAvisoIncompleto={false}
            />
          ) : null}
        </div>
      </section>

      <div className="space-y-6">
        <section className={cardWrapperClass}>
          <PasoEstudiante
            estudiantes={estudiantes}
            cargando={cargandoEstudiantes}
            seleccionado={estudianteSeleccionado}
            onSeleccionar={seleccionarEstudiante}
          />
        </section>

        <section className={cardWrapperClass}>
          <PasoAula
            aulas={aulasPermitidas}
            cargando={cargandoAulas}
            seleccionado={aulaSeleccionada}
            onSeleccionar={seleccionarAula}
            estudiante={estudianteSeleccionado}
          />
        </section>

        <section className={cardWrapperClass}>
          <PasoRepresentante
            representantes={representantes}
            cargando={cargandoRepresentantes}
            seleccionado={representanteSeleccionado}
            onSeleccionar={seleccionarRepresentante}
            estudiante={estudianteSeleccionado}
          />
        </section>

        <section className={cardWrapperClass}>
          <PasoDatosFamilia
            datos={datosFormulario}
            errores={erroresFormulario}
            onChange={actualizarDato}
            tiposInscripcion={tiposInscripcion}
            tipoSeleccionado={tipoInscripcion}
            onTipoChange={actualizarTipoInscripcion}
            estadoSecciones={estadoSeccionesFamilia}
          />
        </section>

        <section className={cardWrapperClass}>
          <PasoCompromisos
            datos={datosFormulario}
            onToggle={alternarDatoSiNo}
            errores={erroresFormulario}
          />
        </section>
      </div>

      <ResumenInscripcionesModal
        isOpen={modalResumenAbierto}
        onClose={manejarCerrarModalResumen}
        datos={datosResumenInscripciones}
        cargando={cargandoResumenInscripciones}
        onRetiroExitoso={recargarResumenInscripciones}
      />
    </div>
  );
};

export default Inscripcion;
