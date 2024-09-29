const xlsx = require('xlsx');
const UserModel = require("../models/user.model");
const CompletedVehicleModel = require("../models/completedVehicule.model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { connectToFTP } = require("./ftpServices");
const { Writable } = require('stream');

const excelSerialToDate = (serial) => {
  const excelStartDate = new Date(1900, 0, 1);
  const daysOffset = serial - 2;
  const resultDate = new Date(
    excelStartDate.getTime() + daysOffset * 24 * 60 * 60 * 1000
  );

  const day = String(resultDate.getDate()).padStart(2, "0");
  const month = String(resultDate.getMonth() + 1).padStart(2, "0");
  const year = resultDate.getFullYear();

  return `${day}/${month}/${year}`;
};

const isValidCompletedVehicleFile = (sheetData) => {
  const headers = sheetData[0]
    .filter((header) => header !== null && String(header).trim() !== "")
    .map((header) => String(header).trim());

  const requiredHeaders = ["Client", "VIN", "Statut", "Date"];

  const missingHeaders = requiredHeaders.filter(
    (header) => !headers.includes(header)
  );

  if (missingHeaders.length > 0) {
    console.error("En-têtes manquants:", missingHeaders);
    return false;
  }

  return true;
};

const isValidSupplementaryFile = (sheetData) => {
  const headers = sheetData[0]
    .filter((header) => header !== null && String(header).trim() !== "")
    .map((header) => String(header).trim());

  const requiredHeaders = ["VIN", "IMMAT", "FRE Moyens"];

  const missingHeaders = requiredHeaders.filter(
    (header) => !headers.includes(header)
  );

  if (missingHeaders.length > 0) {
    console.error("En-têtes manquants du fichier complémentaire:", missingHeaders);
    return false;
  }

  return true;
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
    client: row[0] ? String(row[0]).trim() : null,
    vin: row[2] ? String(row[2]).trim() : null,
    statut: row[4] ? String(row[4]).trim() : null,
    dateCompletion: row[5] ? excelSerialToDate(Number(row[5])) : null,
  }));
};

const processSecondFile = (sheet) => {
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  return data.slice(1).map(row => ({
    immatriculation: row[1] ? String(row[1]).trim() : null,
    vin: row[2] ? String(row[2]).trim() : null,
    price: row[4] ? Number(row[4]) : null,
  }));
};

const importCompletedVehicleData = async () => {
  let client;

  try {
    client = await connectToFTP();

    const sheet1 = await readExcelFromFTP(client, "AnalyseTempsBrutsNEW.csv");
    const sheet2 = await readExcelFromFTP(client, "data.xlsx");

    if (!isValidCompletedVehicleFile(xlsx.utils.sheet_to_json(sheet1, { header: 1 }))) {
      throw new Error("Fichier 1 non valide");
    }

    if (!isValidSupplementaryFile(xlsx.utils.sheet_to_json(sheet2, { header: 1 }))) {
      throw new Error("Fichier 2 non valide");
    }

    const dataFile1 = processFirstFile(sheet1);
    const dataFile2 = processSecondFile(sheet2);

    const filteredFile2Data = dataFile2.filter((supplement) =>
      dataFile1.some((vehicle) => vehicle.vin === supplement.vin)
    );

    const filteredFile1Data = dataFile1.filter(
      (vehicle) => vehicle.statut === "Sortie Usine"
    );

    const mergedData = filteredFile1Data.map((vehicle) => {
      const matchingSupplement = filteredFile2Data.find(
        (supplement) => supplement.vin === vehicle.vin
      );
      return {
        ...vehicle,
        immatriculation: matchingSupplement?.immatriculation || null,
        price: matchingSupplement?.price || null,
      };
    });

    await CompletedVehicleModel.deleteMany({});

    const results = [];

    for (const vehicleData of mergedData) {
      const { client, vin, statut, dateCompletion, immatriculation, price } = vehicleData;

      let user = await UserModel.findOne({ username: client });

      if (!user) {
        const randomPassword = crypto.randomBytes(8).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        user = await UserModel.findOneAndUpdate(
          { username: client },
          {
            $setOnInsert: {
              username: client,
              password: hashedPassword,
              role: "member",
            },
          },
          { new: true, upsert: true }
        );
      }

      const newCompletedVehicle = new CompletedVehicleModel({
        user: user._id,
        vin,
        statut,
        dateCompletion,
        immatriculation,
        price,
      });

      const savedCompletedVehicle = await newCompletedVehicle.save();
      results.push({ user, completedVehicle: savedCompletedVehicle });
    }

    return { success: true, count: results.length };
  } catch (error) {
    console.error("Erreur lors de l'importation des données:", error);
    return { success: false, error: error.message };
  } finally {
    if (client) {
      client.close();
    }
  }
};

module.exports = { importCompletedVehicleData };