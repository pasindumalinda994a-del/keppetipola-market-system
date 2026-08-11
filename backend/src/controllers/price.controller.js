const MarketPrice = require("../models/MarketPrice");

async function getPrices(_req, res) {
  try {
    const prices = await MarketPrice.find().sort({ vegetableName: 1 });
    return res.json({ prices: prices.map((p) => p.toJSON()) });
  } catch (err) {
    console.error("getPrices error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function updatePrice(req, res) {
  try {
    const { lowest, highest } = req.body;

    if (lowest === undefined || highest === undefined) {
      return res
        .status(400)
        .json({ message: "Lowest and highest prices are required" });
    }

    const lowestNum = Number(lowest);
    const highestNum = Number(highest);

    if (Number.isNaN(lowestNum) || Number.isNaN(highestNum)) {
      return res.status(400).json({ message: "Prices must be numbers" });
    }

    if (lowestNum > highestNum) {
      return res
        .status(400)
        .json({ message: "Lowest price cannot exceed highest price" });
    }

    const price = await MarketPrice.findOne({
      vegetableId: req.params.vegetableId,
    });

    if (!price) {
      return res.status(404).json({ message: "Price record not found" });
    }

    const oldAverage = price.average;
    const newAverage = Math.round((lowestNum + highestNum) / 2);
    let change = 0;

    if (oldAverage > 0) {
      change = Math.round(((newAverage - oldAverage) / oldAverage) * 100);
    }

    price.lowest = lowestNum;
    price.highest = highestNum;
    price.average = newAverage;
    price.change = change;
    price.lastUpdated = new Date();

    await price.save();
    return res.json({ price: price.toJSON() });
  } catch (err) {
    console.error("updatePrice error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getPrices, updatePrice };
