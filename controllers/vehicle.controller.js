const VehicleModel = require("../models/vehicle.model");
const UserModel = require("../models/user.model");

module.exports.addVehicleWithUser = async (req, res) => {
  const { username, password, immatriculation, modele, joursDepuisReception } = req.body;

  try {
    let user = await UserModel.findOne({ username });

    if (!user) {
      user = new UserModel({
        username: username,
        password: password,
        role: 'member' 
      });

      user = await user.save();
    }

    const newVehicle = new VehicleModel({
      immatriculation: immatriculation,
      modele: modele,
      joursDepuisReception: joursDepuisReception,
      user: user._id  
    });

    const savedVehicle = await newVehicle.save();

    return res.status(201).json({ user, vehicle: savedVehicle });
  } catch (err) {
    return res.status(400).json({ message: err.message });
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