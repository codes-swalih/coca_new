import mongoose, { Schema, Document, Model } from "mongoose";

interface IAdvertisementSchema extends Document {
  title: string;
  description: string;
  image: string;
  link: string;
}

const AdvertisementSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  link: { type: String },
}, { timestamps: true });

const advertisements: Model<IAdvertisementSchema> =
  mongoose.models.advertisements || mongoose.model("advertisements", AdvertisementSchema);

export default advertisements;