import mongoose, { Schema, Document, Model } from "mongoose";

interface ICocaEventSchema extends Document {
  eventTitle: string;
  date: string;
  location: string;
  aboutEvent: string;
  eventImage: string;
}

const CocaEventSchema: Schema<ICocaEventSchema> = new Schema({
  eventTitle: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  aboutEvent: { type: String, required: true },
  eventImage: { type: String },
});

const CocaEvents: Model<ICocaEventSchema> =
  mongoose.models.CocaEvents || mongoose.model("CocaEvents", CocaEventSchema);

export default CocaEvents;
