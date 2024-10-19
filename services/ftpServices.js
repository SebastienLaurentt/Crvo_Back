const ftp = require("basic-ftp");
const path = require('path');
const fs = require('fs').promises;

async function connectToFTP() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: process.env.FTP_HOST,
      port: parseInt(process.env.FTP_PORT, 10),
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: false,
    });

    console.log("Connexion FTP établie avec succès !");
    return client;
  } catch (err) {
    console.error("Erreur de connexion FTP:", err);
    throw err;
  }
}

async function downloadFromFTP(fileGroup) {
  const client = await connectToFTP();
  try {
    const remoteFileNames = process.env[`FTP_FILENAMES_${fileGroup}`].split(',').map(name => name.trim());
    const tempDir = path.join(__dirname, 'temp');
    
    // Créer le dossier 'temp' s'il n'existe pas
    await fs.mkdir(tempDir, { recursive: true });

    const downloadedFiles = [];

    for (const remoteFileName of remoteFileNames) {
      const localFilePath = path.join(tempDir, remoteFileName);
      await client.downloadTo(localFilePath, remoteFileName);
      console.log(`File downloaded successfully to ${localFilePath}`);
      downloadedFiles.push(localFilePath);
    }

    return downloadedFiles;
  } catch (err) {
    console.error('Error downloading from FTP:', err);
    throw err;
  } finally {
    client.close();
  }
}

module.exports = { connectToFTP, downloadFromFTP };
