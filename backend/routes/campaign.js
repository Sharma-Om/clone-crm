// File: routes/campaign.js

const express = require('express');
const router = express.Router();
const axios = require('axios');
const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const CommunicationLog = require('../models/CommunicationLog');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized. Please log in.' });
}

function buildCondition(field, operator, custVal, value) {
  try {
    if (typeof custVal === 'string') {
      if (operator === '==' || operator === '!=') {
        return `"${custVal}" ${operator} "${value}"`;
      } else {
        return null;
      }
    } else {
      return `${custVal} ${operator} ${value}`;
    }
  } catch (e) {
    return null;
  }
}

function filterMatchingCustomers(customers, segments) {
  return customers.filter((customer) => {
    try {
      const condition = segments
        .map((segment) =>
          segment.rules
            .map(({ field, operator, value }) => {
              const custVal = field === 'totalSpend' ? customer['spend'] : customer[field];
              if (custVal === undefined) return null;
              return buildCondition(field, operator, custVal, value);
            })
            .filter(Boolean)
            .join(' && ')
        )
        .filter(Boolean)
        .join(' || ');

      if (!condition || !condition.trim()) return false;
      return eval(condition);
    } catch (e) {
      console.error('Eval failed for customer:', customer.name, e);
      return false;
    }
  });
}

router.post('/save', ensureAuthenticated, async (req, res) => {
  try {
    const { name, segments } = req.body;
    if (!name || !segments || !Array.isArray(segments)) {
      return res.status(400).json({ message: 'Invalid campaign data' });
    }

    const campaign = new Campaign({ name, segments });
    await campaign.save();

    const [allCustomers, allOrders] = await Promise.all([
      Customer.find({}),
      Order.find({}),
    ]);

    const spendMap = allOrders.reduce((acc, order) => {
      const custId = order.customerId?.toString();
      if (!custId) return acc;
      acc[custId] = (acc[custId] || 0) + (order.amount || 0);
      return acc;
    }, {});

    const enrichedCustomers = allCustomers.map((cust) => ({
      ...cust.toObject(),
      spend: spendMap[cust._id.toString()] || 0,
    }));

    const matchingCustomers = filterMatchingCustomers(enrichedCustomers, segments);

    const { addToQueue } = require('../utils/deliveryQueue');

    for (let cust of matchingCustomers) {
      const log = new CommunicationLog({
        campaignId: campaign._id,
        customerId: cust._id,
        status: 'PENDING',
        message: `Hi ${cust.name}, here's 10% off on your next order!`,
      });

      await log.save();

      const status = Math.random() < 0.9 ? 'SENT' : 'FAILED';
      addToQueue({ communicationId: log._id, status });

      try {
        await axios.post('http://localhost:5000/api/delivery/receipt', {
          communicationId: log._id,
          status,
        });
      } catch (err) {
        console.error(`Failed to simulate delivery receipt for ${cust.name}:`, err.message);
      }
    }

    console.log(`Campaign "${campaign.name}" saved. Simulated delivery to ${matchingCustomers.length} customers.`);

    res.status(201).json({ message: 'Campaign saved successfully', campaign });
  } catch (err) {
    console.error('Error saving campaign:', err);
    res.status(500).json({ message: 'Server error while saving campaign' });
  }
});

router.get('/list', ensureAuthenticated, async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Failed to fetch campaigns' });
  }
});

router.delete('/clear', ensureAuthenticated, async (req, res) => {
  try {
    await Campaign.deleteMany({});
    res.status(200).json({ message: 'All campaigns cleared successfully' });
  } catch (error) {
    console.error('Error clearing campaigns:', error);
    res.status(500).json({ message: 'Failed to clear campaigns' });
  }
});

router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign by ID:', error);
    res.status(500).json({ message: 'Server error fetching campaign' });
  }
});

router.post('/preview-audience', ensureAuthenticated, async (req, res) => {
  try {
    const { segments } = req.body;
    if (!segments || !Array.isArray(segments)) {
      return res.status(400).json({ message: 'Invalid segment rules' });
    }

    const [allCustomers, allOrders] = await Promise.all([
      Customer.find({}),
      Order.find({}),
    ]);

    const spendMap = allOrders.reduce((acc, order) => {
      const custId = order.customerId?.toString();
      if (!custId) return acc;
      acc[custId] = (acc[custId] || 0) + (order.amount || 0);
      return acc;
    }, {});

    const enrichedCustomers = allCustomers.map((cust) => ({
      ...cust.toObject(),
      spend: spendMap[cust._id.toString()] || 0,
    }));

    const matchingCustomers = filterMatchingCustomers(enrichedCustomers, segments);

    res.json({ audienceSize: matchingCustomers.length });
  } catch (err) {
    console.error('Error previewing audience:', err);
    res.status(500).json({ message: 'Error while previewing audience' });
  }
});

module.exports = router;
