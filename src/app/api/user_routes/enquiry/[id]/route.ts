import enquiry from "../../../../../app/models/admin/Enquiry";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import { NextResponse } from "next/server";

interface updateEnquiryRequest {
  status: string;
  name: string;
  phone: string;
  secondaryPhone: string;
  relation: string;
  date: string;
  location: string;
  email: string;
  category: string;
}

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const body: updateEnquiryRequest = await req.json();
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
  } = body;
  try {
    await connectToMongoDB();
    const editedEnquiry = await enquiry.findByIdAndUpdate(
      id,
      {
        status,
        name,
        phone,
        secondaryPhone,
        relation,
        date,
        location,
        email,
        category,
      },
      { new: true }
    );

    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully updated the enquiry",
        data: editedEnquiry,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while updating an enquiry", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await connectToMongoDB();
    const deletedEnquiry = await enquiry.findByIdAndDelete(id);
    if (!deletedEnquiry) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "There is no enquiry with this particular ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully deleted an enquiry",
        data: deletedEnquiry,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while deleting an enquiry", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await connectToMongoDB();
    const oneEnquiry = await enquiry.findById(id);
    if (!oneEnquiry) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "There is no enquiry with this particular id",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have successfully fetched an enquiry",
        data: oneEnquiry,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching an enquiry", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};
