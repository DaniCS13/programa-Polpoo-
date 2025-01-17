const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { uploadJSONFile } = require('./sftp'); // Importamos la función para subir archivos
const { isValidJSON, fileExists } = require('./fileUtils'); // Validaciones

const app = express();
const port = 3000;

// Configurar multer para la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Verifica si la carpeta uploads existe, si no, la crea
    const uploadPath = 'uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Usamos el nombre original del archivo
  }
});

const upload = multer({ storage: storage });

// Servir los archivos estáticos (index.html, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Parsear los datos del formulario (JSON)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta para subir el archivo
app.post('/upload', upload.single('file'), async (req, res) => {
  // Comprobar si se ha recibido un archivo
  if (!req.file) {
    return res.status(400).send('No se ha subido ningún archivo.');
  }

  // Obtener los datos de conexión SFTP del formulario
  const { host, port, username, password, schemaName } = req.body;

  // Verificar si el archivo existe
  const filePath = path.join(__dirname, 'uploads', req.file.filename);
  if (!fileExists(filePath)) {
    return res.status(400).send('El archivo no existe en la ruta de subida.');
  }

  // Validar el archivo JSON
  if (!isValidJSON(filePath, schemaName)) {
    return res.status(400).send(`El archivo no cumple con el esquema "${schemaName}".`);
  }

  try {
    // Aquí hacemos la conexión SFTP usando los valores del formulario
    await uploadJSONFile(filePath, `/company_8/${req.file.filename}`, schemaName, host, port, username, password);

    res.send('Archivo subido correctamente.');
  } catch (error) {
    console.error('Error al subir el archivo:', error.message);
    res.status(500).send('Hubo un error al subir el archivo.');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
