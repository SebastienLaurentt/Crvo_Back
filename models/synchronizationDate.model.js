const mongoose = require('mongoose');

const synchronizationDateSchema = new mongoose.Schema({
  date: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('SynchronizationDate', synchronizationDateSchema);
