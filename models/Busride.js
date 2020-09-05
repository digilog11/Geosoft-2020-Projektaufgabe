const mongoose = require('mongoose');

const BusrideSchema = new mongoose.Schema({
  start: {
    type: String,
    required: true
  },
  line: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  isInfectionRisk: {
    type: Boolean,
    required: true
  },
  users: {
    type: Array,
    required: false
  }
});

const Busride = mongoose.model('Busride', BusrideSchema);

module.exports = Busride;
