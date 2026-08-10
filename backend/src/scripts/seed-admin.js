require("dotenv").config();

const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

const ADMIN = {
  name: "Market Admin",
  email: "admin@keppetipola.lk",
  phone: "+94 55 222 3344",
  password: "admin123",
  role: "admin",
  address: "Market Management Office",
  status: "Active",
};

async function seedAdmin() {
  await connectDB();

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    console.log(`Admin already exists: ${ADMIN.email}`);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(ADMIN.password, 10);
  await User.create({
    ...ADMIN,
    password: hashed,
  });

  console.log(`Admin created: ${ADMIN.email} / ${ADMIN.password}`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("seed-admin failed:", err);
  process.exit(1);
});
