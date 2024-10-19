const VehicleModel = require("../models/vehicle.model");
const { importVehicleData } = require("../services/vehicleImportServices");
const { createSynchronizationDate } = require("./synchronization.controller");

module.exports.initializeVehicleData = async () => {
  try {
    const result = await importVehicleData();
    if (result.success) {
      console.log(
        `Données de véhicules synchronisées avec succès. ${result.updated} véhicules mis à jour, ${result.added} ajoutés, ${result.deleted} supprimés.`
      );
      await createSynchronizationDate();
    } else {
      console.error(
        "Erreur lors de la synchronisation des données de véhicules:",
        result.error
      );
    }
  } catch (error) {
    console.error(
      "Erreur lors de la synchronisation des données de véhicules:",
      error
    );
    throw error;
  }
};

module.exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await VehicleModel.find().populate("user", "username");
    return res.status(200).json(vehicles);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

module.exports.getVehiclesByUser = async (req, res) => {
  try {
    const vehicles = await VehicleModel.find({ user: req.user._id }).populate(
      "user",
      "username"
    );
    return res.status(200).json(vehicles);
  } catch (err) {
    console.log("Error fetching vehicles:", err.message);
    return res.status(400).json({ message: err.message });
  }
};


