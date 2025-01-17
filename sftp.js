const Client = require('ssh2-sftp-client');
const sftp = new Client();

async function uploadJSONFile(localFilePath, remoteFilePath, schemaName, host, port, username, password) {
  try {
    // Establecer la configuración de la conexión SFTP
    const config = {
      host,
      port,
      username,
      password
    };

    // Conectar al servidor SFTP
    await sftp.connect(config);
    console.log('Conexión exitosa al servidor SFTP.');

    // Subir el archivo JSON
    await sftp.put(localFilePath, remoteFilePath);
    console.log(`Archivo JSON subido correctamente a: ${remoteFilePath}`);

    // Cerrar la conexión
    await sftp.end();
    console.log('Conexión SFTP cerrada.');
  } catch (err) {
    console.error('Error durante la subida del archivo:', err.message);
    throw err;
  }
}

module.exports = { uploadJSONFile };
