// routes/campaignStats.js
const express = require('express');
const router = express.Router();
const CommunicationLog = require('../models/CommunicationLog');

// GET /api/stats/:id
router.get('/:id', async (req, res) => {
  const campaignId = req.params.id;

  try {
    const total = await CommunicationLog.countDocuments({ campaignId });
    const sent = await CommunicationLog.countDocuments({ campaignId, status: 'SENT' });
    const failed = await CommunicationLog.countDocuments({ campaignId, status: 'FAILED' });

    res.json({ total, sent, failed });
  } catch (err) {
    console.error('Error fetching campaign stats:', err);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

module.exports = router;