const express = require("express");
const { getPrices, updatePrice } = require("../controllers/price.controller");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminOnly");

const router = express.Router();

router.get("/", getPrices);
router.patch("/:vegetableId", protect, adminOnly, updatePrice);

module.exports = router;
