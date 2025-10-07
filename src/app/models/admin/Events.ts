import mongoose, { Schema, Document, Model } from "mongoose";

interface IEventSchema extends Document {
  eventTitle: string;
  date: string;
  location: string;
  aboutEvent: string;
  club: mongoose.Types.ObjectId;
  eventImage: string;
}

const EventSchema: Schema<IEventSchema> = new Schema({
  eventTitle: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  aboutEvent: { type: String, required: true },
  club: { type: mongoose.Schema.Types.ObjectId, ref: "clubs" },
  eventImage: { type: String },
});

const events: Model<IEventSchema> =
  mongoose.models.events || mongoose.model("events", EventSchema);

export default events;
