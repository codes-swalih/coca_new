import mongoose from "mongoose";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import { NextResponse } from "next/server";
import userService from "../../../../models/admin/UserSerivce";
import "../../../../../app/models/admin/services";

interface memberServiceUpdatedRequest {
  serviceId: mongoose.Types.ObjectId[];
}

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  const body: memberServiceUpdatedRequest = await req.json();

  const { serviceId } = body;
  try {
    await connectToMongoDB();
    const updatedService = await userService
      .findByIdAndUpdate(
        id,
        {
          serviceId,
        },
        { new: true }
      )
      .populate("serviceId");

    if (!updatedService) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Something wrong in updating user services",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "Success",
      message: "You have succesfully updated the user services",
      data: updatedService,
    });
  } catch (error: any) {
    console.log("Error in updating member services", error);
    return NextResponse.json({
      messgae: "Internal server error",
      error: error.message,
    });
  }
};

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  try {
    await connectToMongoDB();

    const fetchMemberService = await userService
      .findById(id)
      .populate("serviceId");

    if (!fetchMemberService) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "There is no member service with this id",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "Success",
      message: "You successfully fetched the member service!",
      data: fetchMemberService,
    });
  } catch (error: any) {
    console.error("Error in fetching user services:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
