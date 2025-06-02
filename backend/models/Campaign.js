const mongoose = require('mongoose');

// Rule schema for individual conditions (e.g., age > 30)
const RuleSchema = new mongoose.Schema({
  field: String,           
  operator: String,        
  value: mongoose.Schema.Types.Mixed,  
});

// Segment schema to group rules
const SegmentSchema = new mongoose.Schema({
  name: String,    
  rules: [RuleSchema],
});

// Main Campaign schema
const CampaignSchema = new mongoose.Schema({
  name: String,            
  segments: [SegmentSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Campaign', CampaignSchema);
