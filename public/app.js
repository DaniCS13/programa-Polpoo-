document.getElementById('uploadForm').addEventListener('submit', async function (event) {
  event.preventDefault();  // Evita el comportamiento por defecto del formulario
  
  const formData = new FormData(this);  // Crea un objeto FormData con los datos del formulario
  const file = formData.get('file');
  const schemaName = formData.get('schemaName');
  
  // Leemos el archivo JSON
  const reader = new FileReader();
  
  reader.onload = async function() {
    try {
      const data = JSON.parse(reader.result); // Convertimos el archivo a JSON

      // Cargar el esquema desde el archivo correspondiente
      const schema = await cargarEsquema(schemaName);

      // Llamamos a la función de validación
      validarJSON(data, schema);
    } catch (error) {
      document.getElementById('errors').innerHTML = `<div class="alert alert-danger">El archivo no es un JSON válido. Error: ${error.message}</div>`;
    }
  }
  
  reader.readAsText(file);  // Leemos el archivo como texto
});

// Función para cargar el esquema desde un archivo JSON
async function cargarEsquema(schemaName) {
  try {
    const response = await fetch(`/schemas/${schemaName}.json`);
    if (!response.ok) {
      throw new Error(`No se pudo cargar el esquema: ${schemaName}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error cargando el esquema:", error);
    document.getElementById('errors').innerHTML = `<div class="alert alert-danger">Error cargando el esquema: ${error.message}</div>`;
  }
}

// Mensajes personalizados
const customErrorMessages = {
  type: 'El valor debe ser de tipo {{type}}',
  required: 'Este campo es obligatorio',
};

// Función para obtener los mensajes de error personalizados
function getCustomErrorMessage(error) {
  const customMessage = customErrorMessages[error.keyword];
  if (customMessage) {
    return customMessage.replace('{{type}}', error.params.type);
  }
  return error.message;
}

// Función para validar el JSON contra el esquema seleccionado
function validarJSON(data, schema) {
  const ajv = new Ajv();  // Necesitas la librería Ajv para validación JSON
  const validate = ajv.compile(schema);
  const valid = validate(data);

  const errorsDiv = document.getElementById('errors');
  errorsDiv.innerHTML = '';  // Limpiar los errores previos

  if (valid) {
    errorsDiv.style.color = 'green';
    errorsDiv.innerHTML = "El JSON es válido.";
  } else {
    errorsDiv.style.color = 'red';
    errorsDiv.innerHTML = "El JSON no cumple con el esquema:<ul>" +
      validate.errors.map(err => `<li>${err.instancePath} ${getCustomErrorMessage(err)}</li>`).join('') + "</ul>";
  }
}
