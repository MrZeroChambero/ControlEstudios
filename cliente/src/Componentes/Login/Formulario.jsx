import React from "react";

export const LoginForm = ({
  username,
  password,
  showPassword,
  handleInputChange,
  Solicitud,
  setShowPassword,
  setUsername,
  setPassword,
  navigate, // Asegúrate de recibir navigate como prop
}) => {
  return (
    <form>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Usuario
        </label>
        <input
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={username}
          onChange={(e) => handleInputChange(e, setUsername)}
        />
      </div>

      <div className="mb-6 relative">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Contraseña
        </label>
        <input
          type={showPassword ? "text" : "password"}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          value={password}
          onChange={(e) => handleInputChange(e, setPassword)}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 top-6 flex items-center px-4 text-gray-600"
        >
          {showPassword ? "Ocultar" : "Mostrar"}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <input
          type="button"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          // Ahora pasamos la función `Maps` a la función Solicitud
          onClick={(e) => Solicitud(e, username, password, navigate)}
          value="Enviar"
        />
      </div>
    </form>
  );
};
