import React, { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  aulasLayout,
  aulasFormClasses,
  aulasInfoClasses,
} from "./aulasEstilos";
import {
  obtenerResumenAulas,
  aperturarAulas,
  actualizarEstadoAula,
  actualizarCuposAula,
} from "./aulasService";
import { AulasTable } from "./AulasTable";
import { formatearFechaCorta } from "../../utilidades/formatoFechas";

const construirConfiguracionInicial = (grados) => {
  const configuracion = {};

  grados.forEach((grado) => {
    const clave = grado.grado.toString();
    const seleccion = grado.seleccionActual ?? grado.seleccion ?? 1;
    configuracion[clave] = Math.max(1, seleccion);
  });

  return configuracion;
};

const opcionesSecciones = (maximo) =>
  Array.from({ length: Math.min(3, maximo ?? 0) }, (_, indice) => indice + 1);

const formatearRangoFechas = (anio) => {
  if (!anio) {
    return "Sin anio escolar activo";
  }

  const inicio = formatearFechaCorta(anio.fecha_inicio);
  const fin = formatearFechaCorta(anio.fecha_fin);
  const estado = anio.estado ?? "Sin estado";
  return `Del ${inicio || "-"} al ${fin || "-"} - ${estado}`;
};

export const Aulas = () => {
  const [anio, setAnio] = useState(null);
  const [grados, setGrados] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [configuracion, setConfiguracion] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hayAnioDisponible = useMemo(() => anio !== null, [anio]);

  const actualizarEstadoResumen = useCallback((datos) => {
    const gradosRespuesta = datos?.grados ?? [];
    setAnio(datos?.anio ?? null);
    setGrados(gradosRespuesta);
    setAulas(datos?.aulas ?? []);
    setConfiguracion(construirConfiguracionInicial(gradosRespuesta));
  }, []);

  const cargarResumen = useCallback(async () => {
    setIsLoading(true);
    const respuesta = await obtenerResumenAulas();

    if (!respuesta.success) {
      Swal.fire("Error", respuesta.message, "error");
      setIsLoading(false);
      return;
    }

    actualizarEstadoResumen(respuesta.data);
    setIsLoading(false);
  }, [actualizarEstadoResumen]);

  useEffect(() => {
    cargarResumen();
  }, [cargarResumen]);

  const manejarCambioConfiguracion = (grado, valor) => {
    setConfiguracion((previo) => ({
      ...previo,
      [grado]: Number(valor),
    }));
  };

  const validarConfiguracion = () => {
    const errores = [];

    grados.forEach((grado) => {
      const clave = grado.grado.toString();
      const valor = configuracion[clave];
      const maximo = Math.min(3, grado.maximo ?? 3);

      if (!valor || valor < 1) {
        errores.push(
          `Debe seleccionar al menos una seccion para ${clave} grado.`
        );
      }

      if (valor > maximo) {
        errores.push(
          `Para ${clave} grado solo puede habilitar hasta ${maximo} secciones.`
        );
      }
    });

    return errores;
  };

  const manejarApertura = async (evento) => {
    evento.preventDefault();

    if (!hayAnioDisponible) {
      Swal.fire(
        "Aviso",
        "Registre o active un anio escolar antes de aperturar las aulas.",
        "info"
      );
      return;
    }

    const errores = validarConfiguracion();
    if (errores.length > 0) {
      Swal.fire("Verifique la informacion", errores.join("\n"), "warning");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      anio_id: anio?.id ?? null,
      configuracion,
    };

    const respuesta = await aperturarAulas(payload);

    setIsSubmitting(false);

    if (!respuesta.success) {
      const detalleErrores =
        respuesta.errors && Object.keys(respuesta.errors).length > 0
          ? Object.entries(respuesta.errors)
              .map(
                ([grado, mensajes]) =>
                  `${grado}: ${[].concat(mensajes).join(", ")}`
              )
              .join("\n")
          : respuesta.message;

      Swal.fire("No se pudo completar", detalleErrores, "error");
      return;
    }

    actualizarEstadoResumen(respuesta.data);
    Swal.fire("Listo", respuesta.message, "success");
  };

  const manejarToggleEstado = async (aula) => {
    const nuevoEstado = aula.estado === "activo" ? "inactivo" : "activo";

    const confirmacion = await Swal.fire({
      title: "Confirmar accion",
      text:
        nuevoEstado === "activo"
          ? "Se habilitara nuevamente la seccion seleccionada."
          : "Se deshabilitara la ultima seccion activa del grado.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Si, continuar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#059669",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    const respuesta = await actualizarEstadoAula(aula.id, nuevoEstado);

    if (!respuesta.success) {
      Swal.fire("No se pudo completar", respuesta.message, "error");
      return;
    }

    actualizarEstadoResumen(respuesta.data);
    Swal.fire("Listo", respuesta.message, "success");
  };

  const manejarEditarCupos = async (aula) => {
    const { value: cupos, isConfirmed } = await Swal.fire({
      title: `Editar cupos - Grado ${aula.grado}${aula.seccion}`,
      input: "number",
      inputLabel: "Cantidad de cupos",
      inputAttributes: {
        min: 18,
        max: 37,
        step: 1,
      },
      inputValue: aula.cupos ?? 37,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
      preConfirm: (valor) => {
        const numero = Number(valor);
        if (Number.isNaN(numero) || numero < 18 || numero > 37) {
          Swal.showValidationMessage(
            "El cupo debe estar entre 18 y 37 estudiantes."
          );
        }
        return numero;
      },
    });

    if (!isConfirmed) {
      return;
    }

    const respuesta = await actualizarCuposAula(aula.id, cupos);

    if (!respuesta.success) {
      Swal.fire("No se pudo completar", respuesta.message, "error");
      return;
    }

    actualizarEstadoResumen(respuesta.data);
    Swal.fire("Listo", respuesta.message, "success");
  };

  return (
    <div className={aulasLayout.container}>
      <div className={aulasLayout.header}>
        <h2 className={aulasLayout.title}>Aperturar grados y secciones</h2>
      </div>
      <p className={aulasLayout.description}>
        Configura cuantas secciones estaran disponibles por grado para el anio
        escolar activo. Las aulas se crearan automaticamente con un cupo base de
        37 estudiantes.
      </p>

      <section className={aulasInfoClasses.card}>
        <p className={aulasInfoClasses.title}>Anio escolar en curso</p>
        <p>{formatearRangoFechas(anio)}</p>
      </section>

      <form className={aulasFormClasses.section} onSubmit={manejarApertura}>
        <header className="mb-4">
          <h3 className={aulasFormClasses.sectionTitle}>
            Seleccione cuantas secciones tendra cada grado
          </h3>
          <p className={aulasFormClasses.note}>
            Debe habilitar al menos una seccion por grado. Las secciones se
            asignaran en orden (A, B y C).
          </p>
        </header>

        <div className={aulasFormClasses.grid}>
          {grados.map((grado) => {
            const clave = grado.grado.toString();
            const maximo = Math.min(3, grado.maximo ?? 3);

            return (
              <div key={clave} className={aulasFormClasses.group}>
                <label
                  htmlFor={`grado-${clave}`}
                  className={aulasFormClasses.label}
                >
                  {`Grado ${clave}`}
                </label>
                <select
                  id={`grado-${clave}`}
                  className={aulasFormClasses.select}
                  value={configuracion[clave] ?? 1}
                  onChange={(evento) =>
                    manejarCambioConfiguracion(clave, evento.target.value)
                  }
                  disabled={!hayAnioDisponible || isLoading || isSubmitting}
                >
                  {opcionesSecciones(maximo).map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion} seccion{opcion > 1 ? "es" : ""}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        <div className={aulasFormClasses.actions}>
          <button
            type="submit"
            className={aulasFormClasses.submitButton}
            disabled={isLoading || isSubmitting || !hayAnioDisponible}
          >
            {isSubmitting ? "Procesando..." : "Habilitar secciones"}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <AulasTable
          aulas={aulas}
          isLoading={isLoading}
          onToggleEstado={manejarToggleEstado}
          onEditarCupos={manejarEditarCupos}
        />
      </div>
    </div>
  );
};
