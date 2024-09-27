const mongoose = require("mongoose");

const CompletedVehicleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  vin: {
    type: String,
    required: true,
  },
  statut: {
    type: String,
    required: true,
  },
  dateCompletion: {
    type: String,
    required: true,
  },
  immatriculation: {  
    type: String,
    required: false,  
  },
  price: {  
    type: Number,
    required: false,  
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("CompletedVehicle", CompletedVehicleSchema);
