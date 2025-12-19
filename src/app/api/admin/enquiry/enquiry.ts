import enquiry from "@/app/models/admin/Enquiry";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  try {
    await connectToMongoDB();
    const allEnquiries = await enquiry.find().sort({ createdAt: -1 });
    if (allEnquiries.length === 0) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "No enquiries found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        status: "Success",
        message: "All enquiries fetched successfully",
        data: allEnquiries,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error while fetching all enquiries", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
};
