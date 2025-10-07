import mongoose from "mongoose";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import events from "../../../../app/models/admin/Events";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  try {
    await connectToMongoDB();
    const allEvents = await events.find().populate("club");

    if (allEvents.length === 0) {
      return NextResponse.json(
        { status: "Failed", message: "No events found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully retrieved all events",
        data: allEvents,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching all events", error);

    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
