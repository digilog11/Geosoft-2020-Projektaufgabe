const mongoose = require('mongoose');

const BusrideSchema = new mongoose.Schema({
  stop: {
    type: String,
    required: true
  },
  stopLat: {
    type: Number,
    required: true
  },
  stopLon: {
    type: Number,
    required: true
  },
  departureTime: {
    type: Number,
    required: true
  },
  route: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  tripId: {
    type: String,
    required: true
  },
  isInfectionRisk: {
    type: Boolean,
    required: true
  },
  riskUntil: {
    type: Number,
    required: false
  },
  users: {
    type: Array,
    required: false
  }
});

const Busride = mongoose.model('Busride', BusrideSchema);

module.exports = Busride;
