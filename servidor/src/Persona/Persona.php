<?php

namespace Micodigo\Persona;

class Persona
{
  use PersonaAttributesTrait;
  use PersonaValidationTrait;
  use PersonaCrudTrait;
  use PersonaHttpTrait;
  use PersonaBusinessTrait;
}
