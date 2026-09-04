import mongoose, {
  Schema,
  type HydratedDocument,
  type Model,
  type Types,
} from "mongoose";
import { serializeId } from "@/lib/serialize";

export type IPriceSnapshot = {
  vegetableId: Types.ObjectId;
  date: string;
  lowest: number;
  highest: number;
  average: number;
};

const priceSnapshotSchema = new Schema<IPriceSnapshot>(
  {
    vegetableId: {
      type: Schema.Types.ObjectId,
      ref: "Vegetable",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    lowest: { type: Number, required: true },
    highest: { type: Number, required: true },
    average: { type: Number, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        return serializeId(ret as unknown as Record<string, unknown>, {
          objectIds: ["vegetableId"],
        });
      },
    },
  }
);

priceSnapshotSchema.index({ vegetableId: 1, date: 1 }, { unique: true });

export type PriceSnapshotDocument = HydratedDocument<IPriceSnapshot>;

export const PriceSnapshot: Model<IPriceSnapshot> =
  (mongoose.models.PriceSnapshot as Model<IPriceSnapshot>) ||
  mongoose.model<IPriceSnapshot>("PriceSnapshot", priceSnapshotSchema);

export default PriceSnapshot;
