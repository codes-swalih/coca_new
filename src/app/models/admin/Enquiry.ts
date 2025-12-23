import mongoose, { Model, Schema, Document } from "mongoose";

interface IEnquirySchema extends Document {
  status: string;
  name: string;
  phone: string;
  secondaryPhone: string;
  relation: string;
  date: string;
  location: string;
  email: string;
  category: string;
  memberId: string;
}


const EnquirySchema: Schema<IEnquirySchema> = new Schema({
  status: { type: String },
  name: { type: String },
  phone: { type: String },
  secondaryPhone: { type: String },
  relation: { type: String },
  date: { type: String },
  location: { type: String },
  email: { type: String },
  category: { type: String },
  memberId: { type: String },
});

const enquiry: Model<IEnquirySchema> =
  mongoose.models.enquiry || mongoose.model("enquiry", EnquirySchema);

export default enquiry;

