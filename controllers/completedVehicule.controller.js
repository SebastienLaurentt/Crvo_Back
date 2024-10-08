const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const UserModel = require("../models/user.model");
const CompletedVehicleModel = require("../models/completedVehicule.model");


module.exports.addCompletedVehiclesBatch = async (req, res) => {
  const vehicles = req.body;

  try {
    const results = [];

    for (const vehicleData of vehicles) {
      const { username, vin, statut, dateCompletion, immatriculation, price } =
        vehicleData;

      let user = await UserModel.findOne({ username });

      if (!user) {
        const randomPassword = crypto.randomBytes(8).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

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
        vin,
        statut,
        dateCompletion,
        immatriculation,
        price,
      });

      const savedCompletedVehicle = await newCompletedVehicle.save();
      results.push({ user, completedVehicle: savedCompletedVehicle });
    }

    return res.status(201).json(results);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.addCompletedVehicleWithUser = async (req, res) => {
  const { username, vin, statut, dateCompletion, immatriculation, price } =
    req.body;

  try {
    let user = await UserModel.findOne({ username });

    if (!user) {
      const randomPassword = crypto.randomBytes(8).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

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
      dateCompletion: dateCompletion,
      immatriculation: immatriculation,
      price: price,
    });

    const savedCompletedVehicle = await newCompletedVehicle.save();

    return res
      .status(201)
      .json({ user, completedVehicle: savedCompletedVehicle });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "L'utilisateur ouu le véhicule existe déjà" });
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
