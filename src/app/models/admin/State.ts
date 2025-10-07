import mongoose, { Schema, Document, Model } from "mongoose";

interface IStateSchema extends Document {
  stateName: string;
}

const StateSchema = new Schema(
  {
    stateName: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

const State: Model<IStateSchema> =
  mongoose.models.state || mongoose.model("state", StateSchema);

export default State;
