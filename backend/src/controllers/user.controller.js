const User = require("../models/User");

async function getAllUsers(_req, res) {
  try {
    const users = await User.find().sort({ joinedAt: -1 });
    return res.json({ users: users.map((u) => u.toJSON()) });
  } catch (err) {
    console.error("getAllUsers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getAllUsers };
