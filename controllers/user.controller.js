require('dotenv').config({ path: './.env' });
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

module.exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role }, 
      process.env.PRIVATE_KEY, 
      { expiresIn: "24h" }
    );
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await userModel.find({ role: { $ne: 'admin' } });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports.updateInfos = async (req, res) => {
  try {
    const { userId } = req.params;
    const { password, downloadUrl } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.passwordChanged = true; 
    }
    if (downloadUrl) {
      user.downloadUrl = downloadUrl;
    }
    await user.save();
    res.status(200).json({ message: "Informations mises à jour avec succès" });
  } catch (error) {
    console.error(error); // Log l'erreur pour mieux la comprendre
    res.status(500).json({ message: "Erreur lors de la mise à jour des informations" });
  }
};



