
<?php
// validarDatos.php (El Trait que se usará en tu clase)
namespace Usuario\Metodos\Validaciones;

use Valitron\Validator;
use Usuario\Metodos\Validaciones\ReglasValidacion;
use Usuario\Metodos\Validaciones\MensajesValidacion;

trait ValidarDatos
{
    // 💡 Aquí se juntan (componen) los métodos de los dos Traits
    use ReglasValidacion, MensajesValidacion;

    private function _validarDatos(array $data, $isUpdate = false)
    {
        // Configuración inicial
        Validator::lang('es');
        $v = new Validator($data, [], 'es');

        // Llama a los métodos definidos en los Traits incluidos
        $this->_agregarReglaPersonalizada(); // Viene de TraitReglasValidacion
        $this->_definirReglas($v, $isUpdate); // Viene de TraitReglasValidacion
        $this->_asignarMensajes($v); // Viene de TraitMensajesValidacion

        // Ejecución y retorno
        if ($v->validate()) {
            return true;
        }
        return $v->errors();
    }
}
