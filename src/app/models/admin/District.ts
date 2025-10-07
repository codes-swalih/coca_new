import mongoose, { Schema, Document, Model } from "mongoose";

interface IDistrictSchema extends Document {
  districtName: string;
  state: mongoose.Types.ObjectId;
}

const DistrictSchema = new Schema(
  {
    districtName: { type: String, required: true },
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

// Add a compound index to prevent duplicate districts in the same state
DistrictSchema.index({ districtName: 1, state: 1 }, { unique: true });

const District: Model<IDistrictSchema> =
  mongoose.models.district || mongoose.model("district", DistrictSchema);

export default District;
