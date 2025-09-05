<?php

// Importamos la clase de conexión y la clase Persona
use Micodigo\Config\Conect;
use Micodigo\Persona\Persona;

try {
  // Establecer la única conexión a la base de datos
  $conexion = Conect::conectar();
  $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  echo "✅ ¡Conexión a la base de datos exitosa!<br><br>";

  // --- Ejemplo 1: Intento de registro exitoso ---
  echo "Intentando registrar a José...<br>";

  // Usar la sintaxis de argumentos posicionales
  $nuevaPersona = new Persona(
    'José', // primer_nombre
    'Pérez', // primer_apellido
    '31987654', // cedula
    '1998-12-05', // fecha_nacimiento
    'M', // genero
    'Venezolano', // nacionalidad
    'Av. Libertador, Edif. A', // direccion
    '04161234567', // telefono_principal
    null, // segundo_nombre (opcional)
    null, // segundo_apellido (opcional)
    null, // telefono_secundario (opcional)
    'jose.perez@email.com' // email (opcional)
  );

  $resultado = $nuevaPersona->registrar($conexion);

  if (is_array($resultado)) {
    echo "❌ Errores de validación:\n";
    echo "<pre>";
    var_dump($resultado);
    echo "</pre>";
  } else if ($resultado === false) {
    echo "❌ Falló el registro.\n";
  } else {
    echo "✅ ¡Registro exitoso! ID: " . $resultado . "<br><br>";
  }

  // --- Ejemplo 2: Intento de registro fallido por falta de campos ---
  echo "Intentando registrar a Ana (con datos inválidos)...<br>";

  // Usar la sintaxis de argumentos posicionales
  $personaInvalida = new Persona(
    'Ana', // primer_nombre
    'Gómez', // primer_apellido
    '32111222', // cedula
    '1990-01-01', // fecha_nacimiento
    'F', // genero
    'Venezolana', // nacionalidad
    'Calle 10, Casa 5', // direccion
    null, // telefono_principal (este valor nulo causará el error)
    null, // segundo_nombre
    null, // segundo_apellido
    null, // telefono_secundario
    null  // email
  );

  $resultadoInvalido = $personaInvalida->registrar($conexion);

  if (is_array($resultadoInvalido)) {
    echo "❌ Errores de validación:\n";
    echo "<pre>";
    print_r($resultadoInvalido);
    echo "</pre>";
  } else if ($resultadoInvalido === false) {
    echo "❌ Falló el registro.\n";
  }
} catch (Exception $e) {
  echo "Fallo general en la aplicación: " . $e->getMessage();
}
