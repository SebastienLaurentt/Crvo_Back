const express = require('express');
const VehicleModel = require("../models/vehicle.model");

const router = express.Router();

router.delete('/api/cleanUpVehicle', async (req, res) => {
  try {
    await VehicleModel.deleteMany({});
    res.status(200).json({ message: 'Données supprimées avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;