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
    required: true,  
  },
  prix: {  
    type: Number,
    required: true,  
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("CompletedVehicle", CompletedVehicleSchema);
