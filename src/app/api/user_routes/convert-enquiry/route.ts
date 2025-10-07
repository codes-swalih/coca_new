import enquiry from "@/app/models/admin/Enquiry";
import bookings from "@/app/models/bookings/bookingsModel";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import { NextResponse } from "next/server";

interface ConvertEnquiryRequest {
  enquiryId: string;
}

export const POST = async (req: Request) => {
  const body: ConvertEnquiryRequest = await req.json();
  const { enquiryId } = body;

  try {
    await connectToMongoDB();

    // Find the enquiry by ID
    const existingEnquiry = await enquiry.findById(enquiryId);
    if (!existingEnquiry) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Enquiry not found",
        },
        { status: 404 }
      );
    }

    // Check if booking already exists for this enquiry
    const existingBooking = await bookings.findOne({
      startingDate: existingEnquiry.date,
      endingDate: existingEnquiry.date,
      emailId: existingEnquiry.email,
    });

    if (existingBooking) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Booking already exists for this enquiry",
        },
        { status: 409 }
      );
    }

    // Generate a unique booking ID
    const bookingId = `BK-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Map enquiry data to booking data with default values for required fields
    const newBooking = await bookings.create({
      bookingId,
      clientName: existingEnquiry.name,
      startingDate: existingEnquiry.date,
      endingDate: existingEnquiry.date,
      mobileNumber: existingEnquiry.phone,
      emailId: existingEnquiry.email,
      venue: existingEnquiry.location,
      typeOfFunction: existingEnquiry.category,
      customerRelation: existingEnquiry.relation,
      groomName: "", // Default empty value
      brideName: "", // Default empty value
      associatedProgram: [], // Default empty array
      totalBudget: "0", // Default value
      advanceAmount: "0", // Default value
      workStatus: "upcoming",
      eventDayPayment: "", // Default empty value
      balanceAmount: "0", // Default value
      expenses: "", // Default empty value
      memberId: existingEnquiry.memberId,
    });

    if (!newBooking) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to create booking from enquiry",
        },
        { status: 500 }
      );
    }

    // Update enquiry status to indicate it's been converted
    await enquiry.findByIdAndUpdate(enquiryId, {
      status: "converted",
    });

    return NextResponse.json({
      status: "Success",
      message: "Enquiry successfully converted to booking",
      data: {
        enquiry: existingEnquiry,
        booking: newBooking,
      },
    });
  } catch (error: any) {
    console.log("Error while converting enquiry to booking", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// GET endpoint to fetch enquiry details for conversion
export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const enquiryId = searchParams.get("enquiryId");

    if (!enquiryId) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Enquiry ID is required",
        },
        { status: 400 }
      );
    }

    await connectToMongoDB();

    const enquiryData = await enquiry.findById(enquiryId);
    if (!enquiryData) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Enquiry not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "Success",
      message: "Enquiry retrieved successfully",
      data: enquiryData,
    });
  } catch (error: any) {
    console.log("Error while fetching enquiry", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
