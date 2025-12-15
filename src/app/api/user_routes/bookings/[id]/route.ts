import { NextResponse } from "next/server";
import bookings from "../../../../models/bookings/bookingsModel";
import { connectToMongoDB } from "../../../../../../libs/mongodb";

interface IMember {
  memberName: string;
  service: string;
}

interface IAssociation {
  members: IMember[];
  startDate: string;
  endDate: string;
  timeSlot: string;
  budget: string;
}

interface bookingsUpdateRequest {
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

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const body: bookingsUpdateRequest = await req.json();
  const { id } = params;
  const {
    bookingId,
    clientName,
    startingDate,
    endingDate,
    mobileNumber,
    emailId,
    venue,
    typeOfFunction,
    customerRelation,
    groomName,
    brideName,
    associatedProgram,
    totalBudget,
    advanceAmount,
    workStatus,
    eventDayPayment,
    balanceAmount,
    expenses,
    memberId,
    dayOrNight,
  } = body;

  try {
    await connectToMongoDB();
    const updatedBooking = await bookings.findByIdAndUpdate(
      id,
      {
        bookingId,
        clientName,
        startingDate,
        endingDate,
        mobileNumber,
        emailId,
        venue,
        typeOfFunction,
        customerRelation,
        groomName,
        brideName,
        associatedProgram,
        totalBudget,
        advanceAmount,
        workStatus,
        eventDayPayment,
        balanceAmount,
        expenses,
        memberId,
        dayOrNight,
      },
      { new: true }
    );
    return NextResponse.json({
      status: "success",
      message: "You have successfully updated the booking",
      data: updatedBooking,
    });
  } catch (error) {
    console.log("Error while updating the booking", error);
    return NextResponse.json({ status: "error", error: error });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await connectToMongoDB();
    const deletedBooking = await bookings.findByIdAndDelete(id);
    if (!deletedBooking) {
      return NextResponse.json(
        { status: "Failed", message: "Booking not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        status: "Success",
        message: "You have successfully deleted the booking",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error while deleting the booking", error);
    return NextResponse.json({ status: "error", error: error });
  }
};

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await connectToMongoDB();
    const booking = await bookings.findById(id);
    if (!booking) {
      return NextResponse.json(
        { status: "Failed", message: "Booking not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        status: "Success",
        message: "You have successfully retrieved the booking",
        data: booking,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error while retrieving the booking", error);
    return NextResponse.json({ status: "error", error: error });
  }
};
