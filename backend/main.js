const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const authRoutes = require("./routes/auth");
require("./services/passport"); 
require("dotenv").config();
require('./utils/deliveryQueue'); // just require to start the loop

const app = express();
const port = 5000;

// Middleware
const cors = require('cors');
app.use(cors({
  origin: "http://localhost:3000", // restrict CORS to frontend origin
  credentials: true,               // enable cookies for cross-origin
}));

app.use(express.json()); // JSON body parser
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "xeno_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
})
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);

// Routes
const fakeCustomerRoutes = require('./routes/fakeCustomers');
app.use('/api/devtools', fakeCustomerRoutes);

const campaignStatsRouter = require('./routes/campaignStats');
app.use('/api/stats', campaignStatsRouter);

const deliveryRoutes = require('./routes/delivery');
app.use('/api/delivery', deliveryRoutes);

const vendorRoutes = require('./routes/vendor');
app.use('/api/vendor', vendorRoutes);

const campaignRoutes = require('./routes/campaign');
app.use('/api/campaign', campaignRoutes);

app.use("/api/customers", require("./routes/customers"));

app.use("/api/orders", require("./routes/orders"));

app.get("/protected", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ message: "You are logged in", user: req.user });
  }
  res.status(401).json({ message: "Unauthorized" });
});

// Default route
app.get('/', (req, res) => {
  res.send("Xeno CRM backend is running good");
});

// Connect MongoDB using Mongoose and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
