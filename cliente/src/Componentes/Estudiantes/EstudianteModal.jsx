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
import {
  formatearFechaCorta,
  formatearFechaHoraCorta,
} from "../../utilidades/formatoFechas";
import { estudiantesModalClasses } from "../EstilosCliente/EstilosClientes";

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
    <div className={estudiantesModalClasses.body}>
      {paso === 1 && (
        <div>
          <h3 className={estudiantesModalClasses.candidates.title}>
            1) Selecciona candidata o crea nueva persona
          </h3>
          <div className={estudiantesModalClasses.candidates.controls}>
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              className={estudiantesModalClasses.candidates.input}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button
              onClick={() => setPaso(1.5)}
              className={estudiantesModalClasses.candidates.button}
            >
              Crear nueva persona
            </button>
          </div>
          <div className={estudiantesModalClasses.candidates.list}>
            {personasFiltradas.map((p) => (
              <div
                key={p.id_persona}
                className={estudiantesModalClasses.candidates.item}
              >
                <div>
                  <div className={estudiantesModalClasses.candidates.name}>
                    {p.primer_nombre} {p.primer_apellido}
                  </div>
                  <div className={estudiantesModalClasses.candidates.meta}>
                    C.I.: {p.cedula || "N/A"}
                  </div>
                </div>
                <button
                  onClick={() => handleSeleccionarCandidata(p)}
                  className={estudiantesModalClasses.candidates.selectButton}
                >
                  Seleccionar
                </button>
              </div>
            ))}
            {personasFiltradas.length === 0 && (
              <div className={estudiantesModalClasses.candidates.empty}>
                No hay personas candidatas o no coinciden con la búsqueda.
              </div>
            )}
          </div>
        </div>
      )}

      {paso === 1.5 && (
        <form
          onSubmit={handleCrearPersona}
          className={estudiantesModalClasses.form.wrapper}
        >
          <h3 className={estudiantesModalClasses.form.title}>
            Crear nueva persona
          </h3>
          <DynamicForm
            schema={formPersona}
            formData={formPersonaData}
            onChange={onChangePersona}
            errors={errorsPersona}
          />
          <div className={estudiantesModalClasses.form.actions}>
            <button
              type="button"
              onClick={() => setPaso(1)}
              className={estudiantesModalClasses.form.secondaryButton}
            >
              Volver
            </button>
            <button
              type="submit"
              className={estudiantesModalClasses.form.primaryButton}
            >
              Guardar y continuar
            </button>
          </div>
        </form>
      )}

      {paso === 2 && (
        <form
          onSubmit={handleCompletarRegistro}
          className={estudiantesModalClasses.form.wrapper}
        >
          <h3 className={estudiantesModalClasses.form.title}>
            2) Completar datos académicos
          </h3>
          <DynamicForm
            schema={formEstudiante}
            formData={formEstudianteData}
            onChange={onChangeEstudiante}
            errors={errorsEstudiante}
          />
          <div className={estudiantesModalClasses.form.actions}>
            <button
              type="button"
              onClick={() => setPaso(1)}
              className={estudiantesModalClasses.form.secondaryButton}
            >
              Volver
            </button>
            <button
              type="submit"
              className={estudiantesModalClasses.form.primaryButton}
            >
              Registrar estudiante
            </button>
          </div>
        </form>
      )}
    </div>
  );

  const renderEdicion = () => (
    <div className={estudiantesModalClasses.body}>
      <div className={estudiantesModalClasses.sections.grid}>
        <div className={estudiantesModalClasses.sections.card}>
          <h3 className={estudiantesModalClasses.sections.title}>
            Datos de Persona
          </h3>
          <div className={estudiantesModalClasses.sections.body}>
            <DynamicForm
              schema={formPersona}
              formData={formPersonaData}
              onChange={onChangePersona}
              errors={errorsPersona}
              disabledFields={["tipo", "estado"]}
            />
          </div>
        </div>
        <div className={estudiantesModalClasses.sections.card}>
          <h3 className={estudiantesModalClasses.sections.title}>
            Datos del Estudiante
          </h3>
          <form
            onSubmit={handleActualizarEstudiante}
            className={estudiantesModalClasses.form.wrapper}
          >
            <DynamicForm
              schema={formEstudiante}
              formData={formEstudianteData}
              onChange={onChangeEstudiante}
              errors={errorsEstudiante}
              disabledFields={["estado"]}
            />
            <div className={estudiantesModalClasses.form.actions}>
              <button
                type="submit"
                className={estudiantesModalClasses.form.primaryButton}
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className={estudiantesModalClasses.sections.grid}>
        {/* Documentos Académicos */}
        <div className={estudiantesModalClasses.documents.container}>
          <h4 className={estudiantesModalClasses.documents.title}>
            Documentos académicos
          </h4>
          <div className={estudiantesModalClasses.documents.formGrid}>
            <select
              className={estudiantesModalClasses.documents.select}
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
            <label className={estudiantesModalClasses.documents.checkbox}>
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
              className={estudiantesModalClasses.documents.input}
              placeholder="Observaciones"
              value={nuevoDocumento.observaciones}
              onChange={(e) =>
                onChangeNuevoDocumento("observaciones", e.target.value)
              }
            />
          </div>
          <button
            className={estudiantesModalClasses.documents.addButton}
            onClick={agregarDocumento}
          >
            Agregar documento
          </button>

          <div className={estudiantesModalClasses.documents.list}>
            {documentosEst.map((d) => (
              <div
                key={d.id_documento || d.id}
                className={estudiantesModalClasses.documents.item}
              >
                <div>
                  <div className={estudiantesModalClasses.documents.name}>
                    {d.tipo_documento}
                  </div>
                  <div className={estudiantesModalClasses.documents.meta}>
                    {d.entregado ? (
                      <span
                        className={estudiantesModalClasses.documents.delivered}
                      >
                        Entregado
                      </span>
                    ) : (
                      <span
                        className={estudiantesModalClasses.documents.pending}
                      >
                        Pendiente
                      </span>
                    )}
                  </div>
                  {d.observaciones && (
                    <div className={estudiantesModalClasses.documents.meta}>
                      Obs.: {d.observaciones}
                    </div>
                  )}
                </div>
                <button
                  className={estudiantesModalClasses.documents.deleteButton}
                  onClick={() => removerDocumento(d.id_documento || d.id)}
                >
                  Quitar
                </button>
              </div>
            ))}
            {documentosEst.length === 0 && (
              <div className={estudiantesModalClasses.documents.empty}>
                Sin documentos.
              </div>
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
            <div
              key={section.name}
              className={estudiantesModalClasses.salud.card}
            >
              <h4 className={estudiantesModalClasses.salud.title}>
                {section.label}
              </h4>
              {/* Formulario nuevo item */}
              <div
                className={estudiantesModalClasses.salud.formGrid}
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
                        className={estudiantesModalClasses.salud.textarea}
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
                        className={estudiantesModalClasses.salud.select}
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
                        className={estudiantesModalClasses.salud.select}
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
                      className={estudiantesModalClasses.salud.input}
                      placeholder={f.label}
                      value={val}
                      onChange={(e) => setNewItem(f.name, e.target.value)}
                    />
                  );
                })}
              </div>
              <button
                className={estudiantesModalClasses.salud.addButton}
                onClick={handleAdd}
              >
                Agregar
              </button>
              {/* Lista */}
              <div className={estudiantesModalClasses.salud.list}>
                {items.map((item) => {
                  const clave =
                    item.id_lista_alergia ||
                    item.id_condicion ||
                    item.id_vacuna_estudiante ||
                    item.id_consulta ||
                    item.id;

                  const fechaVacuna = isVacunas
                    ? formatearFechaCorta(item.fecha_aplicacion)
                    : null;
                  const fechaConsulta = isConsultas
                    ? formatearFechaHoraCorta(item.fecha)
                    : null;

                  let encabezado = "";
                  if (isAlergias) {
                    encabezado = item.nombre_alergia || item.nombre || "";
                  } else if (isPatologias) {
                    encabezado = item.nombre_patologia || item.patologia || "";
                  } else if (isVacunas) {
                    encabezado = item.nombre_vacuna || item.nombre || "";
                  } else if (isConsultas) {
                    const tipo = item.tipo_consulta || "";
                    encabezado = fechaConsulta
                      ? `${tipo} • ${fechaConsulta}`
                      : tipo;
                  }

                  return (
                    <div
                      key={clave}
                      className={estudiantesModalClasses.salud.item}
                    >
                      <div className={estudiantesModalClasses.salud.details}>
                        <span
                          className={estudiantesModalClasses.salud.headline}
                        >
                          {encabezado || "Sin información"}
                        </span>
                        {isVacunas && fechaVacuna && (
                          <span className={estudiantesModalClasses.salud.meta}>
                            {fechaVacuna} • Ref.: {item.refuerzos ?? 0}
                          </span>
                        )}
                        {isPatologias && (
                          <span className={estudiantesModalClasses.salud.meta}>
                            {item.tratamiento || "Sin tratamiento"} •{" "}
                            {item.estado || ""}
                          </span>
                        )}
                        {isConsultas && item.descripcion && (
                          <span className={estudiantesModalClasses.salud.meta}>
                            {item.descripcion}
                          </span>
                        )}
                        {item.observaciones && (
                          <span className={estudiantesModalClasses.salud.meta}>
                            Obs.: {item.observaciones}
                          </span>
                        )}
                      </div>
                      <button
                        className={estudiantesModalClasses.salud.deleteButton}
                        onClick={() => handleRemove(item)}
                      >
                        Quitar
                      </button>
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <div
                    className={estudiantesModalClasses.salud.empty}
                  >{`Sin ${section.label.toLowerCase()}.`}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={estudiantesModalClasses.overlay}>
      <div className={estudiantesModalClasses.content}>
        <div className={estudiantesModalClasses.header}>
          <h2 className={estudiantesModalClasses.title}>
            {modoEdicion ? "Editar Estudiante" : "Crear Estudiante"}
          </h2>
          <button
            onClick={resetAndClose}
            className={estudiantesModalClasses.closeButton}
            type="button"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {!modoEdicion ? renderPasoCrear() : renderEdicion()}

        <div className={estudiantesModalClasses.footer}>
          <button
            onClick={resetAndClose}
            type="button"
            className={estudiantesModalClasses.footerButton}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
