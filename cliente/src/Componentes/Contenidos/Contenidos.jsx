import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { ContenidosTable } from "./ContenidosTable";
import { ContenidosModal } from "./ContenidosModal";
import { TemasModal } from "./TemasModal";
import { TemaFormModal } from "./TemaFormModal";
import {
  solicitarContenidos,
  solicitarComponentesSelect,
  solicitarTemasPorContenido,
  eliminarContenido,
  enviarContenido,
  cambioEstadoContenido,
} from "./contenidosService";
import {
  crearTema,
  actualizarTema,
  eliminarTema,
  cambioEstadoTema,
} from "./temasService";
import { solicitudAreasComponentes } from "../ComponentesAprendisaje/solicitudAreasComponentes";
import { contenidosLayout } from "./contenidosEstilos";

const opcionesGrado = [
  { valor: "general", etiqueta: "General" },
  { valor: "1", etiqueta: "1°" },
  { valor: "2", etiqueta: "2°" },
  { valor: "3", etiqueta: "3°" },
  { valor: "4", etiqueta: "4°" },
  { valor: "5", etiqueta: "5°" },
  { valor: "6", etiqueta: "6°" },
];

const formatearGrado = (grado) => {
  const encontrado = opcionesGrado.find((item) => item.valor === grado);
  return encontrado ? encontrado.etiqueta : grado;
};

