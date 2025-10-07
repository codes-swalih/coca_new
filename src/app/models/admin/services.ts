
import mongoose, { Document, Schema, Model } from "mongoose";

interface IServiceSchema extends Document {
  serviceTitle: string;
  serviceImage: string;
}

const ServiceSchema: Schema<IServiceSchema> = new Schema({
  serviceTitle: { type: String, required: true },
  serviceImage: { type: String, required: true },
});

const services: Model<IServiceSchema> =
  mongoose.models.services || mongoose.model("services", ServiceSchema);

export default services;