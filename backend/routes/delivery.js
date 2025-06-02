const express = require('express');
const router = express.Router();
const CommunicationLog = require('../models/CommunicationLog');

// POST /api/delivery/receipt
router.post('/receipt', async (req, res) => {
  const { communicationId, status } = req.body;

  if (!communicationId || !status) {
    return res.status(400).json({ message: 'communicationId and status are required' });
  }

  try {
    const log = await CommunicationLog.findById(communicationId);
    if (!log) {
      return res.status(404).json({ message: 'Communication log not found' });
    }

    log.status = status;
    await log.save();

    res.status(200).json({ message: 'Delivery status updated successfully', log });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ message: 'Server error while updating delivery status' });
  }
});

module.exports = router;