import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  solicitarPersonasCandidatas,
  crearPersonaEstudiante,
  completarRegistroEstudiante,
  actualizarEstudiante,
  actualizarPersona,
  listarAlergiasCatalogo,
  listarAlergiasEstudiante,
  agregarAlergiaEstudiante,
  eliminarAlergiaEstudiante,
  listarPatologiasCatalogo,
  listarCondicionesSaludEstudiante,
  agregarCondicionSalud,
  eliminarCondicionSalud,
  listarVacunasCatalogo,
  listarVacunasEstudiante,
  agregarVacunaEstudiante,
  eliminarVacunaEstudiante,
  listarConsultasMedicasEstudiante,
  agregarConsultaMedica,
  eliminarConsultaMedica,
  listarDocumentosEstudiante,
  crearDocumento,
  eliminarDocumento,
} from "./estudianteService";
import { DynamicForm } from "./DynamicForm";
import formPersona from "./forms/form_persona.json";
import formEstudiante from "./forms/form_estudiante.json";
import formDocs from "./forms/form_documentos.json";
import formSalud from "./forms/form_salud.json";

export const EstudianteModal = ({
  isOpen,
  onClose,
  onSuccess,
  currentEstudiante,
}) => {
  const modoEdicion = Boolean(currentEstudiante);
  const [paso, setPaso] = useState(1);

  // Persona
  const personaDefaults = formPersona?.defaults || {};
  const [personas, setPersonas] = useState([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [formPersonaData, setFormPersonaData] = useState({
    ...personaDefaults,
  });
  const [errorsPersona, setErrorsPersona] = useState({});
  const [busqueda, setBusqueda] = useState("");

  // Académico
  const estudianteDefaults = formEstudiante?.defaults || {};
  const [formEstudianteData, setFormEstudianteData] = useState({
    ...estudianteDefaults,
  });
  const [errorsEstudiante, setErrorsEstudiante] = useState({});

  // Salud y documentos (solo en edición)
  const [catalogoAlergias, setCatalogoAlergias] = useState([]);
  const [alergiasEst, setAlergiasEst] = useState([]);

  const [catalogoPatologias, setCatalogoPatologias] = useState([]);
  const [condicionesEst, setCondicionesEst] = useState([]);

  const [catalogoVacunas, setCatalogoVacunas] = useState([]);
  const [vacunasEst, setVacunasEst] = useState([]);

  const [consultasEst, setConsultasEst] = useState([]);
  // Documentos
  const [documentosEst, setDocumentosEst] = useState([]);
  const [nuevoDocumento, setNuevoDocumento] = useState({
    tipo_documento: "",
    entregado: false,
    observaciones: "",
  });
  // Salud (formularios nuevos dinámicos)
  const [nuevaAlergia, setNuevaAlergia] = useState({
    fk_alergia: "",
    observaciones: "",
  });
  const [nuevaCondicion, setNuevaCondicion] = useState({
    fk_patologia: "",
    tratamiento: "",
    estado: "controlada",
    observaciones: "",
  });
  const [nuevaVacuna, setNuevaVacuna] = useState({
    fk_vacuna: "",
    fecha_aplicacion: "",
    refuerzos: "",
  });
  const [nuevaConsulta, setNuevaConsulta] = useState({
    tipo_consulta: "control",
    fecha: "",
    descripcion: "",
    tratamiento: "",
  });

  const idEstudiante = useMemo(
    () => currentEstudiante?.id_estudiante ?? currentEstudiante?.id ?? null,
    [currentEstudiante]
  );

  useEffect(() => {
    if (!isOpen) return;
    if (modoEdicion) {
      setPaso(1);
      // Precargar datos de persona y estudiante (cedula_escolar)
      setFormPersonaData({
        primer_nombre: currentEstudiante.primer_nombre || "",
        segundo_nombre: currentEstudiante.segundo_nombre || "",
        primer_apellido: currentEstudiante.primer_apellido || "",
        segundo_apellido: currentEstudiante.segundo_apellido || "",
        fecha_nacimiento: currentEstudiante.fecha_nacimiento || "",
        genero: currentEstudiante.genero || "",
        cedula: currentEstudiante.cedula || "",
        nacionalidad: currentEstudiante.nacionalidad || "",
        direccion: currentEstudiante.direccion || "",
        telefono_principal: currentEstudiante.telefono_principal || "",
        telefono_secundario: currentEstudiante.telefono_secundario || "",
        email: currentEstudiante.email || "",
        tipo_sangre: currentEstudiante.tipo_sangre || "No sabe",
      });
      setFormEstudianteData({
        cedula_escolar: currentEstudiante.cedula_escolar || "",
        fecha_ingreso_escuela: currentEstudiante.fecha_ingreso_escuela || "",
        vive_con_padres: currentEstudiante.vive_con_padres || "si",
        orden_nacimiento: currentEstudiante.orden_nacimiento || 1,
        tiempo_gestacion: currentEstudiante.tiempo_gestacion || 38,
        embarazo_deseado: currentEstudiante.embarazo_deseado || "si",
        tipo_parto: currentEstudiante.tipo_parto || "normal",
        control_esfinteres: currentEstudiante.control_esfinteres || "si",
        control_embarazo: currentEstudiante.control_embarazo || "si",
      });
      cargarColeccionesEdicion();
    } else {
      setPaso(1);
      setPersonaSeleccionada(null);
      setFormPersonaData({ ...personaDefaults });
      setFormEstudianteData({ ...estudianteDefaults });
      solicitarPersonasCandidatas(setPersonas, Swal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, modoEdicion]);

  const cargarColeccionesEdicion = async () => {
    if (!idEstudiante) return;
    const [alergiasCat, patologiasCat, vacunasCat] = await Promise.all([
      listarAlergiasCatalogo(Swal),
      listarPatologiasCatalogo(Swal),
      listarVacunasCatalogo(Swal),
    ]);
    setCatalogoAlergias(alergiasCat);
    setCatalogoPatologias(patologiasCat);
    setCatalogoVacunas(vacunasCat);

    const [alEst, condEst, vacEst, consEst, docsEst] = await Promise.all([
      listarAlergiasEstudiante(idEstudiante, Swal),
      listarCondicionesSaludEstudiante(idEstudiante, Swal),
      listarVacunasEstudiante(idEstudiante, Swal),
      listarConsultasMedicasEstudiante(idEstudiante, Swal),
      listarDocumentosEstudiante(idEstudiante, Swal),
    ]);
    setAlergiasEst(alEst);
    setCondicionesEst(condEst);
    setVacunasEst(vacEst);
    setConsultasEst(consEst);
    setDocumentosEst(docsEst);
  };

  // Validaciones mínimas locales
  const validarPersona = () => {
    const errs = {};
    const required = [
      "primer_nombre",
      "primer_apellido",
      "fecha_nacimiento",
      "genero",
    ];
    required.forEach((k) => {
      if (!formPersonaData[k]) errs[k] = "Requerido";
    });
    return errs;
  };
  const validarEstudiante = () => {
    const errs = {};
    // cedula_escolar no requerida
    return errs;
  };

  const onChangePersona = (name, value) =>
    setFormPersonaData((p) => ({ ...p, [name]: value }));
  const onChangeEstudiante = (name, value) =>
    setFormEstudianteData((p) => ({ ...p, [name]: value }));
  const onChangeNuevoDocumento = (name, value) =>
    setNuevoDocumento((p) => ({ ...p, [name]: value }));

  const resetAndClose = () => {
    setPaso(1);
    setPersonas([]);
    setPersonaSeleccionada(null);
    setFormPersonaData({ ...personaDefaults });
    setFormEstudianteData({});
    setErrorsPersona({});
    setErrorsEstudiante({});
    onClose?.();
  };

  // Crear flujo
  const handleCrearPersona = async (e) => {
    e.preventDefault();
    const errs = validarPersona();
    setErrorsPersona(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      ...formPersonaData,
      tipo: "estudiante",
      estado: "incompleto",
    };
    const nueva = await crearPersonaEstudiante(payload, Swal);
    if (nueva?.id_persona) {
      setPersonaSeleccionada(nueva);
      Swal.fire(
        "Persona creada",
        "Ahora completa los datos académicos.",
        "success"
      );
      setPaso(2);
    }
  };

  const handleSeleccionarCandidata = (p) => {
    setPersonaSeleccionada(p);
    setPaso(2);
  };

  const handleCompletarRegistro = async (e) => {
    e.preventDefault();
    const idPersona =
      personaSeleccionada?.id_persona || personaSeleccionada?.id;
    if (!idPersona) {
      Swal.fire(
        "Falta persona",
        "Selecciona o crea una persona primero.",
        "warning"
      );
      return;
    }
    const data = await completarRegistroEstudiante(
      idPersona,
      { ...formEstudianteData },
      Swal
    );
    if (data) {
      onSuccess?.();
    }
  };

  // Editar flujo: actualizar datos académicos
  const handleActualizarEstudiante = async (e) => {
    e.preventDefault();
    const errs = validarEstudiante();
    setErrorsEstudiante(errs);
    if (Object.keys(errs).length > 0) return;
    // Actualizar persona y luego estudiante (cedula_escolar)
    const personaActualizada = await actualizarPersona(
      currentEstudiante?.fk_persona || currentEstudiante?.id_persona,
      formPersonaData,
      Swal
    );
    const ok = await actualizarEstudiante(
      idEstudiante,
      formEstudianteData,
      Swal
    );
    if (personaActualizada || ok) onSuccess?.();
  };

  // Gestión de Salud / Documentos (acciones básicas)
  const agregarAlergia = async (fk_alergia) => {
    if (!idEstudiante || !fk_alergia) return;
    const created = await agregarAlergiaEstudiante(
      { fk_estudiante: idEstudiante, fk_alergia },
      Swal
    );
    if (created) cargarColeccionesEdicion();
  };
  const removerAlergia = async (idLista) => {
    await eliminarAlergiaEstudiante(idLista, cargarColeccionesEdicion, Swal);
  };

  const agregarCondicion = async (payload) => {
    const created = await agregarCondicionSalud(
      { fk_estudiante: idEstudiante, ...payload },
      Swal
    );
    if (created) cargarColeccionesEdicion();
  };
  // Actualización in-line opcional en futuro
  const eliminarCondicion = async (idCond) => {
    await eliminarCondicionSalud(idCond, cargarColeccionesEdicion, Swal);
  };

  const agregarVacuna = async (payload) => {
    const created = await agregarVacunaEstudiante(
      { fk_estudiante: idEstudiante, ...payload },
      Swal
    );
    if (created) cargarColeccionesEdicion();
  };
  // const actualizarVacuna = async (idVac, payload) => { /* ... */ };
  const eliminarVacuna = async (idVac) => {
    await eliminarVacunaEstudiante(idVac, cargarColeccionesEdicion, Swal);
  };

  const agregarConsulta = async (payload) => {
    const created = await agregarConsultaMedica(
      { fk_estudiante: idEstudiante, ...payload },
      Swal
    );
    if (created) cargarColeccionesEdicion();
  };
  // const actualizarConsulta = async (id, payload) => { /* ... */ };
  const eliminarConsulta = async (id) => {
    await eliminarConsultaMedica(id, cargarColeccionesEdicion, Swal);
  };

  // Documentos: agregar / eliminar
  const agregarDocumento = async () => {
    if (!idEstudiante) return;
    if (!nuevoDocumento.tipo_documento) {
      Swal.fire("Falta tipo", "Selecciona el tipo de documento.", "warning");
      return;
    }
    const payload = { fk_estudiante: idEstudiante, ...nuevoDocumento };
    const created = await crearDocumento(payload, Swal);
    if (created) {
      setNuevoDocumento({
        tipo_documento: "",
        entregado: false,
        observaciones: "",
      });
      cargarColeccionesEdicion();
    }
  };
  const removerDocumento = async (idDoc) => {
    await eliminarDocumento(idDoc, cargarColeccionesEdicion, Swal);
  };

  // Render
  if (!isOpen) return null;

  const personasFiltradas = personas.filter((p) =>
    `${p.primer_nombre} ${p.primer_apellido} ${p.cedula}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const renderPasoCrear = () => (
    <div>
      {paso === 1 && (
        <div>
          <h3 className="text-lg font-bold mb-2">
            1) Selecciona candidata o crea nueva persona
          </h3>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              className="w-1/3 p-2 border border-gray-300 rounded-md"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button
              onClick={() => setPaso(1.5)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Crear nueva persona
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto border rounded">
            {personasFiltradas.map((p) => (
              <div
                key={p.id_persona}
                className="p-2 border-b flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <div className="font-semibold">
                    {p.primer_nombre} {p.primer_apellido}
                  </div>
                  <div className="text-sm text-gray-600">
                    C.I.: {p.cedula || "N/A"}
                  </div>
                </div>
                <button
                  onClick={() => handleSeleccionarCandidata(p)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  Seleccionar
                </button>
              </div>
            ))}
            {personasFiltradas.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No hay personas candidatas o no coinciden con la búsqueda.
              </div>
            )}
          </div>
        </div>
      )}

      {paso === 1.5 && (
        <form onSubmit={handleCrearPersona} className="space-y-4">
          <h3 className="text-lg font-bold mb-2">Crear nueva persona</h3>
          <DynamicForm
            schema={formPersona}
            formData={formPersonaData}
            onChange={onChangePersona}
            errors={errorsPersona}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPaso(1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
            >
              Volver
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Guardar y continuar
            </button>
          </div>
        </form>
      )}

      {paso === 2 && (
        <form onSubmit={handleCompletarRegistro} className="space-y-4">
          <h3 className="text-lg font-bold mb-2">
            2) Completar datos académicos
          </h3>
          <DynamicForm
            schema={formEstudiante}
            formData={formEstudianteData}
            onChange={onChangeEstudiante}
            errors={errorsEstudiante}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPaso(1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
            >
              Volver
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Registrar estudiante
            </button>
          </div>
        </form>
      )}
    </div>
  );

  const renderEdicion = () => (
    <div>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded p-4">
          <h3 className="text-lg font-bold mb-2">Datos de Persona</h3>
          <div className="space-y-4">
            <DynamicForm
              schema={formPersona}
              formData={formPersonaData}
              onChange={onChangePersona}
              errors={errorsPersona}
              disabledFields={["tipo", "estado"]}
            />
          </div>
        </div>
        <div className="border rounded p-4">
          <h3 className="text-lg font-bold mb-2">Datos del Estudiante</h3>
          <form onSubmit={handleActualizarEstudiante} className="space-y-4">
            <DynamicForm
              schema={formEstudiante}
              formData={formEstudianteData}
              onChange={onChangeEstudiante}
              errors={errorsEstudiante}
              disabledFields={["estado"]}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Documentos Académicos */}
        <div className="border rounded p-4 md:col-span-2">
          <h4 className="font-bold mb-2">Documentos académicos</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <select
              className="p-2 border rounded"
              value={nuevoDocumento.tipo_documento}
              onChange={(e) =>
                onChangeNuevoDocumento("tipo_documento", e.target.value)
              }
            >
              <option value="">Tipo de documento...</option>
              {(formDocs.repeatable?.fields?.[0]?.options || []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <label className="inline-flex items-center gap-2 p-2 border rounded">
              <input
                type="checkbox"
                checked={Boolean(nuevoDocumento.entregado)}
                onChange={(e) =>
                  onChangeNuevoDocumento("entregado", e.target.checked)
                }
              />
              Entregado
            </label>
            <input
              type="text"
              className="p-2 border rounded"
              placeholder="Observaciones"
              value={nuevoDocumento.observaciones}
              onChange={(e) =>
                onChangeNuevoDocumento("observaciones", e.target.value)
              }
            />
          </div>
          <button
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
            onClick={agregarDocumento}
          >
            Agregar documento
          </button>

          <div className="space-y-2 max-h-56 overflow-y-auto mt-3">
            {documentosEst.map((d) => (
              <div
                key={d.id_documento || d.id}
                className="flex items-center justify-between border rounded px-3 py-2"
              >
                <div>
                  <div className="font-semibold">{d.tipo_documento}</div>
                  <div className="text-sm text-gray-600">
                    Entregado: {d.entregado ? "Sí" : "No"}
                  </div>
                  {d.observaciones && (
                    <div className="text-sm text-gray-600">
                      Obs.: {d.observaciones}
                    </div>
                  )}
                </div>
                <button
                  className="text-red-600"
                  onClick={() => removerDocumento(d.id_documento || d.id)}
                >
                  Quitar
                </button>
              </div>
            ))}
            {documentosEst.length === 0 && (
              <div className="text-gray-500">Sin documentos.</div>
            )}
          </div>
        </div>

        {/* Secciones de Salud dinámicas */}
        {formSalud.sections.map((section) => {
          const isAlergias = section.name === "alergias";
          const isPatologias = section.name === "patologias";
          const isVacunas = section.name === "vacunas";
          const isConsultas = section.name === "consultas_medicas";
          const items = isAlergias
            ? alergiasEst
            : isPatologias
            ? condicionesEst
            : isVacunas
            ? vacunasEst
            : isConsultas
            ? consultasEst
            : [];
          const newItem = isAlergias
            ? nuevaAlergia
            : isPatologias
            ? nuevaCondicion
            : isVacunas
            ? nuevaVacuna
            : nuevaConsulta;
          const setNewItem = (name, value) => {
            if (isAlergias) setNuevaAlergia((p) => ({ ...p, [name]: value }));
            else if (isPatologias)
              setNuevaCondicion((p) => ({ ...p, [name]: value }));
            else if (isVacunas)
              setNuevaVacuna((p) => ({ ...p, [name]: value }));
            else setNuevaConsulta((p) => ({ ...p, [name]: value }));
          };
          const remoteOptions = (src) => {
            if (src === "alergias")
              return catalogoAlergias.map((a) => ({
                value: a.id_alergia,
                label: a.nombre,
              }));
            if (src === "patologias")
              return catalogoPatologias.map((p) => ({
                value: p.id_patologia,
                label: p.nombre_patologia || p.nombre,
              }));
            if (src === "vacunas")
              return catalogoVacunas.map((v) => ({
                value: v.id_vacuna,
                label: v.nombre,
              }));
            return [];
          };
          const handleAdd = () => {
            // Validar requeridos
            for (const f of section.fields) {
              if (f.required && !newItem[f.name]) {
                Swal.fire(
                  "Falta campo",
                  `Campo obligatorio: ${f.label}`,
                  "warning"
                );
                return;
              }
            }
            if (isAlergias) {
              agregarAlergia(newItem.fk_alergia);
              setNuevaAlergia({ fk_alergia: "", observaciones: "" });
            } else if (isPatologias) {
              agregarCondicion(newItem);
              setNuevaCondicion({
                fk_patologia: "",
                tratamiento: "",
                estado: "controlada",
                observaciones: "",
              });
            } else if (isVacunas) {
              const payload = {
                fk_vacuna: newItem.fk_vacuna,
                fecha_aplicacion: newItem.fecha_aplicacion,
                refuerzos: newItem.refuerzos ? Number(newItem.refuerzos) : 0,
              };
              agregarVacuna(payload);
              setNuevaVacuna({
                fk_vacuna: "",
                fecha_aplicacion: "",
                refuerzos: "",
              });
            } else if (isConsultas) {
              agregarConsulta(newItem);
              setNuevaConsulta({
                tipo_consulta: "control",
                fecha: "",
                descripcion: "",
                tratamiento: "",
              });
            }
          };
          const handleRemove = (item) => {
            if (isAlergias) removerAlergia(item.id_lista_alergia || item.id);
            else if (isPatologias)
              eliminarCondicion(item.id_condicion || item.id);
            else if (isVacunas)
              eliminarVacuna(item.id_vacuna_estudiante || item.id);
            else if (isConsultas) eliminarConsulta(item.id_consulta || item.id);
          };
          return (
            <div key={section.name} className="border rounded p-4">
              <h4 className="font-bold mb-2">{section.label}</h4>
              {/* Formulario nuevo item */}
              <div
                className="grid gap-2 mb-2"
                style={{
                  gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
                }}
              >
                {section.fields.map((f) => {
                  const val = newItem[f.name] || "";
                  if (f.type === "textarea") {
                    return (
                      <textarea
                        key={f.name}
                        className="p-2 border rounded min-h-[60px]"
                        placeholder={f.label}
                        value={val}
                        onChange={(e) => setNewItem(f.name, e.target.value)}
                      />
                    );
                  }
                  if (f.type === "select-remote") {
                    return (
                      <select
                        key={f.name}
                        className="p-2 border rounded"
                        value={val}
                        onChange={(e) => setNewItem(f.name, e.target.value)}
                      >
                        <option value="">{f.label}...</option>
                        {remoteOptions(f.source).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    );
                  }
                  if (f.type === "select") {
                    return (
                      <select
                        key={f.name}
                        className="p-2 border rounded"
                        value={val}
                        onChange={(e) => setNewItem(f.name, e.target.value)}
                      >
                        <option value="">{f.label}...</option>
                        {(f.options || []).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    );
                  }
                  return (
                    <input
                      key={f.name}
                      type={f.type || "text"}
                      className="p-2 border rounded"
                      placeholder={f.label}
                      value={val}
                      onChange={(e) => setNewItem(f.name, e.target.value)}
                    />
                  );
                })}
              </div>
              <button
                className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded mb-3"
                onClick={handleAdd}
              >
                Agregar
              </button>
              {/* Lista */}
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={
                      item.id_lista_alergia ||
                      item.id_condicion ||
                      item.id_vacuna_estudiante ||
                      item.id_consulta ||
                      item.id
                    }
                    className="flex items-center justify-between border rounded px-3 py-2"
                  >
                    <div className="text-sm">
                      {isAlergias && (item.nombre_alergia || item.nombre)}
                      {isPatologias &&
                        (item.nombre_patologia || item.patologia)}
                      {isVacunas && (item.nombre_vacuna || item.nombre)}
                      {isConsultas && `${item.tipo_consulta} • ${item.fecha}`}
                      {isVacunas && item.fecha_aplicacion && (
                        <div className="text-gray-600">
                          {item.fecha_aplicacion} • Ref.: {item.refuerzos ?? 0}
                        </div>
                      )}
                      {isPatologias && (
                        <div className="text-gray-600">
                          {item.tratamiento || "Sin tratamiento"} •{" "}
                          {item.estado || ""}
                        </div>
                      )}
                      {isConsultas && item.descripcion && (
                        <div className="text-gray-600">{item.descripcion}</div>
                      )}
                      {item.observaciones && (
                        <div className="text-gray-600">
                          Obs.: {item.observaciones}
                        </div>
                      )}
                    </div>
                    <button
                      className="text-red-600"
                      onClick={() => handleRemove(item)}
                    >
                      Quitar
                    </button>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-gray-500">{`Sin ${section.label.toLowerCase()}.`}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {modoEdicion ? "Editar Estudiante" : "Crear Estudiante"}
          </h2>
          <button
            onClick={resetAndClose}
            className="text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {!modoEdicion ? renderPasoCrear() : renderEdicion()}

        <div className="flex justify-end mt-4">
          <button
            onClick={resetAndClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
