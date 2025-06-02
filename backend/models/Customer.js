const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name : String,
  email : String,
  age : Number,
  phone : String,
  createdAt : {
    type : Date,
    default : Date.now
  }
});

module.exports = mongoose.model("Customer", customerSchema);
