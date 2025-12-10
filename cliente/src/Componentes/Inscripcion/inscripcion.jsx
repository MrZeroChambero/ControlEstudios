import React, { useMemo } from "react";
import { Ventanas } from "../Ventanas/Ventanas";
import {
  inscripcionControlClasses,
  inscripcionLayout,
} from "../EstilosCliente/EstilosClientes";
import { pasosInscripcion } from "./pasosInscripcion.jsx";
import { useInscripcion } from "./hooks/useInscripcion";
import { PasoPrecondiciones } from "./componentes/PasoPrecondiciones";
import { PasoEstudiante } from "./componentes/PasoEstudiante";
import { PasoAula } from "./componentes/PasoAula";
import { PasoRepresentante } from "./componentes/PasoRepresentante";
import { PasoDatosFamilia } from "./componentes/PasoDatosFamilia";
import { PasoCompromisos } from "./componentes/PasoCompromisos";
import { PasoResumen } from "./componentes/PasoResumen";

const renderizarPaso = (indice, contexto) => {
  switch (indice) {
    case 0:
      return (
        <PasoPrecondiciones
          resultado={contexto.precondiciones}
          cargando={contexto.cargandoPrecondiciones}
          onReintentar={contexto.cargarPrecondiciones}
        />
      );
    case 1:
      return (
        <PasoEstudiante
          estudiantes={contexto.estudiantes}
          cargando={contexto.cargandoEstudiantes}
          seleccionado={contexto.estudianteSeleccionado}
          onSeleccionar={contexto.setEstudianteSeleccionado}
        />
      );
    case 2:
      return (
        <PasoAula
          aulas={contexto.aulas}
          cargando={contexto.cargandoAulas}
          seleccionado={contexto.aulaSeleccionada}
          onSeleccionar={contexto.setAulaSeleccionada}
        />
      );
    case 3:
      return (
        <PasoRepresentante
          representantes={contexto.representantes}
          cargando={contexto.cargandoRepresentantes}
          seleccionado={contexto.representanteSeleccionado}
          onSeleccionar={contexto.setRepresentanteSeleccionado}
          estudiante={contexto.estudianteSeleccionado}
        />
      );
    case 4:
      return (
        <PasoDatosFamilia
          datos={contexto.datosFormulario}
          errores={contexto.erroresFormulario}
          onChange={contexto.actualizarDato}
          tiposInscripcion={contexto.tiposInscripcion}
          tipoSeleccionado={contexto.tipoInscripcion}
          onTipoChange={contexto.setTipoInscripcion}
        />
      );
    case 5:
      return (
        <PasoCompromisos
          datos={contexto.datosFormulario}
          onToggle={contexto.alternarDatoSiNo}
          errores={contexto.erroresFormulario}
        />
      );
    case 6:
      return (
        <PasoResumen
          resumen={contexto.resumen}
          tiposInscripcion={contexto.tiposInscripcion}
        />
      );
    default:
      return null;
  }
};

export const Inscripcion = () => {
  const contexto = useInscripcion();

  const {
    pasoActual,
    totalPasos,
    puedeAvanzar,
    avanzar,
    retroceder,
    guardarInscripcion,
    guardando,
    reiniciar,
    resumen,
  } = contexto;

  const controles = useMemo(() => {
    const esUltimoPaso = pasoActual === totalPasos - 1;
    const registroListo = Boolean(resumen?.resultado);

    return (
      <div
        name="barra-controles-inscripcion"
        className={inscripcionControlClasses.nav}
      >
        <p className={inscripcionControlClasses.info}>
          Paso {pasoActual + 1} de {totalPasos}
        </p>
        <div
          name="grupo-botones-controles-inscripcion"
          className={inscripcionControlClasses.buttons}
        >
          {pasoActual > 0 && !registroListo ? (
            <button
              type="button"
              onClick={retroceder}
              className={inscripcionControlClasses.secondary}
            >
              Volver
            </button>
          ) : null}

          {esUltimoPaso ? (
            <>
              {!registroListo ? (
                <button
                  type="button"
                  onClick={guardarInscripcion}
                  disabled={guardando || !resumen}
                  className={inscripcionControlClasses.primary}
                >
                  {guardando ? "Guardando..." : "Confirmar inscripción"}
                </button>
              ) : null}
              {registroListo ? (
                <button
                  type="button"
                  onClick={reiniciar}
                  className={inscripcionControlClasses.primary}
                >
                  Nueva inscripción
                </button>
              ) : null}
            </>
          ) : (
            <button
              type="button"
              onClick={avanzar}
              disabled={!puedeAvanzar}
              className={inscripcionControlClasses.primary}
            >
              Siguiente
            </button>
          )}

          {pasoActual > 0 && !registroListo ? (
            <button
              type="button"
              onClick={reiniciar}
              className={inscripcionControlClasses.tertiary}
            >
              Reiniciar
            </button>
          ) : null}
        </div>
      </div>
    );
  }, [
    pasoActual,
    totalPasos,
    puedeAvanzar,
    avanzar,
    retroceder,
    guardarInscripcion,
    guardando,
    reiniciar,
    resumen,
  ]);

  return (
    <div
      name="contenedor-principal-inscripcion"
      className={inscripcionLayout.container}
    >
      <header className={inscripcionLayout.header}>
        <div name="informacion-general-inscripcion">
          <h1 className={inscripcionLayout.title}>Inscripción estudiantil</h1>
          <p className={inscripcionLayout.description}>
            Sigue los pasos para asignar una sección al estudiante y confirmar
            la entrega de documentos requeridos.
          </p>
        </div>
      </header>

      <Ventanas
        pasos={pasosInscripcion}
        pasoActual={pasoActual}
        controles={controles}
      >
        {renderizarPaso(pasoActual, contexto)}
      </Ventanas>
    </div>
  );
};

export default Inscripcion;
