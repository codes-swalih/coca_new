import userPersonal from "@/app/models/admin/UserPersonal";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import { NextResponse } from "next/server";
import Service from "../../../../models/admin/services";

interface memberUpdatedPersonalRequest {
  nameOfBusinessOwner: string;
  businessName: string;
  designation: string;
  phone: string;
  secondaryPhone: string;
  email: string;
}

export const PUT = async (
  req: Request,
  { params }: { params: { id: String } }
) => {
  const { id } = params;

  const body: memberUpdatedPersonalRequest = await req.json();

  const { nameOfBusinessOwner, designation, phone, secondaryPhone, email, businessName } =
    body;

  try {
    await connectToMongoDB();

    const updatingMemberPersonalDetails = await userPersonal.findByIdAndUpdate(
      id,
      { nameOfBusinessOwner, designation, phone, secondaryPhone, email, businessName },
      { new: true }
    );

    if (!updatingMemberPersonalDetails) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Something wrong with the id or payloads",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You succesfully updated the personal details",
        data: updatingMemberPersonalDetails,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error in updating member personal details", error);
    return NextResponse.json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const GET = async (
  req: Request,
  { params }: { params: { id: String } }
) => {
  const { id } = params;
  try {
    await connectToMongoDB();

    const memberPersonalDetails = await userPersonal.findById(id);
    if (!memberPersonalDetails) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "no personal data with this particular Id",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully retrived a user personal data",
        data: memberPersonalDetails,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Somethig wrong with retreiving the user personal data", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
