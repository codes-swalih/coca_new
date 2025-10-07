import enquiry from "@/app/models/admin/Enquiry";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import { NextResponse } from "next/server";

interface getEnquiryRequest {
  memberId: string;
}

export const POST = async (req: Request) => {
  const body: getEnquiryRequest = await req.json();
  const { memberId } = body;
  try {
    await connectToMongoDB();
    const allEnquiry = await enquiry.find({ memberId: memberId });
    if (allEnquiry.length === 0) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "There is no enquiry with this member id",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have successfully fetched all the member enquiry",
        data: allEnquiry,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching all member enquiries", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};
