// code based on Brad Traversy, see https://github.com/bradtraversy/node_passport_login

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  isUser: {
    type: Boolean,
    required: true
  },
  isDoctor: {
    type: Boolean,
    required: true
  },
  busrides: {
    type: Array,
    required: false
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
