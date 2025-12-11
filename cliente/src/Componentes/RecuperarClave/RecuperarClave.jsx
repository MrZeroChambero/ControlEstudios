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
  const [preguntas, setPreguntas] = useState([]);
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
        const preguntasRecibidas = Array.isArray(respuesta.data.preguntas)
          ? respuesta.data.preguntas
          : [];

        if (preguntasRecibidas.length < 3) {
          Swal.fire(
            "Sin preguntas",
            "El usuario no tiene suficientes preguntas registradas. Contacta a un director para que las agregue.",
            "info"
          );
          return;
        }

        setUsuarioObjetivo(respuesta.data.usuario);
        setPreguntas(preguntasRecibidas);
        setForm((prev) => ({
          ...prev,
          preguntaSeleccionada: preguntasRecibidas[0]?.id ?? "",
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
          setPreguntas([]);
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
    setPreguntas([]);
    setPaso("usuario");
    setUsuarioObjetivo(null);
    setInfoIntentos(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-lg space-y-6 rounded-3xl bg-white p-8 shadow-2xl">
        <h1 className="text-center text-2xl font-bold text-slate-900">
          Recuperar contrasena
        </h1>
        <p className="text-center text-sm text-slate-500">
          Usa tus preguntas de seguridad para restablecer tu acceso.
        </p>

        {paso === "usuario" ? (
          <form
            className="space-y-6"
            onSubmit={manejarBusquedaUsuario}
            autoComplete="off"
          >
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Nombre de usuario
              </label>
              <input
                type="text"
                value={form.nombreUsuario}
                onChange={(e) =>
                  actualizarCampo("nombreUsuario", e.target.value)
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Ingresa tu usuario"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Buscar preguntas
            </button>

            {infoIntentos && (
              <div
                className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                style={{ whiteSpace: "pre-line" }}
              >
                {infoIntentos}
              </div>
            )}

            <div className="text-center text-sm">
              <Link to="/Login" className="text-blue-600 hover:underline">
                Volver al inicio de sesion
              </Link>
            </div>
          </form>
        ) : (
          <form
            className="space-y-6"
            onSubmit={manejarRestablecimiento}
            autoComplete="off"
          >
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Respondiendo como
              <span className="font-semibold text-slate-800">
                {" "}
                {usuarioObjetivo?.nombre_usuario}
              </span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Pregunta de seguridad
              </label>
              <select
                value={form.preguntaSeleccionada}
                onChange={(e) =>
                  actualizarCampo("preguntaSeleccionada", e.target.value)
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {preguntas.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.pregunta}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Respuesta
              </label>
              <input
                type="password"
                value={form.respuesta}
                onChange={(e) => actualizarCampo("respuesta", e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Escribe tu respuesta secreta"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Nueva contrasena
                </label>
                <input
                  type="password"
                  value={form.nuevaContrasena}
                  onChange={(e) =>
                    actualizarCampo("nuevaContrasena", e.target.value)
                  }
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Minimo 8 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Confirmar contrasena
                </label>
                <input
                  type="password"
                  value={form.confirmarContrasena}
                  onChange={(e) =>
                    actualizarCampo("confirmarContrasena", e.target.value)
                  }
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Repite la contrasena"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:justify-between">
              <button
                type="button"
                onClick={reiniciarProceso}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                Buscar otro usuario
              </button>
              <button
                type="submit"
                className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                Restablecer contrasena
              </button>
            </div>

            {infoIntentos && (
              <div
                className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
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
