import mongoose, { Schema, Document, Model } from "mongoose";
import "../admin/UserPersonal"
import "../admin/Events"

interface IclubSchema extends Document {
  clubName: string;
  since: string;
  clubManager: string;
  members: mongoose.Types.ObjectId[];
  events: mongoose.Types.ObjectId[];
  image: string;
}

const ClubSchema = new Schema({
  clubName: { type: String, required: true },
  since: { type: String, required: true },
  clubManager: { type: mongoose.Schema.Types.ObjectId, ref: "userPersonal" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "userPersonal" }],
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: "events" }],
  image: { type: String },
}, {
  timestamps: true // This adds createdAt and updatedAt fields
});

const clubs: Model<IclubSchema> =
  mongoose.models.clubs || mongoose.model("clubs", ClubSchema);

export default clubs;
