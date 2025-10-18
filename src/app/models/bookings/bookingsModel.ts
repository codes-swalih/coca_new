import mongoose, { Schema, Document, Model } from "mongoose";

interface IMember {
  memberName: string;
  service: string;
  memberId: string;
}

interface IAssociation {
  members: IMember[];
  startDate: string;
  endDate: string;
  timeSlot: string;
  budget: string;
}

interface IBookingModel extends Document {
  bookingId: string;
  clientName: string;
  startingDate: string;
  endingDate: string;
  mobileNumber: string;
  emailId: string;
  venue: string;
  typeOfFunction: string;
  customerRelation: string;
  groomName: string;
  brideName: string;
  associatedProgram: IAssociation[];
  totalBudget: string;
  advanceAmount: string;
  workStatus: string;
  eventDayPayment: string;
  balanceAmount: string;
  expenses: string;
  memberId: string;
}

const MemberSchema = new Schema({
  memberName: { type: String, required: true },
  service: { type: String, required: true },
});

const AssociationSchema = new Schema({
  members: { type: [MemberSchema], required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  timeSlot: { type: String, required: true },
  budget: { type: String, required: true },
});

const BookingSchema: Schema<IBookingModel> = new Schema({
  bookingId: { type: String, required: true },
  clientName: { type: String, required: true },
  startingDate: { type: String, required: true },
  endingDate: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  emailId: { type: String, required: true },
  venue: { type: String, required: true },
  typeOfFunction: { type: String, required: true },
  customerRelation: { type: String },
  groomName: { type: String },
  brideName: { type: String },
  associatedProgram: { type: [AssociationSchema], required: true },
  totalBudget: { type: String, required: true },
  advanceAmount: { type: String, required: true },
  workStatus: { type: String, required: true },
  eventDayPayment: { type: String },
  balanceAmount: { type: String, required: true },
  expenses: { type: String },
  memberId: { type: String, required: true },
});

const bookings: Model<IBookingModel> =
  mongoose.models.bookings || mongoose.model("bookings", BookingSchema);

export default bookings;
