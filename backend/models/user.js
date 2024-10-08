const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    
  },
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String,
  },
  groups: [
    {
      groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
      },
      groupName: {
        type: String
      },
      amountOwed: {
        type: Number,
        default: 0
      },
      amountLent: {
        type: Number,
        default: 0
      }
    }
  ],
});

const User = mongoose.model('User', userSchema);
module.exports = User;
