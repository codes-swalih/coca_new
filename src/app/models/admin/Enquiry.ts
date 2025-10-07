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
  status: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  secondaryPhone: { type: String, required: true },
  relation: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  email: { type: String, required: true },
  category: { type: String, required: true },
  memberId: { type: String, required: true },
});

const enquiry: Model<IEnquirySchema> =
  mongoose.models.enquiry || mongoose.model("enquiry", EnquirySchema);

export default enquiry;

