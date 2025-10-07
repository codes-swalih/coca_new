import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import clubs from "../../../../../app/models/admin/Clubs";

interface clubUpdateRequest {
  clubName: string;
  since: string;
  clubManager: string;
  members: mongoose.Types.ObjectId[];
  events: mongoose.Types.ObjectId[];
  image: string;
}

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const body: clubUpdateRequest = await req.json();

  const { clubName, since, clubManager, members, events, image } = body;

  try {
    await connectToMongoDB();
    const updatedClub = await clubs.findByIdAndUpdate(
      id,
      {
        clubName,
        since,
        clubManager,
        members,
        events,
        image,
      },
      { new: true }
    );

    if (!updatedClub) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "There is no club with this particular ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "Success",
      message: "You have succesfully updated a club details",
      data: updatedClub,
    });
  } catch (error: any) {
    console.log("Error while updating club details", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
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
    const club = await clubs
      .findById(id)
      .populate("clubManager")
      .populate("members")
      .populate("events");

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

export const DELETE = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await connectToMongoDB();
    const deletedClub = await clubs.findByIdAndDelete(id);
    if (!deletedClub) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "There is no club with this particular ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully deleted a club",
        data: deletedClub,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while deleting a club", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};
