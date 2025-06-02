// backend/middleware/requireLogin.js
module.exports = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "You must be logged in" });
  }
  next();
};
