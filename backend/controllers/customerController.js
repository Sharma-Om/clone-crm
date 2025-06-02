//Bussiness Logic...

const Customer = require("../models/Customer");

exports.createCustomer = async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    res.status(201).json({ message: "Customer created", customer: newCustomer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
