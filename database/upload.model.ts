import mongoose, { Schema, type HydratedDocument, type Model, type Types } from "mongoose";

export type UploadOwnerType = "registration" | "harvest" | "profile";

export type UploadKind =
  | "identityFront"
  | "identityBack"
  | "taxBill"
  | "photo"
  | "avatar";

export type IUpload = {
  ownerType: UploadOwnerType;
  ownerId: Types.ObjectId;
  kind: UploadKind;
  mimeType: string;
  filename: string;
  data: Buffer;
};

const uploadSchema = new Schema<IUpload>(
  {
    ownerType: {
      type: String,
      enum: ["registration", "harvest", "profile"],
      required: true,
      index: true,
    },
    ownerId: { type: Schema.Types.ObjectId, required: true, index: true },
    kind: {
      type: String,
      enum: ["identityFront", "identityBack", "taxBill", "photo", "avatar"],
      required: true,
    },
    mimeType: { type: String, required: true },
    filename: { type: String, required: true, trim: true },
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: true }
);

uploadSchema.index({ ownerType: 1, ownerId: 1 });

export type UploadDocument = HydratedDocument<IUpload>;

if (mongoose.models.Upload) {
  mongoose.deleteModel("Upload");
}

export const Upload: Model<IUpload> = mongoose.model<IUpload>(
  "Upload",
  uploadSchema
);

export default Upload;
