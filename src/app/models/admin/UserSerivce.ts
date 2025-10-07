// UserService model (UserService.ts)
import mongoose, { Document, Model, Schema } from "mongoose";
import "./services";

interface IUserService extends Document {
  serviceId: mongoose.Types.ObjectId[];
  memberId: string;
}

const UserServiceSchema: Schema<IUserService> = new Schema({
  serviceId: [{ type: mongoose.Schema.Types.ObjectId, ref: "services" }],
  memberId: { type: String },
});

const userservice: Model<IUserService> =
  mongoose.models.userservice ||
  mongoose.model("userservice", UserServiceSchema);

export default userservice;
