import mongoose, { Schema, Document, Model } from "mongoose";

interface IUserTestimonial extends Document {
  reviewerName: string;
  testimonial: string;
  reviewerImage: string;
  memberId: string;
}

const UserTestimonialSchema: Schema<IUserTestimonial> = new Schema({
  reviewerName: { type: String },
  testimonial: { type: String },
  reviewerImage: { type: String },
  memberId: { type: String },
});

const usersTestimonial: Model<IUserTestimonial> =
  mongoose.models.usersTestimonial ||
  mongoose.model("usersTestimonial", UserTestimonialSchema);

export default usersTestimonial;
