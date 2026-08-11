require("dotenv").config();

const connectDB = require("../config/db");
const Vegetable = require("../models/Vegetable");
const MarketPrice = require("../models/MarketPrice");

const CATALOG = [
  {
    name: "Carrot",
    category: "Root",
    unit: "kg",
    status: "Active",
    imageUrl: "/Vegitable-Images/Carrot.png",
    price: { lowest: 190, highest: 200, average: 196, change: 5 },
  },
  {
    name: "Cabbage",
    category: "Leafy",
    unit: "kg",
    status: "Active",
    imageUrl: "/Vegitable-Images/Cabbage.png",
    price: { lowest: 80, highest: 95, average: 88, change: -2 },
  },
  {
    name: "Leeks",
    category: "Leafy",
    unit: "kg",
    status: "Active",
    imageUrl: "/Vegitable-Images/Leeks.png",
    price: { lowest: 220, highest: 245, average: 232, change: 8 },
  },
  {
    name: "Beans",
    category: "Pod",
    unit: "kg",
    status: "Active",
    imageUrl: "/Vegitable-Images/Beans.png",
    price: { lowest: 280, highest: 310, average: 295, change: 12 },
  },
  {
    name: "Tomato",
    category: "Fruit",
    unit: "kg",
    status: "Active",
    imageUrl: "/Vegitable-Images/Tomato.png",
    price: { lowest: 150, highest: 175, average: 162, change: -4 },
  },
  {
    name: "Potato",
    category: "Root",
    unit: "kg",
    status: "Active",
    imageUrl: "/Vegitable-Images/Potato.png",
    price: { lowest: 120, highest: 135, average: 128, change: 1 },
  },
  {
    name: "Beetroot",
    category: "Root",
    unit: "kg",
    status: "Active",
    imageUrl: "/Vegitable-Images/Beetroot.png",
    price: { lowest: 160, highest: 180, average: 170, change: 3 },
  },
  {
    name: "Capsicum",
    category: "Fruit",
    unit: "kg",
    status: "Active",
    imageUrl: "/Vegitable-Images/Capsicum.png",
    price: { lowest: 350, highest: 390, average: 370, change: -6 },
  },
];

async function seedCatalog() {
  await connectDB();

  let created = 0;
  let skipped = 0;

  for (const item of CATALOG) {
    const existing = await Vegetable.findOne({ name: item.name });
    if (existing) {
      skipped += 1;
      continue;
    }

    const vegetable = await Vegetable.create({
      name: item.name,
      category: item.category,
      unit: item.unit,
      status: item.status,
      imageUrl: item.imageUrl,
    });

    await MarketPrice.create({
      vegetableId: vegetable._id,
      vegetableName: vegetable.name,
      imageUrl: item.imageUrl,
      lowest: item.price.lowest,
      highest: item.price.highest,
      average: item.price.average,
      change: item.price.change,
      lastUpdated: new Date(),
    });

    created += 1;
  }

  console.log(`Catalog seed complete: ${created} created, ${skipped} already existed.`);
  process.exit(0);
}

seedCatalog().catch((err) => {
  console.error("seed-catalog failed:", err);
  process.exit(1);
});
