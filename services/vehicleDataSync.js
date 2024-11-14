const xlsx = require("xlsx");
const { Writable } = require("stream");
const VehicleModel = require("../models/vehicle.model");
const UserModel = require("../models/user.model");
const { connectToFTP } = require("./ftpClient");
const { statusCategories } = require("../data/statusCategories");
const SynchronizationDateModel = require("../models/synchronizationDate.model");
const {
  createSynchronizationDate,
} = require("../controllers/synchronization.controller");
const mongoose = require("mongoose");

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

const downloadExcelFromFTP = async (client, filename) => {
  const chunks = [];
  const memoryStream = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(chunk);
      callback();
    },
  });

  await client.downloadTo(memoryStream, filename);
  const buffer = Buffer.concat(chunks);
  const workbook = xlsx.read(buffer, { 
    type: "buffer",
    raw: true,
    cellDates: true,
    cellNF: false,
    cellText: false
  });
  return workbook.Sheets[workbook.SheetNames[0]];
};

const parseExcelData = (sheet) => {
  const data = xlsx.utils.sheet_to_json(sheet, { 
    header: 1,
    raw: true,
    defval: null
  });
  
  return data.slice(1).map((row) => {
    const rawValue = row[12];
    let daySinceStatut = 0;
    if (rawValue) {
      const strValue = String(rawValue).replace(',', '.');
      daySinceStatut = parseFloat(strValue);
    }
    
    const mecanique = String(row[16]).trim().toLowerCase() === "oui";
    const carrosserie = String(row[17]).trim().toLowerCase() === "oui" || String(row[21]).trim().toLowerCase() === "oui";
    const ct = String(row[18]).trim().toLowerCase() === "oui";
    const dsp = String(row[19]).trim().toLowerCase() === "oui";
    const jantes = String(row[20]).trim().toLowerCase() === "oui";

    return {
      client: row[1] ? String(row[1]).trim() : null,
      immatriculation: row[2] ? String(row[2]).trim() : null,
      modele: row[3] ? String(row[3]).trim() : null,
      vin: row[5] ? String(row[5]).trim() : null,
      dateCreation: row[8] ? convertToDate(row[8]) : null,
      status: row[10] ? String(row[10]).trim() : null,

      statusCategory: categorizeStatus(
        row[10] ? String(row[10]).trim() : null,
        row[22] ? String(row[22]).trim() : null
      ),
      daySinceStatut: isNaN(daySinceStatut) ? 0 : daySinceStatut,
      mecanique,
      carrosserie,
      ct,
      dsp,
      jantes,
      esthetique: !mecanique && !carrosserie && !ct && !dsp && !jantes,
      pieceDisponible: row[22] ? String(row[22]).trim() : null,
    };
  });
};

const categorizeStatus = (status, pieceDisponible) => {
  if (status === "Stocké sur parc d'attente travaux") {
    return pieceDisponible === "PIECE DISPONIBLE" ? "Production" : "Magasin";
  }
  return statusCategories[status] || "Inconnu";
};

const updateVehiclesInDatabase = async (vehiclesData) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {

      await VehicleModel.deleteMany({}, { session });

      const operations = [];
      const userCache = new Map();

      for (const vehicle of vehiclesData) {
        if (!vehicle.dateCreation) {
          console.warn(
            `Date de création invalide pour le véhicule: ${vehicle.immatriculation}`
          );
          continue;
        }

        let user = userCache.get(vehicle.client);
        
        if (!user) {
          user = await UserModel.findOne({ username: vehicle.client }).session(session);
          if (!user) {
            user = await UserModel.create([{
              username: vehicle.client,
              password: Math.random().toString(36).slice(-8),
              role: "member",
            }], { session });
            user = user[0];
          }
          userCache.set(vehicle.client, user);
        }

        operations.push({
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
          esthetique: vehicle.esthetique,
          statusCategory: vehicle.statusCategory,
          daySinceStatut: vehicle.daySinceStatut,
        });
      }

      await VehicleModel.insertMany(operations, { session });
    });

    const finalVehicleCount = await VehicleModel.countDocuments();

    return {
      success: true,
      count: finalVehicleCount,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour des véhicules:", error);
    return { success: false, error: error.message };
  } finally {
    await session.endSession();
  }
};

const synchronizeVehiclesFromFTP = async () => {
  let ftpClient;

  try {
    ftpClient = await connectToFTP();

    const sheet = await downloadExcelFromFTP(
      ftpClient,
      "Etat-du-parc-Heure.csv"
    );
    const vehiclesData = parseExcelData(sheet);

    const syncResult = await updateVehiclesInDatabase(vehiclesData);

    if (syncResult.success) {
      await SynchronizationDateModel.deleteMany({});
      await createSynchronizationDate();
    }

    return syncResult;
  } catch (error) {
    console.error("Erreur lors de la synchronisation des véhicules:", error);
    return { success: false, error: error.message };
  } finally {
    if (ftpClient) {
      ftpClient.close();
    }
  }
};

module.exports = { synchronizeVehiclesFromFTP };
