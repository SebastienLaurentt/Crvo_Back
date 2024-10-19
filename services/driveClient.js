const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function uploadToDrive(filePath) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: process.env.GOOGLE_TYPE,
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  const fileName = path.basename(filePath);
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  try {
    console.log(`Searching for existing file: ${fileName}`);
    const res = await drive.files.list({
      q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (res.data.files.length > 0) {
      for (const file of res.data.files) {
        console.log(`Found existing file: ${file.name} (ID: ${file.id})`);
        try {
          await drive.files.delete({ fileId: file.id });
          console.log(`Successfully deleted file: ${file.id}`);
        } catch (deleteError) {
          console.error(`Error deleting file ${file.id}:`, deleteError.message);
        }
      }
    } else {
      console.log('No existing file found with the same name.');
    }

    console.log('Uploading new file...');
    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };

    const media = {
      mimeType: 'text/csv',
      body: fs.createReadStream(filePath),
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    console.log('New file uploaded successfully, ID:', file.data.id);
    return file.data.id;
  } catch (err) {
    console.error('Error in uploadToDrive:', err.message);
    throw err;
  }
}

module.exports = { uploadToDrive };
