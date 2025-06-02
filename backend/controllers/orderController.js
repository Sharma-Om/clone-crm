//Bussiness Logic...

const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ message: "Order created", order: newOrder });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
