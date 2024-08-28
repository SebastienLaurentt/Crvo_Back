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
    unique: true,
  },
  statut: {
    type: String,
    required: true,
  },
  dateCompletion: {
    type: String,
    required: true,
  },
  immat: {  
    type: String,
    required: false,  
  },
  prix: {  
    type: Number,
    required: false,  
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("CompletedVehicle", CompletedVehicleSchema);
