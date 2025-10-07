import mongoose, { Document, Model, Schema } from "mongoose";

interface IRoleSchema extends Document {
  title: string;
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema<IRoleSchema> = new Schema({
  title: { type: String, required: true, unique: true },
  categories: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const roles: Model<IRoleSchema> =
  mongoose.models.roles || mongoose.model("roles", RoleSchema);

export default roles;
