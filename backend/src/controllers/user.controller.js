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

async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user: user.toJSON() });
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function updateUserStatus(req, res) {
  try {
    const { status } = req.body;

    if (status !== "Active" && status !== "Inactive") {
      return res
        .status(400)
        .json({ message: "Status must be Active or Inactive" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot change your own status" });
    }

    user.status = status;
    await user.save();
    return res.json({ user: user.toJSON() });
  } catch (err) {
    console.error("updateUserStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getAllUsers, getUserById, updateUserStatus };
