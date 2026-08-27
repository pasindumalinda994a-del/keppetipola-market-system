import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

export type CounterKey = "farmer" | "trader";

export type ICounter = {
  key: CounterKey;
  seq: number;
};

const counterSchema = new Schema<ICounter>({
  key: {
    type: String,
    enum: ["farmer", "trader"],
    required: true,
    unique: true,
  },
  seq: {
    type: Number,
    required: true,
    default: 0,
  },
});

export type CounterDocument = HydratedDocument<ICounter>;

if (mongoose.models.Counter) {
  mongoose.deleteModel("Counter");
}

export const Counter: Model<ICounter> = mongoose.model<ICounter>(
  "Counter",
  counterSchema
);

export default Counter;
