const bcrypt = require('bcryptjs');
const UserModel = require("../models/user.model");
const CompletedVehicleModel = require('../models/completedVehicule.model');

module.exports.addCompletedVehicleWithUser = async (req, res) => {
  const { username, password, immatriculation, statut, dateCompletion } = req.body;

  try {
    // Rechercher l'utilisateur par nom d'utilisateur
    let user = await UserModel.findOne({ username });

    // Si l'utilisateur n'existe pas, on le crée
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10); // Hachage du mot de passe
      
      // Mise à jour ou insertion de l'utilisateur
      user = await UserModel.findOneAndUpdate(
        { username },
        {
          $setOnInsert: {
            username: username,
            password: hashedPassword,
            role: 'member'
          }
        },
        { new: true, upsert: true } 
      );
    }

    const newCompletedVehicle = new CompletedVehicleModel({
      user: user._id,
      immatriculation: immatriculation,
      statut: statut,
      dateCompletion: new Date(dateCompletion),
    });

    const savedCompletedVehicle = await newCompletedVehicle.save();

    return res.status(201).json({ user, completedVehicle: savedCompletedVehicle });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "L'utilisateur ou le véhicule existe déjà" });
    }
    return res.status(500).json({ message: err.message });
  }
};
