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
  },
  mecanique: {
    type: Boolean,
    default: false,
  },
  carrosserie: {
    type: Boolean,
    default: false,
  },
  ct: {
    type: Boolean,
    default: false,
  },
  dsp: {
    type: Boolean,
    default: false,
  },
  jantes: {
    type: Boolean,
    default: false,
  },
  esthetique: {  // Champ ajouté
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model("Vehicle", VehicleSchema);
