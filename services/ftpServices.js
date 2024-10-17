const { Client } = require("basic-ftp");

async function connectToFTP() {
  const client = new Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: process.env.FTP_HOST,
      port: parseInt(process.env.FTP_PORT),
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

module.exports = { connectToFTP };