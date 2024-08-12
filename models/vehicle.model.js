const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema({
  immatriculation: {
    type: String,
    required: true,
    unique: true,
  },
  modele: {
    type: String,
    required: true,
  },
  dateCreation: { 
    type: Date,
    required: true,
  },
  user: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,  
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model("Vehicle", VehicleSchema);