import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import clubs from "../../../../../app/models/admin/Clubs";

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await connectToMongoDB();
    const club = await clubs
      .findById(id)
      .populate("clubManager")
      .populate("members");

    if (!club) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "There is no club with this particular id",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have sucessfully retrieved this club details",
        data: club,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while getting a club details", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
