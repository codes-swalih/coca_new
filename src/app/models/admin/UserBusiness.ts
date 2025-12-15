import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUserBusinessSchema extends Document {
  nameOfBusiness: string;
  businessPhoneNumber: string;
  businessEmailId: string;
  address: string;
  businessLocation: string;
  businessLogo: string;
  gallaryLink: string;
  facebookAccount: string;
  instagramAccount: string;
  whatsAppLink: string;
  youtubeChannel: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  upiId: string;
  paymentQrCode: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  memberId: string;
  mid: string;
}

const UserBusinessSchema: Schema<IUserBusinessSchema> = new Schema({
  nameOfBusiness: { type: String },
  businessPhoneNumber: { type: String },
  businessEmailId: { type: String },
  address: { type: String },
  businessLocation: { type: String },
  businessLogo: { type: String },
  gallaryLink: { type: String },
  facebookAccount: { type: String },
  instagramAccount: { type: String },
  whatsAppLink: { type: String },
  youtubeChannel: { type: String },
  bankName: { type: String },
  accountNumber: { type: String },
  ifsc: { type: String },
  branch: { type: String },
  upiId: { type: String },
  paymentQrCode: { type: String },
  location: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true },
  },
  memberId: { type: String },
  mid: { type: String },
});

// 🧭 Add geospatial index
UserBusinessSchema.index({ location: "2dsphere" });

const userBusines: Model<IUserBusinessSchema> =
  mongoose.models.userBusines ||
  mongoose.model("userBusines", UserBusinessSchema);

export default userBusines;
