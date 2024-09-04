require('dotenv').config({ path: './.env' });
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

module.exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe invalide" });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        downloadUrl: user.downloadUrl 
      }, 
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


module.exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, downloadUrl } = req.body;

    if (req.user.role !== 'admin' && req.user.userId !== id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updateData = {};
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
      updateData.passwordChanged = true;
    }
    if (downloadUrl !== undefined) {
      updateData.downloadUrl = downloadUrl;
    }

    const user = await userModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

