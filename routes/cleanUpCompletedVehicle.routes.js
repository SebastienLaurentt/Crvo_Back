const express = require('express');
const completedVehiculeModel = require('../models/completedVehicule.model');


const router = express.Router();

router.delete('/api/cleanUpCompletedVehicle', async (req, res) => {
  try {
    await completedVehiculeModel.deleteMany({});
    res.status(200).json({ message: 'Données des véhicules complétés supprimées avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;