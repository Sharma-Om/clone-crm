const mongoose = require('mongoose');

const CommunicationLogSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  customerId: { type: String, required: true },  // Assuming customerId is a string or change accordingly
  message: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], required: true },  // Added PENDING here
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CommunicationLog', CommunicationLogSchema);
