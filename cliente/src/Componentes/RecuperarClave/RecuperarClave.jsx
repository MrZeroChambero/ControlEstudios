import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  iniciarRecuperacionClave,
  restablecerClave,
} from "./recuperarClaveService";
import {
  formatAttemptMessage,
  buildAttemptHtml,
} from "../../utils/attemptMessages";
import { recuperarClaveClasses } from "./recuperarClaveEstilos";

const initialFormState = {
  nombreUsuario: "",
  preguntaSeleccionada: "",
  respuesta: "",
  nuevaContrasena: "",
  confirmarContrasena: "",
};

export const RecuperarClave = () => {
  const [paso, setPaso] = useState("usuario");
  const [form, setForm] = useState(initialFormState);
  const [preguntaActiva, setPreguntaActiva] = useState(null);
  const [usuarioObjetivo, setUsuarioObjetivo] = useState(null);
  const [infoIntentos, setInfoIntentos] = useState(null);
  const navigate = useNavigate();

  const actualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const manejarBusquedaUsuario = async (event) => {
    event.preventDefault();
    const nombreUsuario = form.nombreUsuario.trim();

    if (nombreUsuario === "") {
      Swal.fire("Aviso", "Ingresa el nombre de usuario.", "warning");
      return;
    }

    setInfoIntentos(null);

    try {
      const respuesta = await iniciarRecuperacionClave(nombreUsuario);
      if (respuesta?.back && respuesta?.data) {
        setInfoIntentos(null);
        const preguntaServidor =
          respuesta.data.pregunta || respuesta.data.pregunta_actual;

        if (!preguntaServidor?.id) {
          Swal.fire(
            "Sin pregunta",
            "El servidor no envió una pregunta válida. Intenta nuevamente más tarde.",
            "info"
          );
          return;
        }

        setUsuarioObjetivo(respuesta.data.usuario);
        setPreguntaActiva(preguntaServidor);
        setForm((prev) => ({
          ...prev,
          preguntaSeleccionada: preguntaServidor.id,
          respuesta: "",
          nuevaContrasena: "",
          confirmarContrasena: "",
        }));
        setPaso("preguntas");
      } else {
        const detalle = formatAttemptMessage(respuesta);
        setInfoIntentos(detalle);
        const mensajeBase =
          respuesta?.message ||
          "No se localizaron preguntas para este usuario.";
        Swal.fire({
          icon: "error",
          title: "No encontrado",
          html: buildAttemptHtml(mensajeBase, detalle) || mensajeBase,
        });
      }
    } catch (error) {
      console.error("Error al iniciar la recuperacion:", error);
      const payload = error.response?.data;
      const detalle = formatAttemptMessage(payload);
      setInfoIntentos(detalle);
      const mensajeBase =
        payload?.message || "No se pudo iniciar la recuperacion de contrasena.";
      Swal.fire({
        icon: "error",
        title: "Error",
        html: buildAttemptHtml(mensajeBase, detalle) || mensajeBase,
      });
    }
  };

  const manejarRestablecimiento = async (event) => {
    event.preventDefault();

    if (!form.preguntaSeleccionada) {
      Swal.fire("Aviso", "Debes seleccionar una pregunta.", "warning");
      return;
    }

    if (form.respuesta.trim() === "") {
      Swal.fire(
        "Aviso",
        "Debes responder la pregunta seleccionada.",
        "warning"
      );
      return;
    }

    if (form.nuevaContrasena.length < 8) {
      Swal.fire(
        "Contrasena insegura",
        "La nueva contrasena debe tener al menos 8 caracteres.",
        "warning"
      );
      return;
    }

    if (form.nuevaContrasena !== form.confirmarContrasena) {
      Swal.fire(
        "Contrasenas diferentes",
        "La confirmacion no coincide con la nueva contrasena.",
        "warning"
      );
      return;
    }

    setInfoIntentos(null);

    try {
      const respuesta = await restablecerClave({
        nombre_usuario: form.nombreUsuario.trim(),
        id_pregunta: form.preguntaSeleccionada,
        respuesta: form.respuesta.trim(),
        nueva_contrasena: form.nuevaContrasena,
      });

      if (respuesta?.back) {
        setInfoIntentos(null);
        Swal.fire("Exito", respuesta.message, "success").then(() => {
          setForm(initialFormState);
          setPreguntaActiva(null);
          setPaso("usuario");
          setUsuarioObjetivo(null);
          navigate("/Login");
        });
      } else {
        const detalle = formatAttemptMessage(respuesta);
        setInfoIntentos(detalle);
        const mensajeBase =
          respuesta?.message || "Verifica la informacion e intenta nuevamente.";
        Swal.fire({
          icon: "error",
          title: "No se pudo restablecer",
          html: buildAttemptHtml(mensajeBase, detalle) || mensajeBase,
        });
      }
    } catch (error) {
      console.error("Error al restablecer la contrasena:", error);
      const payload = error.response?.data;
      const detalle = formatAttemptMessage(payload);
      setInfoIntentos(detalle);
      const mensajeBase =
        payload?.message || "No se pudo restablecer la contrasena.";
      Swal.fire({
        icon: "error",
        title: "Error",
        html: buildAttemptHtml(mensajeBase, detalle) || mensajeBase,
      });
    }
  };

  const reiniciarProceso = () => {
    setForm(initialFormState);
    setPreguntaActiva(null);
    setPaso("usuario");
    setUsuarioObjetivo(null);
    setInfoIntentos(null);
  };

  return (
    <div className={recuperarClaveClasses.page}>
      <div className={recuperarClaveClasses.card}>
        <h1 className={recuperarClaveClasses.title}>Recuperar contrasena</h1>
        <p className={recuperarClaveClasses.subtitle}>
          Usa tus preguntas de seguridad para restablecer tu acceso.
        </p>

        {paso === "usuario" ? (
          <form
            className={recuperarClaveClasses.form}
            onSubmit={manejarBusquedaUsuario}
            autoComplete="off"
          >
            <div>
              <label className={recuperarClaveClasses.label}>
                Nombre de usuario
              </label>
              <input
                type="text"
                value={form.nombreUsuario}
                onChange={(e) =>
                  actualizarCampo("nombreUsuario", e.target.value)
                }
                className={recuperarClaveClasses.input}
                placeholder="Ingresa tu usuario"
              />
            </div>

            <button
              type="submit"
              className={recuperarClaveClasses.primaryButton}
            >
              Buscar preguntas
            </button>

            {infoIntentos && (
              <div
                className={recuperarClaveClasses.attemptNotice}
                style={{ whiteSpace: "pre-line" }}
              >
                {infoIntentos}
              </div>
            )}

            <div className={recuperarClaveClasses.linkWrapper}>
              <Link to="/Login" className={recuperarClaveClasses.link}>
                Volver al inicio de sesion
              </Link>
            </div>
          </form>
        ) : (
          <form
            className={recuperarClaveClasses.form}
            onSubmit={manejarRestablecimiento}
            autoComplete="off"
          >
            <div className={recuperarClaveClasses.infoAlert}>
              Respondiendo como
              <span className={recuperarClaveClasses.infoHighlight}>
                {" "}
                {usuarioObjetivo?.nombre_usuario}
              </span>
            </div>

            <div>
              <label className={recuperarClaveClasses.label}>
                Pregunta de seguridad
              </label>
              <div className={recuperarClaveClasses.questionBox}>
                {preguntaActiva?.pregunta || "Sin pregunta disponible."}
              </div>
            </div>

            <div>
              <label className={recuperarClaveClasses.label}>Respuesta</label>
              <input
                type="password"
                value={form.respuesta}
                onChange={(e) => actualizarCampo("respuesta", e.target.value)}
                className={recuperarClaveClasses.input}
                placeholder="Escribe tu respuesta secreta"
              />
            </div>

            <div className={recuperarClaveClasses.passwordGrid}>
              <div>
                <label className={recuperarClaveClasses.label}>
                  Nueva contrasena
                </label>
                <input
                  type="password"
                  value={form.nuevaContrasena}
                  onChange={(e) =>
                    actualizarCampo("nuevaContrasena", e.target.value)
                  }
                  className={recuperarClaveClasses.input}
                  placeholder="Minimo 8 caracteres"
                />
              </div>
              <div>
                <label className={recuperarClaveClasses.label}>
                  Confirmar contrasena
                </label>
                <input
                  type="password"
                  value={form.confirmarContrasena}
                  onChange={(e) =>
                    actualizarCampo("confirmarContrasena", e.target.value)
                  }
                  className={recuperarClaveClasses.input}
                  placeholder="Repite la contrasena"
                />
              </div>
            </div>

            <div className={recuperarClaveClasses.buttonRow}>
              <button
                type="button"
                onClick={reiniciarProceso}
                className={recuperarClaveClasses.secondaryButton}
              >
                Buscar otro usuario
              </button>
              <button
                type="submit"
                className={recuperarClaveClasses.primaryButton}
              >
                Restablecer contrasena
              </button>
            </div>

            {infoIntentos && (
              <div
                className={recuperarClaveClasses.attemptNotice}
                style={{ whiteSpace: "pre-line" }}
              >
                {infoIntentos}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default RecuperarClave;
