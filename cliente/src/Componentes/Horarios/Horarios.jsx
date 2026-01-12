import React, { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import {
  horariosLayout,
} from "../EstilosCliente/EstilosClientes";
import BarraBusquedaHorarios from "./componentes/BarraBusquedaHorarios";
import TablaHorariosAulas from "./componentes/TablaHorariosAulas";
import TablaHorariosDocentes from "./componentes/TablaHorariosDocentes";
import ModalCalendarioAula from "./componentes/ModalCalendarioAula";
import ModalAgendaDocente from "./componentes/ModalAgendaDocente";
import ModalFormularioHorario from "./componentes/ModalFormularioHorario";
import {
  crearFormularioInicial,
  crearCatalogosIniciales,
  formatearDocente,
  obtenerMensajeError,
  diasSemanaOrdenados,
  normalizarHoraInput,
  completarHoraBlur,
  validarHorasFormulario,
  obtenerOrdenHora,
} from "./utilidadesHorarios";
import {
  listarHorarios,
  eliminarHorario,
  obtenerCatalogosHorarios,
  crearHorario,
} from "./solicitudesHorarios";
      }

      const registro = mapa.get(clave);
      registro.horarios.push(item);
    });

    return Array.from(mapa.values()).sort((a, b) => {
      const gradoA = String(a.grado ?? "");
      const gradoB = String(b.grado ?? "");
      const comparacionGrado = gradoA.localeCompare(gradoB, undefined, {
        numeric: true,
        sensitivity: "base",
      });

      if (comparacionGrado !== 0) {
        return comparacionGrado;
      }

      const seccionA = String(a.seccion ?? "");
      const seccionB = String(b.seccion ?? "");
      return seccionA.localeCompare(seccionB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }, [registrosFiltrados]);

  const docentesAgrupados = useMemo(() => {
    const mapa = new Map();

    const construirEtiquetaSeccion = (grado, seccion) => {
      const gradoTexto =
        typeof grado === "number" || typeof grado === "string"
          ? String(grado).trim()
          : "";
      const seccionTexto =
        typeof seccion === "number" || typeof seccion === "string"
          ? String(seccion).trim().toUpperCase()
          : "";

      if (!gradoTexto && !seccionTexto) {
        return null;
      }

      if (!gradoTexto || !seccionTexto) {
        return `${gradoTexto || "?"}"${seccionTexto || "?"}`;
      }

      return `${gradoTexto}"${seccionTexto}"`;
    };

    registrosFiltrados.forEach((item) => {
      if (!item.fk_personal) {
        return;
      }

      const clave = String(item.fk_personal);
      if (!mapa.has(clave)) {
        mapa.set(clave, {
          id: clave,
          fkPersonal: item.fk_personal,
          nombre: formatearDocente(item) || "Docente sin nombre",
          funcion: item.nombre_funcion ?? item.tipo_funcion ?? "Sin función",
          tipo: item.tipo_funcion ?? "",
          componentes: new Set(),
          momentos: new Set(),
          secciones: new Set(),
          horarios: [],
        });
      }

      const registro = mapa.get(clave);
      registro.horarios.push(item);
      if (item.nombre_componente) {
        registro.componentes.add(item.nombre_componente);
      }
      if (item.nombre_momento) {
        registro.momentos.add(item.nombre_momento);
      }

      const etiquetaSeccion = construirEtiquetaSeccion(
        item.grado,
        item.seccion
      );

      if (etiquetaSeccion) {
        registro.secciones.add(etiquetaSeccion);
      }
    });

    return Array.from(mapa.values())
      .map((docente) => {
        const componentes = Array.from(docente.componentes).sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: "base" })
        );
        const momentos = Array.from(docente.momentos).sort((a, b) =>
          a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );
        const secciones = Array.from(docente.secciones).sort((a, b) =>
          a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );

        return {
          ...docente,
          componentes,
          momentos,
          secciones,
          componentesTexto: componentes.join(", ") || "Sin componentes",
          momentosTexto: momentos.join(", ") || "Sin momentos",
          seccionesTexto: secciones.join(", ") || "Sin secciones",
        };
      })
      .sort((a, b) =>
        a.nombre.localeCompare(b.nombre, undefined, {
          sensitivity: "base",
        })
      );
  }, [registrosFiltrados]);

  const aulaSeleccionada = useMemo(() => {
    if (!formulario.fk_aula) {
      return null;
    }

    return (
      catalogos.aulas.find(
        (aula) => aula.id?.toString() === formulario.fk_aula.toString()
      ) || null
    );
  }, [catalogos.aulas, formulario.fk_aula]);

  const momentosDisponibles = useMemo(() => {
    const lista = Array.isArray(catalogos.momentos) ? catalogos.momentos : [];

    if (!aulaSeleccionada) {
      return lista;
    }

    return lista.filter(
      (momento) =>
        Number(momento.anio_escolar) === Number(aulaSeleccionada.anio_escolar)
    );
  }, [aulaSeleccionada, catalogos.momentos]);

  const componentesDisponibles = useMemo(
    () => (Array.isArray(catalogos.componentes) ? catalogos.componentes : []),
    [catalogos.componentes]
  );

  const personalDisponible = useMemo(
    () => (Array.isArray(catalogos.personal) ? catalogos.personal : []),
    [catalogos.personal]
  );

  const estudiantesDisponibles = useMemo(
    () => (Array.isArray(catalogos.estudiantes) ? catalogos.estudiantes : []),
    [catalogos.estudiantes]
  );

  const errores = useMemo(
    () => ({
      general: obtenerMensajeError(erroresFormulario.general),
      fk_aula: obtenerMensajeError(erroresFormulario.fk_aula),
      fk_momento: obtenerMensajeError(erroresFormulario.fk_momento),
      fk_componente: obtenerMensajeError(erroresFormulario.fk_componente),
      fk_personal: obtenerMensajeError(erroresFormulario.fk_personal),
      dia_semana: obtenerMensajeError(erroresFormulario.dia_semana),
      grupo: obtenerMensajeError(erroresFormulario.grupo),
      hora_inicio: obtenerMensajeError(erroresFormulario.hora_inicio),
      hora_fin: obtenerMensajeError(erroresFormulario.hora_fin),
      horario: obtenerMensajeError(erroresFormulario.horario),
      duracion: obtenerMensajeError(erroresFormulario.duracion),
      estudiantes: obtenerMensajeError(erroresFormulario.estudiantes),
    }),
    [erroresFormulario]
  );

  const cargarCatalogos = async (filtros = {}) => {
    setCatalogosCargando(true);
    try {
      const datos = await obtenerCatalogosHorarios({ filtros, Swal });
      const normalizados = {
        aulas: Array.isArray(datos?.aulas) ? datos.aulas : [],
        momentos: Array.isArray(datos?.momentos) ? datos.momentos : [],
        componentes: Array.isArray(datos?.componentes) ? datos.componentes : [],
        personal: Array.isArray(datos?.personal) ? datos.personal : [],
        estudiantes: Array.isArray(datos?.estudiantes) ? datos.estudiantes : [],
      };

      setCatalogos(normalizados);

      setFormulario((previo) => {
        if (!previo.fk_personal) {
          return previo;
        }

        const sigueDisponible = normalizados.personal.some(
          (docente) => docente.id?.toString() === previo.fk_personal.toString()
        );

        if (sigueDisponible) {
          return previo;
        }

        return {
          ...previo,
          fk_personal: "",
        };
      });
    } catch (error) {
      console.error("Error al obtener catálogos de horarios:", error);
    } finally {
      setCatalogosCargando(false);
    }
  };

  const actualizarHorariosAula = async (idAula, idMomento = null) => {
    if (!idAula) {
      setHorariosAula([]);
      setCargandoHorariosAula(false);
      return;
    }

    setCargandoHorariosAula(true);
    setHorariosAula([]);

    try {
      const filtrosConsulta = {
        fk_aula: Number(idAula),
      };

      if (idMomento) {
        filtrosConsulta.fk_momento = Number(idMomento);
      }

      const registros = await listarHorarios({
        filtros: filtrosConsulta,
        Swal,
      });

      setHorariosAula(Array.isArray(registros) ? registros : []);
    } catch (error) {
      console.error("Error al cargar horarios del aula:", error);
    } finally {
      setCargandoHorariosAula(false);
    }
  };

  const abrirModal = () => {
    setErroresFormulario({});
    setFormulario(crearFormularioInicial());
    setCatalogos(crearCatalogosIniciales());
    setHorariosAula([]);
    setCargandoHorariosAula(false);
    setModalAbierto(true);
    cargarCatalogos();
  };

  const cerrarModal = () => {
    if (guardando) {
      return;
    }
    setModalAbierto(false);
  };

  const manejarCambio = async (evento) => {
    const { name, value } = evento.target;

    if (name === "hora_inicio" || name === "hora_fin") {
      const valorNormalizado = normalizarHoraInput(value);
      setFormulario((previo) => ({
        ...previo,
        [name]: valorNormalizado,
      }));
      setErroresFormulario((previo) => {
        const copia = { ...previo };
        delete copia[name];
        delete copia.horario;
        delete copia.duracion;
        return copia;
      });
      return;
    }

    if (name === "grupo") {
      setFormulario((previo) => ({
        ...previo,
        grupo: value,
        estudiantes: value === "subgrupo" ? previo.estudiantes : [],
      }));
      return;
    }

    if (name === "fk_momento") {
      setFormulario((previo) => ({
        ...previo,
        fk_momento: value,
      }));

      if (formulario.fk_aula) {
        const filtrosCatalogo = construirFiltrosCatalogo(
          formulario.fk_aula,
          value || null,
          formulario.fk_componente
        );

        if (Object.keys(filtrosCatalogo).length > 0) {
          await cargarCatalogos(filtrosCatalogo);
        }

        await actualizarHorariosAula(formulario.fk_aula, value || null);
      }

      return;
    }

    if (name === "fk_aula") {
      setFormulario((previo) => ({
        ...previo,
        fk_aula: value,
        fk_momento: "",
        fk_componente: "",
        fk_personal: "",
        estudiantes: [],
      }));

      if (!value) {
        setCatalogos((previo) => ({
          ...previo,
          componentes: [],
          personal: [],
          estudiantes: [],
        }));
        setHorariosAula([]);
        setCargandoHorariosAula(false);
        return;
      }

      const filtros = construirFiltrosCatalogo(value);

      await cargarCatalogos(filtros);
      await actualizarHorariosAula(value);
      return;
    }

    setFormulario((previo) => ({
      ...previo,
      [name]: value,
    }));

    if (name === "fk_componente" && formulario.fk_aula) {
      const filtrosCatalogo = construirFiltrosCatalogo(
        formulario.fk_aula,
        formulario.fk_momento,
        value || null
      );

      if (Object.keys(filtrosCatalogo).length > 0) {
        await cargarCatalogos(filtrosCatalogo);
      }
    }
  };

  const manejarCambioEstudiantes = (evento) => {
    const valores = Array.from(
      evento.target.selectedOptions,
      (opcion) => opcion.value
    );

    setFormulario((previo) => ({
      ...previo,
      estudiantes: valores,
    }));
  };

  const manejarBlurHora = (evento) => {
    const { name, value } = evento.target;
    if (name !== "hora_inicio" && name !== "hora_fin") {
      return;
    }

    const valorFormateado = completarHoraBlur(value);
    setFormulario((previo) => ({
      ...previo,
      [name]: valorFormateado,
    }));
    if (valorFormateado !== value) {
      evento.target.value = valorFormateado;
    }
  };

  const manejarSubmit = async (evento) => {
    evento.preventDefault();

    const erroresLocales = validarHorasFormulario(formulario);
    if (Object.keys(erroresLocales).length > 0) {
      setErroresFormulario(erroresLocales);
      return;
    }

    setErroresFormulario({});
    setGuardando(true);

    const aulaActual = formulario.fk_aula;
    const momentoActual = formulario.fk_momento;

    const datos = {
      fk_aula: formulario.fk_aula ? Number(formulario.fk_aula) : null,
      fk_momento: formulario.fk_momento ? Number(formulario.fk_momento) : null,
      fk_componente: formulario.fk_componente
        ? Number(formulario.fk_componente)
        : null,
      fk_personal: formulario.fk_personal
        ? Number(formulario.fk_personal)
        : null,
      grupo: formulario.grupo,
      dia_semana: formulario.dia_semana || null,
      hora_inicio: formulario.hora_inicio || null,
      hora_fin: formulario.hora_fin || null,
      estudiantes:
        formulario.grupo === "subgrupo"
          ? formulario.estudiantes.map((id) => Number(id))
          : [],
    };

    try {
      const resultado = await crearHorario({ datos, Swal });
      if (resultado) {
        await refrescar();
        if (aulaActual) {
          await actualizarHorariosAula(aulaActual, momentoActual || null);
        }
      }
    } catch (errores) {
      if (errores && typeof errores === "object") {
        setErroresFormulario(errores);
      } else {
        console.error("Error desconocido al registrar horario:", errores);
        Swal.fire(
          "Error",
          "Ocurrió un problema inesperado al registrar el horario.",
          "error"
        );
      }
    } finally {
      setGuardando(false);
    }
  };

  const manejarVerDetalle = (horario) => {
    const estudiantes = Array.isArray(horario.estudiantes)
      ? horario.estudiantes
      : [];

    const listaEstudiantes = estudiantes
      .map((est) => `<li>${est.nombre} (${est.cedula_escolar})</li>`)
      .join("");

    Swal.fire({
      title: "Detalle del horario",
      html: `
        <div class="text-left">
          <p><strong>Componente:</strong> ${
            horario.nombre_componente ?? "N/D"
          }</p>
          <p><strong>Docente:</strong> ${formatearDocente(horario) || "N/D"}</p>
          <p><strong>Momento:</strong> ${horario.nombre_momento ?? "N/D"}</p>
          <p><strong>Día:</strong> ${horario.dia_semana}</p>
          <p><strong>Hora:</strong> ${horario.hora_inicio_texto} - ${
        horario.hora_fin_texto
      }</p>
          <p><strong>Modalidad:</strong> ${horario.grupo}</p>
          ${
            estudiantes.length > 0
              ? `<p class="mt-3"><strong>Estudiantes asignados:</strong></p><ul class="list-disc pl-4">${listaEstudiantes}</ul>`
              : ""
          }
        </div>
      `,
      confirmButtonText: "Cerrar",
    });
  };

  const manejarEliminar = (horario) => {
    Swal.fire({
      title: "¿Eliminar horario?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (!result.isConfirmed) {
        return;
      }

      const exito = await eliminarHorario({
        idHorario: horario.id_horario,
        Swal,
      });

      if (exito) {
        refrescar();
      }
    });
  };

  const calendarioPorDia = useMemo(() => {
    const base = diasSemanaOrdenados.reduce((acumulado, dia) => {
      acumulado[dia] = [];
      return acumulado;
    }, {});

    horariosAula.forEach((bloque) => {
      const dia = (bloque.dia_semana || "").toLowerCase();
      if (!base[dia]) {
        return;
      }
      base[dia].push({ ...bloque, esPreview: false });
    });

    diasSemanaOrdenados.forEach((dia) => {
      base[dia].sort((a, b) => obtenerOrdenHora(a) - obtenerOrdenHora(b));
    });

    return base;
  }, [horariosAula]);

  return (
    <div className={horariosLayout.container}>
      <div className={horariosLayout.header}>
        <h2 className={horariosLayout.title}>Gestión de Horarios</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className={horariosLayout.addButton}
            onClick={abrirModal}
          >
            <FaPlus className="h-4 w-4" />
            <span>Nuevo horario</span>
          </button>
        </div>
      </div>
      <p className={horariosLayout.description}>
        Consulta y administra los horarios de aula y especialistas. Puedes ver
        los detalles de cada bloque y gestionar la asignación por subgrupos
        conforme a las políticas académicas.
      </p>

      <div className="mt-6">
        <BarraBusquedaHorarios
          valor={busqueda}
          onCambio={setBusqueda}
          onActualizar={refrescar}
        />
      </div>

      <div className="mt-6 space-y-12">
        <section className="space-y-4">
          <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Horarios por aula
              </h3>
              <p className="text-sm text-slate-500">
                Visualiza cada grado y sección por momento académico y consulta
                su agenda semanal en un calendario.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {seccionesAgrupadas.length} combinaciones encontradas
            </span>
          </div>

          <TablaHorariosAulas
            datos={seccionesAgrupadas}
            cargando={isLoading}
            onVerCalendario={abrirModalSeccion}
          />
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Horarios por docente y especialista
              </h3>
              <p className="text-sm text-slate-500">
                Consulta la asignación semanal de cada docente según los
                momentos y componentes que atiende.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {docentesAgrupados.length} docentes con agenda
            </span>
          </div>

          <TablaHorariosDocentes
            datos={docentesAgrupados}
            cargando={isLoading}
            onVerCalendario={abrirModalDocente}
          />
        </section>
      </div>

      <ModalCalendarioAula
        abierto={modalSeccionAbierto}
        alCerrar={cerrarModalSeccion}
        seccion={seccionSeleccionada}
      />

      <ModalAgendaDocente
        abierto={modalDocenteAbierto}
        alCerrar={cerrarModalDocente}
        docente={docenteSeleccionado}
        onVerDetalle={manejarVerDetalle}
        onEliminar={manejarEliminar}
      />

      <ModalFormularioHorario
        abierto={modalAbierto}
        alCerrar={cerrarModal}
        formulario={formulario}
        catalogos={catalogos}
        errores={errores}
        catalogosCargando={catalogosCargando}
        guardando={guardando}
        momentosDisponibles={momentosDisponibles}
        componentesDisponibles={componentesDisponibles}
        personalDisponible={personalDisponible}
        estudiantesDisponibles={estudiantesDisponibles}
        calendarioPorDia={calendarioPorDia}
        cargandoHorariosAula={cargandoHorariosAula}
        onCambio={manejarCambio}
        onCambioEstudiantes={manejarCambioEstudiantes}
        onBlurHora={manejarBlurHora}
        onSubmit={manejarSubmit}
        onVerDetalle={manejarVerDetalle}
        onEliminar={manejarEliminar}
      />
    </div>
  );
};

export default Horarios;