export const Contenidos = () => {
  const [contenidos, setContenidos] = useState([]);
  const [componentes, setComponentes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [temasContenido, setTemasContenido] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemasModalOpen, setIsTemasModalOpen] = useState(false);
  const [isTemaFormModalOpen, setIsTemaFormModalOpen] = useState(false);
  const [currentContenido, setCurrentContenido] = useState(null);
  const [currentTema, setCurrentTema] = useState(null);
  const [modoModal, setModoModal] = useState("crear");
  const [modoTemaModal, setModoTemaModal] = useState("crear");
  const [formData, setFormData] = useState({
    nombre_contenido: "",
    fk_componente: "",
    grado: "",
    descripcion: "",
  });
  const [temaFormData, setTemaFormData] = useState({ nombre_tema: "" });

  useEffect(() => {
    const cargar = async () => {
      await solicitarContenidos({ setContenidos, setIsLoading, Swal });
      await solicitarComponentesSelect({ setComponentes, Swal });
      await solicitudAreasComponentes({ setAreas, Swal });
    };

    cargar();
  }, []);

  const componentesFormateados = useMemo(() => {
    if (componentes.length === 0) {
      return [];
    }

    return componentes.map((componente) => {
      const area = areas.find(
        (item) => item.id_area_aprendizaje === componente.fk_area
      );

      return {
        ...componente,
        etiqueta: area
          ? `${componente.nombre} — ${area.nombre_area}`
          : componente.nombre,
        nombre_area: area?.nombre_area ?? null,
      };
    });
  }, [componentes, areas]);

  const cargarTemas = async (idContenido) => {
    try {
      const temas = await solicitarTemasPorContenido(idContenido, Swal);
      setTemasContenido(temas);
    } catch (error) {
      console.error("Error al cargar temas:", error);
      Swal.fire(
        "Error",
        error?.message || "No se pudieron cargar los temas del contenido.",
        "error"
      );
    }
  };

  const manejarCambioEstadoContenido = (contenido) => {
    const nuevoEstado = contenido.estado === "activo" ? "inactivo" : "activo";
    const accion = nuevoEstado === "activo" ? "activar" : "desactivar";

    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas ${accion} este contenido?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (!result.isConfirmed) {
        return;
      }

      try {
        await cambioEstadoContenido({
          idContenido: contenido.id_contenido,
          Swal,
        });
        await solicitarContenidos({ setContenidos, setIsLoading, Swal });
      } catch (error) {
        console.error(`Error al ${accion} el contenido:`, error);
        Swal.fire("Error", `No se pudo ${accion} el contenido.`, "error");
      }
    });
  };

  const abrirModalContenido = (contenido = null, modo = "crear") => {
    setCurrentContenido(contenido);
    setModoModal(modo);

    if (contenido) {
      setFormData({
        nombre_contenido: contenido.nombre_contenido ?? "",
        fk_componente: contenido.fk_componente?.toString() ?? "",
        grado: contenido.grado ?? "",
        descripcion: contenido.descripcion ?? "",
      });

      if (modo === "ver") {
        cargarTemas(contenido.id_contenido);
      }
    } else {
      setFormData({
        nombre_contenido: "",
        fk_componente: "",
        grado: "",
        descripcion: "",
      });
    }

    setIsModalOpen(true);
  };

  const cerrarModalContenido = () => {
    setIsModalOpen(false);
    setCurrentContenido(null);
    setModoModal("crear");
    setTemasContenido([]);
  };

  const abrirModalTemas = async (contenido) => {
    setCurrentContenido(contenido);

    try {
      const temas = await solicitarTemasPorContenido(
        contenido.id_contenido,
        Swal
      );
      setTemasContenido(temas);
      setIsTemasModalOpen(true);
    } catch (error) {
      console.error("Error al cargar temas:", error);
      Swal.fire(
        "Error",
        error?.message || "No se pudieron cargar los temas asociados.",
        "error"
      );
    }
  };

  const cerrarModalTemas = () => {
    setIsTemasModalOpen(false);
    setCurrentContenido(null);
    setTemasContenido([]);
  };

  const abrirModalTema = (tema = null, modo = "crear") => {
    setCurrentTema(tema);
    setModoTemaModal(modo);
    setTemaFormData({ nombre_tema: tema?.nombre_tema ?? "" });
    setIsTemaFormModalOpen(true);
  };

  const cerrarModalTema = () => {
    setIsTemaFormModalOpen(false);
    setCurrentTema(null);
    setModoTemaModal("crear");
  };

  const manejarCambioFormulario = (evento) => {
    const { name, value } = evento.target;
    setFormData((previo) => ({ ...previo, [name]: value }));
  };

  const manejarCambioTema = (evento) => {
    const { name, value } = evento.target;
    setTemaFormData((previo) => ({ ...previo, [name]: value }));
  };

  const manejarVerContenido = (contenido) =>
    abrirModalContenido(contenido, "ver");
  const manejarEditarContenido = (contenido) =>
    abrirModalContenido(contenido, "editar");
  const manejarEliminarContenido = (id) =>
    eliminarContenido({
      idContenido: id,
      recargar: () =>
        solicitarContenidos({ setContenidos, setIsLoading, Swal }),
      Swal,
    });

  const manejarSubmitContenido = async (evento) => {
    evento.preventDefault();

    console.log("[Contenidos] Datos del formulario antes de enviar:", formData);

    await enviarContenido({
      datos: formData,
      contenidoActual: currentContenido,
      cerrarModal: cerrarModalContenido,
      recargar: () =>
        solicitarContenidos({ setContenidos, setIsLoading, Swal }),
      Swal,
    });
  };

  const manejarAgregarTema = () => {
    if (!currentContenido) {
      return;
    }
    abrirModalTema(null, "crear");
  };

  const manejarEditarTema = (tema) => abrirModalTema(tema, "editar");

  const manejarEliminarTema = (tema) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }

      try {
        await eliminarTema(tema.id_tema, Swal);
        await cargarTemas(currentContenido.id_contenido);
        Swal.fire("Hecho", "El tema se eliminó correctamente.", "success");
      } catch (error) {
        console.error("Error al eliminar tema:", error);
        Swal.fire("Error", "No se pudo eliminar el tema.", "error");
      }
    });
  };

  const manejarCambioEstadoTema = (tema) => {
    const nuevoEstado = tema.estado === "activo" ? "inactivo" : "activo";
    const accion = nuevoEstado === "activo" ? "activar" : "desactivar";

    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas ${accion} este tema?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
    }).then(async (resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }

      try {
        await cambioEstadoTema(tema.id_tema, Swal);
        await cargarTemas(currentContenido.id_contenido);
        Swal.fire("Hecho", `Tema ${accion}do correctamente.`, "success");
      } catch (error) {
        console.error(`Error al ${accion} el tema:`, error);
        Swal.fire("Error", `No se pudo ${accion} el tema.`, "error");
      }
    });
  };

  const manejarSubmitTema = async (evento) => {
    evento.preventDefault();

    if (!currentContenido) {
      Swal.fire(
        "Aviso",
        "Debe seleccionar un contenido antes de registrar temas.",
        "warning"
      );
      return;
    }

    const datos = {
      ...temaFormData,
      fk_contenido: currentContenido.id_contenido,
    };

    try {
      if (modoTemaModal === "editar") {
        await actualizarTema(currentTema.id_tema, datos, Swal);
      } else {
        await crearTema(datos, Swal);
      }

      await cargarTemas(currentContenido.id_contenido);
      cerrarModalTema();
    } catch (error) {
      console.error("Error al guardar tema:", error);
    }
  };

  return (
    <>
      <div className={contenidosLayout.container}>
        <div className={contenidosLayout.header}>
          <h2 className={contenidosLayout.title}>Gestión de Contenidos</h2>
          <button
            type="button"
            onClick={() => abrirModalContenido()}
            className={contenidosLayout.addButton}
          >
            <FaPlus className="h-4 w-4" />
            <span>Agregar Contenido</span>
          </button>
        </div>
        <p className={contenidosLayout.description}>
          Administra los contenidos curriculares vinculados a los componentes de
          aprendizaje. Cada contenido puede tener múltiples temas asociados para
          detallar la planificación.
        </p>

        <ContenidosTable
          contenidos={contenidos}
          isLoading={isLoading}
          onEdit={manejarEditarContenido}
          onDelete={manejarEliminarContenido}
          cambioEstados={manejarCambioEstadoContenido}
          onView={manejarVerContenido}
          onViewTemas={abrirModalTemas}
          formatearGrado={formatearGrado}
        />
      </div>

      <ContenidosModal
        isOpen={isModalOpen}
        onClose={cerrarModalContenido}
        onSubmit={manejarSubmitContenido}
        currentContenido={currentContenido}
        formData={formData}
        componentes={componentesFormateados}
        grados={opcionesGrado}
        datosFormulario={manejarCambioFormulario}
        modo={modoModal}
        formatearGrado={formatearGrado}
      />

      <TemasModal
        isOpen={isTemasModalOpen}
        onClose={cerrarModalTemas}
        contenido={currentContenido}
        temas={temasContenido}
        onAgregarTema={manejarAgregarTema}
        onEditarTema={manejarEditarTema}
        onEliminarTema={manejarEliminarTema}
        onCambiarEstadoTema={manejarCambioEstadoTema}
        formatearGrado={formatearGrado}
      />

      <TemaFormModal
        isOpen={isTemaFormModalOpen}
        onClose={cerrarModalTema}
        onSubmit={manejarSubmitTema}
        currentTema={currentTema}
        formData={temaFormData}
        onChange={manejarCambioTema}
        contenido={currentContenido}
      />
    </>
  );
};
