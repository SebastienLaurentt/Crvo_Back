const mongoose = require('mongoose');
const { addHours } = require('date-fns');

const synchronizationDateSchema = new mongoose.Schema({
  date: { 
    type: Date, 
    default: () => {
      const now = new Date();
      const parisTime = addHours(now, 2); 
      return parisTime;
    }
  }
});

module.exports = mongoose.model('SynchronizationDate', synchronizationDateSchema);
