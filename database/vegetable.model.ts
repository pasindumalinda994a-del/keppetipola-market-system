import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";
import { normalizeProduceCategory } from "@/lib/produce";

export type IVegetable = {
  name: string;
  category: string;
  unit: string;
  status: "Active" | "Inactive";
  imageUrl: string;
};

const vegetableSchema = new Schema<IVegetable>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      set: (value: string) => normalizeProduceCategory(value),
    },
    unit: {
      type: String,
      default: "kg",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        const value = ret as unknown as Record<string, unknown>;
        value.id = String(value._id);
        value.category = normalizeProduceCategory(String(value.category ?? ""));
        delete value._id;
        delete value.__v;
        return value;
      },
    },
  }
);

export type VegetableDocument = HydratedDocument<IVegetable>;

export const Vegetable: Model<IVegetable> =
  (mongoose.models.Vegetable as Model<IVegetable>) ||
  mongoose.model<IVegetable>("Vegetable", vegetableSchema);

export default Vegetable;
