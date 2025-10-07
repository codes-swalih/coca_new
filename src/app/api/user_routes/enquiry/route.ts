import enquiry from "@/app/models/admin/Enquiry";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import { NextResponse } from "next/server";

interface EnquiryRequest {
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

export const POST = async (req: Request) => {
  const body: EnquiryRequest = await req.json();
  const {
    status,
    name,
    phone,
    secondaryPhone,
    relation,
    date,
    location,
    email,
    category,
    memberId,
  } = body;
  try {
    await connectToMongoDB();
    const isAlreadyExist = await enquiry.findOne({
      email: email,
      date: date,
      phone: phone,
    });
    if (isAlreadyExist) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "You have already submitted an enquiry with this email",
        },
        { status: 409 }
      );
    }
    const newEnquiry = await enquiry.create({
      status,
      name,
      phone,
      secondaryPhone,
      relation,
      date,
      location,
      email,
      category,
      memberId,
    });

    if (!newEnquiry) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Something wrong with the payload",
        },
        { status: 404 }
      );
    }
    return NextResponse.json({
      status: "Success",
      message: "You have successfully submitted an enquiry",
      data: newEnquiry,
    });
  } catch (error: any) {
    console.log("Error while submitting an enquiry", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};


