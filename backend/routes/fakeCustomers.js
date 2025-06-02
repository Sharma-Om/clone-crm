// these are made to check the full flow of entire campaign delivery (logging → vendor call → delivery receipt → batch update).
const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

router.post('/seed', async (req, res) => {
  try {
    const customers = [
      { name: 'Raju', email: 'raju@example.com', age: 25, location: 'Delhi', gender: 'male' },
      { name: 'Gajanan', email: 'gajanan@example.com', age: 30, location: 'Mumbai', gender: 'male' },
      { name: 'Pooja', email: 'pooja@example.com', age: 20, location: 'Bangalore', gender: 'female' }
    ];

    await Customer.insertMany(customers);
    res.json({ message: 'Dummy customers seeded successfully' });
  } catch (err) {
    console.error('Error seeding customers:', err);
    res.status(500).json({ message: 'Seeding failed' });
  }
});

module.exports = router;
