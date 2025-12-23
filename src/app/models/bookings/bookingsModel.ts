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
  dayOrNight: boolean;
}

const MemberSchema = new Schema({
  memberName: { type: String, required: true },
  service: { type: String, required: true },
  memberId: { type: String, required: true },
});

const AssociationSchema = new Schema({
  members: { type: [MemberSchema], required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  timeSlot: { type: String, required: true },
  budget: { type: String, required: true },
});

const BookingSchema: Schema<IBookingModel> = new Schema({
  bookingId: { type: String },
  clientName: { type: String },
  startingDate: { type: String},
  endingDate: { type: String },
  mobileNumber: { type: String },
  emailId: { type: String },
  venue: { type: String },
  typeOfFunction: { type: String },
  customerRelation: { type: String },
  groomName: { type: String },
  brideName: { type: String },
  associatedProgram: { type: [AssociationSchema] },
  totalBudget: { type: String},
  advanceAmount: { type: String },
  workStatus: { type: String },
  eventDayPayment: { type: String },
  balanceAmount: { type: String },
  expenses: { type: String },
  memberId: { type: String, required: true },
  dayOrNight: { type: Boolean },
});

const bookings: Model<IBookingModel> =
  mongoose.models.bookings || mongoose.model("bookings", BookingSchema);

export default bookings;
