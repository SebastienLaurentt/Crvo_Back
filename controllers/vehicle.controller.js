const VehicleModel = require("../models/vehicle.model");
const { createSynchronizationDate } = require("./synchronization.controller");
const {
  synchronizeVehiclesFromFTP,
} = require("../services/vehicleSyncService");

module.exports.runVehicleSynchronization = async () => {
  try {
    const result = await synchronizeVehiclesFromFTP();
    if (result.success) {
      console.log(
        `Synchronisation des véhicules réussie. Nombre total de véhicules : ${result.count}`
      );
    } else {
      console.error(
        "Erreur lors de la synchronisation des véhicules:",
        result.error
      );
    }
  } catch (error) {
    console.error("Erreur lors de la synchronisation des véhicules:", error);
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
