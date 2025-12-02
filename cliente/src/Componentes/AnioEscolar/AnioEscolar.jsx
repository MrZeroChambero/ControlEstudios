import React from "react";
import { FaPlus } from "react-icons/fa";
import { anioEscolarLayout } from "../EstilosCliente/EstilosClientes";
import { ModalAnioEscolar } from "./ModalAnioEscolar";
import { TablaAniosEscolares } from "./TablaAniosEscolares";
import { useGestionAniosEscolares } from "./useGestionAniosEscolares";

export default function AnioEscolar() {
  const {
    anios,
    cargando,
    filtro,
    actualizarFiltro,
    modal,
    formulario,
    errores,
    abrirCrear,
    abrirEditar,
    cerrarModal,
    cambiarCampo,
    cambiarMomento,
    guardarFormulario,
    eliminarRegistro,
    cambiarEstadoRegistro,
    mostrarDetalle,
  } = useGestionAniosEscolares();

  return (
    <>
      <section className={anioEscolarLayout.container}>
        <div className={anioEscolarLayout.header}>
          <h2 className={anioEscolarLayout.title}>Gestión de Años Escolares</h2>
          <button
            type="button"
            className={anioEscolarLayout.addButton}
            onClick={abrirCrear}
          >
            <FaPlus className="h-4 w-4" />
            <span>Registrar año escolar</span>
          </button>
        </div>
        <p className={anioEscolarLayout.description}>
          Administra los periodos académicos, controla sus fechas clave y ajusta
          los momentos sugeridos según tu calendario institucional.
        </p>

        <TablaAniosEscolares
          registros={anios}
          cargando={cargando}
          filtro={filtro}
          onFiltrar={actualizarFiltro}
          onVer={mostrarDetalle}
          onEditar={abrirEditar}
          onEliminar={eliminarRegistro}
          onCambiarEstado={cambiarEstadoRegistro}
        />
      </section>

      <ModalAnioEscolar
        abierto={modal.abierto}
        modo={modal.modo}
        datos={formulario}
        errores={errores}
        onCerrar={cerrarModal}
        onCambiarCampo={cambiarCampo}
        onCambiarMomento={cambiarMomento}
        onSubmit={guardarFormulario}
      />
    </>
  );
}
