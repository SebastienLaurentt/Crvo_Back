const xlsx = require('xlsx');
const { Writable } = require('stream');
const VehicleModel = require("../models/vehicle.model");
const UserModel = require("../models/user.model");
const { connectToFTP } = require("./ftpServices");

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

const processFirstFile = (sheet) => {
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  return data.slice(1).map(row => ({
    client: row[1] ? String(row[1]).trim() : null,
    immatriculation: row[2] ? String(row[2]).trim() : null,
    vin: row[5] ? String(row[5]).trim() : null,
    modele: row[3] ? String(row[3]).trim() : null,
    dateCreation: row[8] ? convertToDate(row[8]) : null,
    mecanique: String(row[16]).trim().toLowerCase() === "oui",
    carrosserie: String(row[17]).trim().toLowerCase() === "oui",
    ct: String(row[18]).trim().toLowerCase() === "oui",
    dsp: String(row[19]).trim().toLowerCase() === "oui",
    jantes: String(row[20]).trim().toLowerCase() === "oui",
  }));
};

const processSecondFile = (sheet) => {
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  return data.slice(1).map(row => ({
    immatriculation: row[1] ? String(row[1]).trim() : null,
    price: row[3] ? String(row[3]) : null,
  }));
};

const importVehicleData = async () => {
  let client;

  try {
    client = await connectToFTP();

    const sheet1 = await readExcelFromFTP(client, "EtatduParcNEW.csv");
    const vehicleData = processFirstFile(sheet1);

    const sheet2 = await readExcelFromFTP(client, "EnCoursFre.csv");
    const priceData = processSecondFile(sheet2);

    const mergedData = vehicleData.map(vehicle => {
      const matchingPrice = priceData.find(price => 
        price.immatriculation && vehicle.immatriculation &&
        price.immatriculation.trim() === vehicle.immatriculation.trim()
      );
      return { ...vehicle, price: matchingPrice?.price || null };
    });

    await VehicleModel.deleteMany({});

    for (const vehicleData of mergedData) {
      if (!vehicleData.dateCreation) {
        console.warn(`Date de création invalide pour le véhicule: ${vehicleData.immatriculation}`);
        continue; 
      }

      try {
        let user = await UserModel.findOne({ username: vehicleData.client });

        if (!user) {
          user = await UserModel.create({
            username: vehicleData.client,
            password: Math.random().toString(36).slice(-8),
            role: 'member',
          });
        }

        const newVehicle = new VehicleModel({
          immatriculation: vehicleData.immatriculation,
          vin: vehicleData.vin,
          modele: vehicleData.modele,
          price: vehicleData.price,
          dateCreation: vehicleData.dateCreation,
          user: user._id,
          mecanique: vehicleData.mecanique,
          carrosserie: vehicleData.carrosserie,
          ct: vehicleData.ct,
          dsp: vehicleData.dsp,
          jantes: vehicleData.jantes,
        });

        await newVehicle.save();
      } catch (error) {
        console.error(`Erreur lors de l'enregistrement du véhicule ${vehicleData.immatriculation}:`, error);
      }
    }

    return { success: true, count: mergedData.length };
  } catch (error) {
    console.error("Erreur lors de l'importation des données:", error);
    return { success: false, error: error.message };
  } finally {
    if (client) {
      client.close();
    }
  }
};

module.exports = { importVehicleData };