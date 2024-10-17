const SynchronizationDate = require('../models/synchronizationDate.model');

exports.createSynchronizationDate = async () => {
  try {
    const newDate = new SynchronizationDate();
    console.log('Nouvelle date de synchronisation créée:', newDate.date);
  } catch (error) {
    console.error('Erreur lors de la création de la date de synchronisation:', error);
    throw error;
  }
};

exports.getLatestSynchronizationDate = async (req, res) => {
  try {
    const latestDate = await SynchronizationDate.findOne().sort({ date: -1 });
    res.json(latestDate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
