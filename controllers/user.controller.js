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

    // Validation des entrées
    if (!userId) {
      return res.status(400).json({ message: "L'ID de l'utilisateur est requis" });
    }

    // Rechercher l'utilisateur par ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Mise à jour du mot de passe, si fourni
    if (password && password.length > 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
      user.passwordChanged = true; // Marquer que le mot de passe a été modifié
    }

    // Mise à jour du downloadUrl, si fourni
    if (downloadUrl && downloadUrl.length > 0) {
      user.downloadUrl = downloadUrl;
    }

    // Sauvegarder les informations mises à jour de l'utilisateur
    await user.save();

    return res.status(200).json({ message: "Informations mises à jour avec succès", user });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des informations:", error);
    return res.status(500).json({ message: "Erreur lors de la mise à jour des informations" });
  }
};



