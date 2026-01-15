import React from "react";
import { loginFormClasses } from "./loginEstilos";

export const LoginForm = ({
  username,
  password,
  showPassword,
  handleInputChange,
  handleSubmit,
  setShowPassword,
  setUsername,
  setPassword,
}) => {
  return (
    <form autoComplete="off" className={loginFormClasses.form}>
      <div className={loginFormClasses.group}>
        <label className={loginFormClasses.label}>Usuario</label>
        <input
          type="text"
          className={loginFormClasses.input}
          value={username}
          onChange={(e) => handleInputChange(e, setUsername)}
        />
      </div>

      <div className={loginFormClasses.passwordWrapper}>
        <label className={loginFormClasses.label}>Contraseña</label>
        <input
          type={showPassword ? "text" : "password"}
          className={loginFormClasses.input}
          value={password}
          onChange={(e) => handleInputChange(e, setPassword)}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={loginFormClasses.passwordToggle}
        >
          {showPassword ? "Ocultar" : "Mostrar"}
        </button>
      </div>

      <div className={loginFormClasses.actions}>
        <input
          type="button"
          className={loginFormClasses.submitButton}
          onClick={handleSubmit}
          value="Enviar"
        />
      </div>
    </form>
  );
};
