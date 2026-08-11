const express = require("express");
const {
  getActiveVegetables,
  getAllVegetables,
  createVegetable,
  updateVegetable,
} = require("../controllers/vegetable.controller");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminOnly");

const router = express.Router();

router.get("/", getActiveVegetables);
router.get("/all", protect, adminOnly, getAllVegetables);
router.post("/", protect, adminOnly, createVegetable);
router.patch("/:id", protect, adminOnly, updateVegetable);

module.exports = router;
