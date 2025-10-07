import mongoose, { Document, Model, Schema } from "mongoose";

interface IAdminSchema extends Document {
  username: string;
  password: string;
  role: mongoose.Types.ObjectId;
}

const AdminSchema: Schema<IAdminSchema> = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "roles" },
});

const admin: Model<IAdminSchema> =
  mongoose.models.admin || mongoose.model("admin", AdminSchema);

export default admin;
