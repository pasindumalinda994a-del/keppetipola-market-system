const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUserStatus,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminOnly");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id/status", updateUserStatus);

module.exports = router;
