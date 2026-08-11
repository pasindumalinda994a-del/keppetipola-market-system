const mongoose = require("mongoose");

const marketPriceSchema = new mongoose.Schema(
  {
    vegetableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vegetable",
      required: true,
      unique: true,
    },
    vegetableName: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    lowest: {
      type: Number,
      default: 0,
    },
    highest: {
      type: Number,
      default: 0,
    },
    average: {
      type: Number,
      default: 0,
    },
    change: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        ret.vegetableId = ret.vegetableId.toString();
        delete ret._id;
        delete ret.__v;
        if (ret.lastUpdated) {
          ret.lastUpdated = ret.lastUpdated.toISOString();
        }
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("MarketPrice", marketPriceSchema);
