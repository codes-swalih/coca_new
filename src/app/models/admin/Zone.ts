import mongoose, { Schema, Document, Model } from "mongoose";

interface IZoneSchema extends Document {
  zoneName: string;
  district: mongoose.Types.ObjectId;
  state: mongoose.Types.ObjectId;
}

const ZoneSchema = new Schema(
  {
    zoneName: { type: String, required: true },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "district",
      required: true,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "state",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add a compound index to prevent duplicate zones in the same district
ZoneSchema.index({ zoneName: 1, district: 1 }, { unique: true });

const Zone: Model<IZoneSchema> =
  mongoose.models.zone || mongoose.model("zone", ZoneSchema);

export default Zone;
