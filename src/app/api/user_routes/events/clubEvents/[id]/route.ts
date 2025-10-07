import events from "../../../../../../app/models/admin/Events";
import { connectToMongoDB } from "../../../../../../../libs/mongodb";
import { NextResponse } from "next/server";
import "../../../../../models/admin/Clubs";

export const GET = async (
  req: Request,
  { params }: { params: { id: String } }
) => {
  const { id } = params;
  try {
    await connectToMongoDB();
    const allEvents = await events.find({ club: id }).populate("club");
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
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};
