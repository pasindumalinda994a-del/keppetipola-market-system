const express = require("express");
const {
  register,
  login,
  me,
  updateMe,
  changePassword,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.patch("/me", protect, updateMe);
router.patch("/me/password", protect, changePassword);

module.exports = router;
