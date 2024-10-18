const xlsx = require('xlsx');
const { Writable } = require('stream');
const VehicleModel = require("../models/vehicle.model");
const UserModel = require("../models/user.model");
const { connectToFTP } = require("./ftpServices");
const { statusCategories } = require('../data/statusCategories');
const SynchronizationDateModel = require("../models/synchronizationDate.model");

const excelDateToJSDate = (serial) => {
  if (!serial || isNaN(serial)) {
    console.warn(`Date invalide reçue: ${serial}`);
    return null;
  }
  const epoch = new Date(Date.UTC(1899, 11, 30));
  const days = Math.floor(serial);
  const milliseconds = Math.round((serial - days) * 86400000);

  const baseDate = new Date(epoch.getTime() + days * 86400000 + milliseconds);
  const day = baseDate.getUTCDate();
  const month = baseDate.getUTCMonth();
  const year = baseDate.getUTCFullYear();

  const correctedDate = new Date(Date.UTC(year, day - 1, month + 1));
  return correctedDate;
};

const convertToDate = (value) => {
  if (typeof value === "number") {
    return excelDateToJSDate(value);
  }

  const dateString = String(value).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split("/");
    return new Date(`${year}-${month}-${day}`);
  }

  return null;
};

const readExcelFromFTP = async (client, filename) => {
  const chunks = [];
  const memoryStream = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(chunk);
      callback();
    }
  });

  await client.downloadTo(memoryStream, filename);
  const buffer = Buffer.concat(chunks);
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  return workbook.Sheets[workbook.SheetNames[0]];
};

const processFile = (sheet) => {
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  return data.slice(1).map(row => ({
    client: row[1] ? String(row[1]).trim() : null,
    immatriculation: row[2] ? String(row[2]).trim() : null,
    modele: row[3] ? String(row[3]).trim() : null,
    vin: row[5] ? String(row[5]).trim() : null,
    dateCreation: row[8] ? convertToDate(row[8]) : null,
    status: row[10] ? String(row[10]).trim() : null,
    pieceDisponible: row[22] ? String(row[22]).trim() : null,
    statusCategory: categorizeStatus(
      row[10] ? String(row[10]).trim() : null,
      row[22] ? String(row[22]).trim() : null
    ),
    mecanique: String(row[16]).trim().toLowerCase() === "oui",
    carrosserie: String(row[17]).trim().toLowerCase() === "oui",
    ct: String(row[18]).trim().toLowerCase() === "oui",
    dsp: String(row[19]).trim().toLowerCase() === "oui",
    jantes: String(row[20]).trim().toLowerCase() === "oui",
  }));
};

const categorizeStatus = (status, pieceDisponible) => {
  if (status === "Stocké sur parc d'attente travaux") {
    return pieceDisponible === "PIECE DISPONIBLE" ? "Production" : "Magasin";
  }
  return statusCategories[status] || 'Inconnu';
};

const importVehicleData = async () => {
  let client;

  try {
    client = await connectToFTP();

    const sheet = await readExcelFromFTP(client, "Etat-du-parc-Heure.csv");
    const vehiclesData = processFile(sheet);

    await VehicleModel.deleteMany({});

    let importedCount = 0;

    for (const vehicle of vehiclesData) {
      if (!vehicle.dateCreation) {
        console.warn(`Date de création invalide pour le véhicule: ${vehicle.immatriculation}`);
        continue; 
      }

      try {
        let user = await UserModel.findOne({ username: vehicle.client });

        if (!user) {
          user = await UserModel.create({
            username: vehicle.client,
            password: Math.random().toString(36).slice(-8),
            role: 'member',
          });
        }

        const newVehicle = new VehicleModel({
          immatriculation: vehicle.immatriculation,
          vin: vehicle.vin,
          modele: vehicle.modele,
          dateCreation: vehicle.dateCreation,
          user: user._id,
          mecanique: vehicle.mecanique,
          carrosserie: vehicle.carrosserie,
          ct: vehicle.ct,
          dsp: vehicle.dsp,
          jantes: vehicle.jantes,
          statusCategory: vehicle.statusCategory,
        });

        await newVehicle.save();
        importedCount++;
      } catch (error) {
        console.error(`Erreur lors de l'enregistrement du véhicule ${vehicle.immatriculation}:`, error);
      }
    }

    // Create a new synchronization date record
    const newSynchronizationDate = new SynchronizationDateModel();
    await newSynchronizationDate.save();

    return { success: true, count: importedCount };
  } catch (error) {
    console.error("Erreur lors de la synchronisation des données:", error);
    return { success: false, error: error.message };
  } finally {
    if (client) {
      client.close();
    }
  }
};

module.exports = { importVehicleData };
