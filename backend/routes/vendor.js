const express = require('express');
const router = express.Router();
const axios = require('axios');
const CommunicationLog = require('../models/CommunicationLog');

// POST /api/vendor/sendCampaignMessages
router.post('/sendCampaignMessages', async (req, res) => {
  const { campaignId, customers } = req.body;

  if (!campaignId || !Array.isArray(customers)) {
    return res.status(400).json({ message: 'Invalid request data' });
  }

  // Simulate sending messages to each customer
  for (const customer of customers) {
    const success = Math.random() < 0.9; // ~90% success rate

    // Create a communication log entry
    const log = new CommunicationLog({
      campaignId,
      customerId: customer._id,
      status: success ? 'SENT' : 'FAILED',
      message: `Hi ${customer.name}, here’s 10% off on your next order!`,
    });
    await log.save();

    // Call delivery receipt API to update status
    try {
      await axios.post('http://localhost:5000/api/delivery/receipt', {
        logId: log._id,
        status: log.status,
      });
    } catch (error) {
      console.error(`Failed to call delivery receipt API for log ${log._id}:`, error.message);
    }
  }

  res.status(200).json({ message: `Sent messages to ${customers.length} customers.` });
});

module.exports = router;
