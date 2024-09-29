const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const UserModel = require("../models/user.model");
const CompletedVehicleModel = require("../models/completedVehicule.model");
const { importCompletedVehicleData } = require("../services/vehiculeCompletedImportServices");



module.exports.importCompletedVehicles = async (req, res) => {
  try {
    const result = await importCompletedVehicleData();

    if (result.success) {
      return res.status(201).json({ message: "Données importées avec succès", count: result.count });
    } else {
      return res.status(400).json({ message: result.error });
    }
  } catch (err) {
    console.error("Erreur lors de l'importation des données:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.addCompletedVehiclesBatch = async (req, res) => {
  const vehicles = req.body; 

  try {
    const results = [];

    for (const vehicleData of vehicles) {
      const { username, vin, statut, dateCompletion, immatriculation, price } = vehicleData;

      let user = await UserModel.findOne({ username });

      if (!user) {
        const randomPassword = crypto.randomBytes(8).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        user = await UserModel.findOneAndUpdate(
          { username },
          {
            $setOnInsert: {
              username: username,
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

    return res.status(201).json(results);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.addCompletedVehicleWithUser = async (req, res) => {
  const { username, vin, statut, dateCompletion, immatriculation, price } = req.body;

  try {
    let user = await UserModel.findOne({ username });

    if (!user) {
      const randomPassword = crypto.randomBytes(8).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await UserModel.findOneAndUpdate(
        { username },
        {
          $setOnInsert: {
            username: username,
            password: hashedPassword,
            role: "member",
          },
        },
        { new: true, upsert: true }
      );

    }

    const newCompletedVehicle = new CompletedVehicleModel({
      user: user._id,
      vin: vin,
      statut: statut,
      dateCompletion: dateCompletion,
      immatriculation: immatriculation,
      price: price,
    });

    const savedCompletedVehicle = await newCompletedVehicle.save();

    return res
      .status(201)
      .json({ user, completedVehicle: savedCompletedVehicle });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "L'utilisateur ouu le véhicule existe déjà" });
    }
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getAllCompletedVehicles = async (req, res) => {
  try {
    const vehicles = await CompletedVehicleModel.find().populate(
      "user",
      "username"
    );
    return res.status(200).json(vehicles);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

module.exports.getCompletedVehiclesByUser = async (req, res) => {
  try {
    const completedVehicles = await CompletedVehicleModel.find({
      user: req.user._id,
    }).populate("user", "username");
    return res.status(200).json(completedVehicles);
  } catch (err) {
    console.log("Error fetching completed vehicles:", err.message);
    return res.status(400).json({ message: err.message });
  }
};

module.exports.importCompletedVehicles = async (req, res) => {
  try {
    const result = await importCompletedVehicleData();

    if (result.success) {
      return res.status(201).json({ message: "Données importées avec succès", count: result.count });
    } else {
      return res.status(400).json({ message: result.error });
    }
  } catch (err) {
    console.error("Erreur lors de l'importation des données:", err);
    return res.status(500).json({ message: err.message });
  }
};

// Nouvelle fonction pour l'initialisation
module.exports.initializeCompletedVehicleData = async () => {
  try {
    const result = await importCompletedVehicleData();
    if (result.success) {
      console.log(`Données de véhicules complétés initialisées avec succès. ${result.count} véhicules importés.`);
    } else {
      console.error("Erreur lors de l'initialisation des données de véhicules complétés:", result.error);
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation des données de véhicules complétés:", error);
    throw error; // Propager l'erreur pour la gestion dans server.js
  }
};
