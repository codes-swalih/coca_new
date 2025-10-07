import mongoose from "mongoose";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import { NextResponse } from "next/server";
import userService from "../../../models/admin/UserSerivce";

interface userServiceRequest {
  serviceId: mongoose.Types.ObjectId[];
  memberId: string;
}

export const POST = async (req: Request) => {
  const body: userServiceRequest = await req.json();
  const { serviceId, memberId } = body;

  if (!serviceId || !memberId) {
    return NextResponse.json(
      { status: "Failed", message: "Please fill all the required fields" },
      { status: 404 }
    );
  }
  try {
    await connectToMongoDB();

    const isAlreadUploaded = await userService.findOne({ memberId: memberId });
    if (isAlreadUploaded) {
      return NextResponse.json({
        status: "Failed",
        message: "this member's service is already uploaded!",
      });
    }
    const memberServices = await userService.create({ serviceId, memberId });
    if (!memberServices) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "somethign wrong with uploading member services",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "Success",
      message: "You have succesfully uploaded the member services",
      data: memberServices,
    });
  } catch (error: any) {
    console.log("Error in uploading member service", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
