import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import clubs from "../../../../app/models/admin/Clubs";

export const GET = async (req: Request) => {
  try {
    await connectToMongoDB();
    const allClubs = await clubs
      .find()
      .populate("clubManager")
      .populate("members");
    if (allClubs.length === 0) {
      return NextResponse.json(
        { status: "Failed", message: "no clubs found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully fetched clubs",
        data: allClubs,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching all clubs", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
