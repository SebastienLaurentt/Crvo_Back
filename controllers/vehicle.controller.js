const VehicleModel = require("../models/vehicle.model");
const UserModel = require("../models/user.model");
const bcrypt = require("bcryptjs");

module.exports.addVehicleWithUser = async (req, res) => {
  const { username, password, immatriculation, modele, vin, dateCreation, mecanique, carrosserie, ct, dsp, jantes } = req.body;

  try {
    let user = await UserModel.findOne({ username });

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      
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

    const esthetique = !(mecanique || carrosserie || ct || dsp || jantes);

    const newVehicle = new VehicleModel({
      immatriculation: immatriculation,
      modele: modele,
      vin: vin,  
      dateCreation: new Date(dateCreation), 
      user: user._id,
      mecanique: mecanique,
      carrosserie: carrosserie,
      ct: ct,
      dsp: dsp,
      jantes: jantes,
      esthetique: esthetique,  
    });

    const savedVehicle = await newVehicle.save();

    return res.status(201).json({ user, vehicle: savedVehicle });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "L'utilisateur existe déjà" });
    }
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await VehicleModel.find().populate('user', 'username');  
    return res.status(200).json(vehicles);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

module.exports.getVehiclesByUser = async (req, res) => {
  try {
    const vehicles = await VehicleModel.find({ user: req.user._id }).populate('user', 'username');
    return res.status(200).json(vehicles);
  } catch (err) {
    console.log('Error fetching vehicles:', err.message);
    return res.status(400).json({ message: err.message });
  }
};
