import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  solicitarAulas,
  actualizarAula,
  solicitarAreas,
  solicitarPersonal,
} from "../../api/aperturaService";
import {
  solicitarMomentosPorAnio,
  aperturarAnio as aperturarAnioService,
} from "../../api/anioEscolarService";

export default function GestionApertura({ idAnio, onClose, onRefrescar }) {
  const [aulas, setAulas] = useState([]);
  const [momentos, setMomentos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [seleccionEspecialistas, setSeleccionEspecialistas] = useState({});
  const [aulasEditadas, setAulasEditadas] = useState({});

  useEffect(() => {
    if (!idAnio) return;
    cargarDatos();
  }, [idAnio]);

  const cargarDatos = async () => {
    await solicitarAulas(setAulas, Swal);
    await solicitarMomentosPorAnio(idAnio, setMomentos, Swal);
    await solicitarAreas(setAreas, Swal);
    await solicitarPersonal(setPersonal, Swal);
  };

  const aulasFiltradas = aulas.filter((a) => +a.fk_anio_escolar === +idAnio);

  const handleSeleccionEspecialista = (idArea, idPersonal) => {
    setSeleccionEspecialistas((s) => ({ ...s, [idArea]: idPersonal }));
  };

  const handleCambiarGuiaLocal = (idAula, fk_guia) => {
    setAulasEditadas((e) => ({
      ...e,
      [idAula]: { ...aulas.find((a) => a.id_aula === idAula), fk_guia },
    }));
  };

  const guardarGuias = async () => {
    const keys = Object.keys(aulasEditadas);
    if (!keys.length)
      return Swal.fire("Info", "No hay cambios en guías.", "info");
    const resultados = [];
    for (const id of keys) {
      const payload = aulasEditadas[id];
      const res = await actualizarAula(id, payload, Swal);
      resultados.push({ id, res });
    }
    Swal.fire("OK", "Guías actualizadas.", "success");
    setAulasEditadas({});
    cargarDatos();
  };

  const handleAperturar = async () => {
    const confirm = await Swal.fire({
      title: "Confirmar apertura",
      html: `Se procederá a crear imparticiones para ${aulasFiltradas.length} aulas, ${areas.length} áreas y ${momentos.length} momentos. ¿Continuar?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, aperturar",
    });
    if (!confirm.isConfirmed) return;
    const res = await aperturarAnioService(idAnio, Swal);
    if (res && res.back === true) {
      // Mostrar resumen detallado dentro de un modal
      const resumen = res.data || {};
      const creado = resumen.creadas ?? 0;
      const omitidas = resumen.omitidas ?? 0;
      const avisos = (resumen.avisos || [])
        .map((a) => `<li>${a}</li>`)
        .join("");
      const errores = (resumen.errores || [])
        .map((e) => `<li>${e}</li>`)
        .join("");
      const html = `
        <div>
          <p><strong>Creadas:</strong> ${creado}</p>
          <p><strong>Omitidas:</strong> ${omitidas}</p>
          ${
            avisos
              ? `<div><strong>Avisos:</strong><ul>${avisos}</ul></div>`
              : ""
          }
          ${
            errores
              ? `<div><strong>Errores:</strong><ul>${errores}</ul></div>`
              : ""
          }
        </div>
      `;
      await Swal.fire({
        title: "Apertura completada",
        html,
        icon: "success",
        width: 700,
      });
      if (onRefrescar) onRefrescar();
      if (onClose) onClose();
    } else {
      Swal.fire("Error", res.message || "Error al aperturar", "error");
    }
  };

  const buscarNombrePersonal = (id) => {
    const p = personal.find((x) => +x.id_personal === +id);
    if (!p) return "-";
    return `${p.primer_nombre} ${p.primer_apellido}`;
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">Gestión de Apertura - Año {idAnio}</h3>
        <div>
          <button
            onClick={() => {
              if (onClose) onClose();
            }}
            className="mr-2 text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-3">
        <div className="col-span-1">
          <strong>Aulas:</strong>
          <div>{aulasFiltradas.length}</div>
          <strong>Momentos:</strong>
          <div>{momentos.length}</div>
          <strong>Áreas activas:</strong>
          <div>
            {
              areas.filter(
                (a) => a.estado === "activo" || a.estado === undefined
              ).length
            }
          </div>
        </div>
        <div className="col-span-2">
          <div className="mb-2">
            <button
              onClick={guardarGuias}
              className="bg-blue-600 text-white px-3 py-1 rounded mr-2"
            >
              Guardar guías
            </button>
            <button
              onClick={handleAperturar}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Aperturar año
            </button>
          </div>

          <div className="border-t pt-3">
            <h4 className="font-semibold">Asignar especialistas por área</h4>
            {areas && areas.length ? (
              areas.map((area) => {
                const candidatos = personal.filter(
                  (p) =>
                    +p.fk_funcion === +area.fk_funcion && p.estado === "activo"
                );
                return (
                  <div
                    key={area.id_area_aprendizaje}
                    className="flex items-center gap-3 mb-2"
                  >
                    <div className="w-1/3">{area.nombre}</div>
                    <select
                      className="w-1/3 p-1 border"
                      value={
                        seleccionEspecialistas[area.id_area_aprendizaje] || ""
                      }
                      onChange={(e) =>
                        handleSeleccionEspecialista(
                          area.id_area_aprendizaje,
                          e.target.value
                        )
                      }
                    >
                      <option value="">-- Dejar al backend --</option>
                      {candidatos.map((c) => (
                        <option key={c.id_personal} value={c.id_personal}>
                          {c.primer_nombre} {c.primer_apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })
            ) : (
              <div>No hay áreas</div>
            )}
          </div>

          <div className="border-t pt-3 mt-3">
            <h4 className="font-semibold">Aulas y guías</h4>
            {aulasFiltradas && aulasFiltradas.length ? (
              aulasFiltradas.map((aula) => (
                <div
                  key={aula.id_aula}
                  className="flex items-center gap-3 mb-2"
                >
                  <div className="w-1/3">
                    {aula.nombre || `Aula ${aula.id_aula}`}
                  </div>
                  <select
                    className="w-1/3 p-1 border"
                    value={
                      (aulasEditadas[aula.id_aula]?.fk_guia ?? aula.fk_guia) ||
                      ""
                    }
                    onChange={(e) =>
                      handleCambiarGuiaLocal(aula.id_aula, e.target.value)
                    }
                  >
                    <option value="">-- Sin guía --</option>
                    {personal
                      .filter((p) => p.estado === "activo")
                      .map((p) => (
                        <option key={p.id_personal} value={p.id_personal}>
                          {p.primer_nombre} {p.primer_apellido}
                        </option>
                      ))}
                  </select>
                  <div className="w-1/3">
                    Guía actual: {buscarNombrePersonal(aula.fk_guia)}
                  </div>
                </div>
              ))
            ) : (
              <div>No hay aulas para este año</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
