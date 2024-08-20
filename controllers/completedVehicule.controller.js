const bcrypt = require("bcryptjs");
const UserModel = require("../models/user.model");
const CompletedVehicleModel = require("../models/completedVehicule.model");

module.exports.addCompletedVehicleWithUser = async (req, res) => {
  const { username, password, vin, statut, dateCompletion } = req.body;

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
            role: "member",
          },
        },
        { new: true, upsert: true }
      );
    }

    const newCompletedVehicle = new CompletedVehicleModel({
      user: user._id,
      vin: vin,
      statut: statut,
      dateCompletion: new Date(dateCompletion),
    });

    const savedCompletedVehicle = await newCompletedVehicle.save();

    return res
      .status(201)
      .json({ user, completedVehicle: savedCompletedVehicle });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "L'utilisateur ou le véhicule existe déjà" });
    }
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getAllCompletedVehicles = async (req, res) => {
  try {
    const vehicles = await CompletedVehicleModel.find().populate(
      "user",
      "username"
    );
    return res.status(200).json(vehicles);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

module.exports.getCompletedVehiclesByUser = async (req, res) => {
  try {
    const completedVehicles = await CompletedVehicleModel.find({
      user: req.user._id,
    }).populate("user", "username");
    return res.status(200).json(completedVehicles);
  } catch (err) {
    console.log("Error fetching completed vehicles:", err.message);
    return res.status(400).json({ message: err.message });
  }
};
