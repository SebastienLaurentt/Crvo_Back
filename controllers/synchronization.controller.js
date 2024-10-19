const SynchronizationDate = require("../models/synchronizationDate.model");

module.exports.createSynchronizationDate = async () => {
  try {
    const newDate = new SynchronizationDate();
    await newDate.save();
    console.log("Nouvelle date de synchronisation créée:", newDate.date);
    return newDate;
  } catch (error) {
    console.error(
      "Erreur lors de la création de la date de synchronisation:",
      error
    );
    throw error;
  }
};

module.exports.getLatestSynchronizationDate = async (req, res) => {
  try {
    const latestDate = await SynchronizationDate.findOne().sort({ date: -1 });
    res.json(latestDate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
