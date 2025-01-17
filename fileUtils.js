const fs = require('fs');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

// Importar los esquemas JSON
const schemas = {
  schema1: require('./schemas/schema1.json'),
  schema2: require('./schemas/schema2.json'),
  schema3: require('./schemas/schema3.json'),
  schema4: require('./schemas/schema4.json')
};

// Función para validar si el archivo JSON existe
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Función para validar el archivo JSON contra un esquema
function isValidJSON(filePath, schemaName) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);

    // Verificar si el esquema existe
    const schema = schemas[schemaName];
    if (!schema) {
      console.error(`Esquema "${schemaName}" no encontrado.`);
      return false;
    }

    // Validar el archivo JSON contra el esquema
    const validate = ajv.compile(schema);
    const valid = validate(jsonData);

    if (!valid) {
      console.error('Errores de validación:', validate.errors);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error al procesar el archivo JSON:', err.message);
    return false;
  }
}

module.exports = { fileExists, isValidJSON };
