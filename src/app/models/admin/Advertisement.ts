import mongoose, { Schema, Document, Model } from "mongoose";

interface IAdvertisementSchema extends Document {
  image: string;
  link: string;
}

const AdvertisementSchema = new Schema({
  image: { type: String },
  link: { type: String },
}, { timestamps: true });

const advertisements: Model<IAdvertisementSchema> =
  mongoose.models.advertisements || mongoose.model("advertisements", AdvertisementSchema);

export default advertisements;