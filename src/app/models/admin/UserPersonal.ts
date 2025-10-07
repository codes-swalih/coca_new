import mongoose, { Document, Schema, Model } from "mongoose";

interface IUserPersonalSchema extends Document {
  nameOfBusinessOwner: string;
  designation: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  memberId: string;
}

const UserPersonalSchema: Schema<IUserPersonalSchema> = new Schema({
  nameOfBusinessOwner: { type: String },
  designation: { type: String },
  phone: { type: String },
  secondaryPhone: { type: String },
  email: { type: String },
  memberId: { type: String },
});

const userPersonal: Model<IUserPersonalSchema> =
  mongoose.models.userPersonal ||
  mongoose.model("userPersonal", UserPersonalSchema);

export default userPersonal;
