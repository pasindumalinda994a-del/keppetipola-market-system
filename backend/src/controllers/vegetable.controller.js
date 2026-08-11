const Vegetable = require("../models/Vegetable");
const MarketPrice = require("../models/MarketPrice");

async function getActiveVegetables(_req, res) {
  try {
    const vegetables = await Vegetable.find({ status: "Active" }).sort({
      name: 1,
    });
    return res.json({ vegetables: vegetables.map((v) => v.toJSON()) });
  } catch (err) {
    console.error("getActiveVegetables error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getAllVegetables(_req, res) {
  try {
    const vegetables = await Vegetable.find().sort({ name: 1 });
    return res.json({ vegetables: vegetables.map((v) => v.toJSON()) });
  } catch (err) {
    console.error("getAllVegetables error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function createVegetable(req, res) {
  try {
    const { name, category, unit, imageUrl } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: "Name and category are required" });
    }

    const vegetable = await Vegetable.create({
      name: String(name).trim(),
      category: String(category).trim(),
      unit: unit ? String(unit).trim() : "kg",
      imageUrl: imageUrl ? String(imageUrl).trim() : "",
      status: "Active",
    });

    await MarketPrice.create({
      vegetableId: vegetable._id,
      vegetableName: vegetable.name,
      imageUrl: vegetable.imageUrl,
      lowest: 0,
      highest: 0,
      average: 0,
      change: 0,
      lastUpdated: new Date(),
    });

    return res.status(201).json({ vegetable: vegetable.toJSON() });
  } catch (err) {
    console.error("createVegetable error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function updateVegetable(req, res) {
  try {
    const vegetable = await Vegetable.findById(req.params.id);
    if (!vegetable) {
      return res.status(404).json({ message: "Vegetable not found" });
    }

    const { name, category, unit, status, imageUrl } = req.body;

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({ message: "Name is required" });
      }
      vegetable.name = String(name).trim();
    }
    if (category !== undefined) {
      vegetable.category = String(category).trim();
    }
    if (unit !== undefined) {
      vegetable.unit = String(unit).trim();
    }
    if (status !== undefined) {
      if (status !== "Active" && status !== "Inactive") {
        return res
          .status(400)
          .json({ message: "Status must be Active or Inactive" });
      }
      vegetable.status = status;
    }
    if (imageUrl !== undefined) {
      vegetable.imageUrl = String(imageUrl).trim();
    }

    await vegetable.save();

    await MarketPrice.updateOne(
      { vegetableId: vegetable._id },
      {
        vegetableName: vegetable.name,
        imageUrl: vegetable.imageUrl,
      }
    );

    return res.json({ vegetable: vegetable.toJSON() });
  } catch (err) {
    console.error("updateVegetable error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getActiveVegetables,
  getAllVegetables,
  createVegetable,
  updateVegetable,
};
