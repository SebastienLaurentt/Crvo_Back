const fs = require('fs').promises;
const { downloadFromFTP } = require('./ftpServices');
const { uploadToDrive } = require('./driveClient');
const vehicleController = require("../controllers/vehicle.controller");

async function syncFiles(fileGroup) {
  console.log(`🔄 Starting sync task for ${fileGroup}...`);
  const startTime = new Date();
  let localFilePaths = [];

  try {
    console.log(`📥 Attempting to download ${fileGroup} files from FTP...`);
    localFilePaths = await downloadFromFTP(fileGroup);
    console.log(`✅ Files downloaded from FTP: ${localFilePaths.join(', ')}`);

    console.log('📤 Attempting to upload files to Google Drive...');
    for (const localFilePath of localFilePaths) {
      const fileId = await uploadToDrive(localFilePath);
      console.log(`✅ File uploaded to Google Drive with ID: ${fileId}`);
    }

    console.log('🗑️ Deleting local copies...');
    for (const localFilePath of localFilePaths) {
      await fs.unlink(localFilePath);
    }
    console.log('✅ Local copies deleted');

    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    console.log(`✅ Sync task for ${fileGroup} completed successfully in ${duration} seconds.`);
  } catch (error) {
    console.error(`❌ Sync task for ${fileGroup} failed:`, error);
  } finally {
    for (const localFilePath of localFilePaths) {
      try {
        await fs.access(localFilePath);
        await fs.unlink(localFilePath);
        console.log(`✅ Local copy deleted in finally block: ${localFilePath}`);
      } catch (unlinkError) {
        console.log(`ℹ️ Local copy already deleted or does not exist: ${localFilePath}`);
      }
    }
  }
}

function syncRegularFiles() {
  console.log('⏰ Cron task for REGULAR files triggered at:', new Date().toLocaleString());
  const currentHour = new Date().getHours();
  
  if (currentHour >= 6 && currentHour < 23) {
    console.log('🟢 Within sync hours, starting sync for REGULAR files now');
    syncFiles('REGULAR').catch((error) => {
      console.error('❌ Scheduled sync for REGULAR files failed:', error);
    });
  } else {
    console.log('🔴 Outside of sync hours, skipping task for REGULAR files');
  }
}

function syncNightlyFiles() {
  console.log('⏰ Cron task for NIGHTLY files triggered at:', new Date().toLocaleString());
  console.log('🟢 Starting sync for NIGHTLY files now');
  syncFiles('NIGHTLY').catch((error) => {
    console.error('❌ Scheduled sync for NIGHTLY files failed:', error);
  });
}

async function updateVehicleData() {
  console.log("Lancement de la synchronisation des véhicules");
  try {
    await vehicleController.runVehicleSynchronization();
    console.log("Synchronisation des véhicules terminée");
  } catch (err) {
    console.error("Erreur lors de la synchronisation des véhicules:", err);
  }
}

module.exports = { syncRegularFiles, syncNightlyFiles, updateVehicleData };
