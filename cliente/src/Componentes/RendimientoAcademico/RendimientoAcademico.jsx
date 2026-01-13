import React, { useEffect, useMemo, useState } from "react";
import {
  EncabezadoGestion,
  PanelContextoEvaluacion,
  PanelFiltrosEvaluacion,
  TablaRendimientoAcademico,
} from "./componentes";
import {
  solicitarContextoEvaluacion,
  solicitarAulasPorComponente,
  solicitarGridEvaluacion,
  solicitarGuardarEvaluaciones,
} from "./solicitudesRendimiento";
import {
  construirSeleccionesIniciales,
  construirMapaPermitidos,
  seleccionarLetraValida,
  hayCambiosEnSelecciones,
} from "./helpersRendimiento";
import { alertaErrorClass, alertaExitoClass } from "./constantesRendimiento";
import {
  contenidosLayout,
  typography,
} from "../EstilosCliente/EstilosClientes";

export const RendimientoAcademico = () => {
  const [contexto, setContexto] = useState(null);
  const [componentes, setComponentes] = useState([]);
  const [literales, setLiterales] = useState([]);
  const [componenteId, setComponenteId] = useState("");
  const [aulas, setAulas] = useState([]);
  const [aulaId, setAulaId] = useState("");
  const [grid, setGrid] = useState(null);
  const [selecciones, setSelecciones] = useState({});
  const [originalSelecciones, setOriginalSelecciones] = useState({});
  const [cargandoContexto, setCargandoContexto] = useState(true);
  const [cargandoAulas, setCargandoAulas] = useState(false);
  const [cargandoGrid, setCargandoGrid] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [marcaTemporal, setMarcaTemporal] = useState("");

  const literalesDisponibles = useMemo(() => {
    if (!Array.isArray(literales)) {
      return [];
    }
    return literales
      .map((item) => seleccionarLetraValida(item?.letra ?? item?.literal ?? ""))
      .filter(
        (valor, indice, arreglo) => valor && arreglo.indexOf(valor) === indice
      );
  }, [literales]);

  const permitidosPorEstudiante = useMemo(() => {
    if (!grid?.permitidos_por_estudiante) return {};
    return construirMapaPermitidos(grid.permitidos_por_estudiante);
  }, [grid]);

  const registrarMarcaTemporal = (fecha) => {
    if (fecha) {
      setMarcaTemporal(fecha);
    }
  };

  const componerMensajeTemporal = (texto, fecha) => {
    if (!texto) {
      return fecha || "";
    }
    return fecha ? `${texto} · ${fecha}` : texto;
  };

  const cargarContexto = async () => {
    setCargandoContexto(true);
    setError("");
    const respuesta = await solicitarContextoEvaluacion();
    registrarMarcaTemporal(respuesta.fechaRespuesta);
    if (respuesta.success) {
      const datos = respuesta.data ?? {};
      setContexto(datos);
      setComponentes(datos.componentes ?? []);
      setLiterales(datos.literales ?? []);
    } else {
      setContexto(null);
      setComponentes([]);
      setLiterales([]);
      setError(
        componerMensajeTemporal(
          respuesta.message || "No se pudo obtener el contexto inicial.",
          respuesta.fechaRespuesta
        )
      );
    }
    setCargandoContexto(false);
  };

  useEffect(() => {
    cargarContexto();
  }, []);

  const reiniciarSeleccion = () => {
    setGrid(null);
    setSelecciones({});
    setOriginalSelecciones({});
    setMensaje("");
    setError("");
  };

  const manejarCambioComponente = async (event) => {
    const valor = event.target.value;
    setComponenteId(valor);
    setAulaId("");
    setAulas([]);
    reiniciarSeleccion();
    if (!valor) {
      return;
    }
    setCargandoAulas(true);
    const respuesta = await solicitarAulasPorComponente(valor);
    registrarMarcaTemporal(respuesta.fechaRespuesta);
    if (respuesta.success) {
      const datos = respuesta.data ?? {};
      setAulas(datos.aulas ?? []);
      setError("");
    } else {
      setAulas([]);
      setError(
        componerMensajeTemporal(
          respuesta.message || "No se pudieron cargar las aulas.",
          respuesta.fechaRespuesta
        )
      );
    }
    setCargandoAulas(false);
  };

  const cargarGrid = async (idComponente, idAula) => {
    if (!idComponente || !idAula) {
      reiniciarSeleccion();
      return false;
    }
    setCargandoGrid(true);
    const respuesta = await solicitarGridEvaluacion(idComponente, idAula);
    registrarMarcaTemporal(respuesta.fechaRespuesta);
    if (respuesta.success) {
      const datos = respuesta.data ?? {};
      setGrid(datos);
      if (Array.isArray(datos.literales) && datos.literales.length) {
        setLiterales(datos.literales);
      }
      const inicial = construirSeleccionesIniciales(datos.estudiantes ?? []);
      setSelecciones(inicial);
      setOriginalSelecciones(inicial);
      setError("");
    } else {
      setGrid(null);
      setSelecciones({});
      setOriginalSelecciones({});
      setError(
        componerMensajeTemporal(
          respuesta.message || "No se pudo generar la matriz de evaluación.",
          respuesta.fechaRespuesta
        )
      );
    }
    setCargandoGrid(false);
    return respuesta.success;
  };

  const manejarCambioAula = async (event) => {
    const valor = event.target.value;
    setAulaId(valor);
    setMensaje("");
    await cargarGrid(componenteId, valor);
  };

  const actualizarSeleccion = (estudianteId, indicadorId, letra) => {
    const letraNormalizada = seleccionarLetraValida(letra);
    setSelecciones((prev) => {
      const copia = { ...prev };
      const estudianteKey = String(estudianteId);
      const indicadorKey = String(indicadorId);
      const indicadoresPrevios = { ...(copia[estudianteKey] ?? {}) };
      if (letraNormalizada) {
        indicadoresPrevios[indicadorKey] = letraNormalizada;
      } else {
        delete indicadoresPrevios[indicadorKey];
      }
      copia[estudianteKey] = indicadoresPrevios;
      return copia;
    });
    setMensaje("");
  };

  const aplicarColumna = (indicadorId, letra) => {
    const letraNormalizada = seleccionarLetraValida(letra);
    if (!letraNormalizada || !grid?.estudiantes) return;
    setSelecciones((prev) => {
      const copia = { ...prev };
      grid.estudiantes.forEach((est) => {
        const estudianteKey = String(est.id_estudiante ?? "");
        if (!estudianteKey) return;
        const permitidos = permitidosPorEstudiante[estudianteKey];
        if (permitidos && !permitidos.has(String(indicadorId))) {
          return;
        }
        const indicadoresPrevios = { ...(copia[estudianteKey] ?? {}) };
        indicadoresPrevios[String(indicadorId)] = letraNormalizada;
        copia[estudianteKey] = indicadoresPrevios;
      });
      return copia;
    });
  };

  const hayCambiosPendientes = useMemo(
    () => hayCambiosEnSelecciones(selecciones, originalSelecciones),
    [selecciones, originalSelecciones]
  );

  const manejarGuardar = async () => {
    if (!componenteId || !aulaId) {
      setMensaje("Selecciona un componente y un aula antes de guardar.");
      return;
    }
    const evaluaciones = [];
    Object.entries(selecciones).forEach(([estudianteKey, indicadores]) => {
      Object.entries(indicadores).forEach(([indicadorKey, letra]) => {
        const previo =
          originalSelecciones?.[estudianteKey]?.[indicadorKey] ?? "";
        const letraNormalizada = seleccionarLetraValida(letra);
        if (!letraNormalizada || letraNormalizada === previo) {
          return;
        }
        evaluaciones.push({
          estudiante_id: Number(estudianteKey),
          indicador_id: Number(indicadorKey),
          valor: letraNormalizada,
        });
      });
    });

    if (!evaluaciones.length) {
      setMensaje("No hay cambios por guardar.");
      return;
    }

    setGuardando(true);
    setMensaje("");
    setError("");
    const payload = {
      componente_id: Number(componenteId),
      aula_id: Number(aulaId),
      momento_id:
        grid?.metadata?.momento?.id_momento ??
        contexto?.momento?.id_momento ??
        undefined,
      evaluaciones,
    };

    const respuesta = await solicitarGuardarEvaluaciones(payload);
    registrarMarcaTemporal(respuesta.fechaRespuesta);
    if (respuesta.success) {
      setMensaje(
        componerMensajeTemporal(
          respuesta.message || "Evaluaciones guardadas correctamente.",
          respuesta.fechaRespuesta
        )
      );
      setError("");
      await cargarGrid(componenteId, aulaId);
    } else {
      setMensaje("");
      setError(
        componerMensajeTemporal(
          respuesta.message || "No se pudieron guardar las evaluaciones.",
          respuesta.fechaRespuesta
        )
      );
    }
    setGuardando(false);
  };

  return (
    <div className="space-y-6">
      <EncabezadoGestion
        estaCargandoContexto={cargandoContexto}
        estaGuardando={guardando}
        hayMatriz={Boolean(grid)}
        hayCambios={hayCambiosPendientes}
        onRecargar={cargarContexto}
        onGuardar={manejarGuardar}
        marcaTemporal={marcaTemporal}
      />

      {mensaje ? <div className={alertaExitoClass}>{mensaje}</div> : null}
      {error ? <div className={alertaErrorClass}>{error}</div> : null}

      {cargandoContexto ? (
        <section className={contenidosLayout.container}>
          <p className={`${typography.bodyMutedSm} text-center`}>
            Cargando contexto...
          </p>
        </section>
      ) : (
        <>
          <PanelContextoEvaluacion contexto={contexto} />
          <PanelFiltrosEvaluacion
            componentes={componentes}
            componenteId={componenteId}
            aulas={aulas}
            aulaId={aulaId}
            cargandoAulas={cargandoAulas}
            deshabilitarComponentes={cargandoContexto || guardando}
            deshabilitarAulas={guardando}
            onSeleccionComponente={manejarCambioComponente}
            onSeleccionAula={manejarCambioAula}
          />

          {cargandoGrid ? (
            <section className={contenidosLayout.container}>
              <p className={`${typography.bodyMutedSm} text-center`}>
                Generando matriz de evaluación...
              </p>
            </section>
          ) : (
            <TablaRendimientoAcademico
              grid={grid}
              literales={literalesDisponibles}
              selecciones={selecciones}
              permitidos={permitidosPorEstudiante}
              estaGuardando={guardando}
              onActualizar={actualizarSeleccion}
              onAplicarColumna={aplicarColumna}
            />
          )}
        </>
      )}
    </div>
  );
};

export default RendimientoAcademico;
