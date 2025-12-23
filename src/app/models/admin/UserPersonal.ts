import mongoose, { Document, Schema, Model } from "mongoose";

interface IUserPersonalSchema extends Document {
  nameOfBusinessOwner: string;
  designation: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  memberId: string;
  fcmToken: string;
  chapter: mongoose.Types.ObjectId;
}

const UserPersonalSchema: Schema<IUserPersonalSchema> = new Schema({
  nameOfBusinessOwner: { type: String },
  designation: { type: String },
  phone: { type: String },
  secondaryPhone: { type: String },
  email: { type: String },
  memberId: { type: String },
  fcmToken: { type: String },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "chapter",
  },
});

const userPersonal: Model<IUserPersonalSchema> =
  mongoose.models.userPersonal ||
  mongoose.model("userPersonal", UserPersonalSchema);

export default userPersonal;
