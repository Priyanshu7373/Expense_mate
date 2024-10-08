const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupName: {
    type: String,
  },

  description: {
    type: String
  },
  code: {
    type: String,
    unique: true
  },
  
  members: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      amountOwed: {
        type: Number,
        default: 0
      },
      amountToReceive: {
        type: Number,
        default: 0
      }
    }
  ],
  expenses: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      description: {
        type: String,
       
      },
      amount: {
        type: Number,
       
      },
      paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
       
      },
      splitAmong: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
         
          }
        }
      ],
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  balances: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      balancesWithOthers: [
        {
          otherUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
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
      ]
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
