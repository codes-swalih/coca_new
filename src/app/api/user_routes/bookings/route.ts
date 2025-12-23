import bookings from "../../../../app/models/bookings/bookingsModel";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import { NextResponse } from "next/server";
import { stat } from "fs";
import { messaging } from "../../../../configs/firebase_admin";

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

interface bookingsRequest {
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

export const POST = async (req: Request) => {
  const body: bookingsRequest = await req.json();
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
    const isAlreadUploaded = await bookings.findOne({
      startingDate: startingDate,
      endingDate: endingDate,
      memberId: memberId,
    });
    if (isAlreadUploaded) {
      return NextResponse.json({
        status: "Failed",
        message: "this member's booking is already uploaded!",
      });
    }

    const newBooking = await bookings.create({
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
      workStatus: "upcoming",
      eventDayPayment,
      balanceAmount,
      expenses,
      memberId,
      dayOrNight,
    });

    return NextResponse.json({
      status: "Success",
      message: "Booking created successfully",
      data: newBooking,
    });
  } catch (error: any) {
    console.log("Error while creating booking", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");

    await connectToMongoDB();

    if (memberId) {
      // Fetch bookings where memberId matches either:
      // 1. The top-level memberId field, OR
      // 2. Any memberId in the associatedProgram.members array
      const booking = await bookings.find({
        $or: [
          { memberId: memberId },
          {
            "associatedProgram.members": {
              $elemMatch: { memberId: memberId },
            },
          },
        ],
      });

      if (!booking || booking.length === 0) {
        return NextResponse.json(
          { status: "Failed", message: "No booking found for this member" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          status: "Success",
          message: "Booking retrieved successfully",
          data: booking,
        },
        { status: 200 }
      );
    }

    // If no memberId provided, fetch all bookings
    const allBookings = await bookings.find();
    if (allBookings.length === 0) {
      return NextResponse.json(
        { status: "Failed", message: "No bookings found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have successfully retrieved all bookings",
        data: allBookings,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching bookings", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};
