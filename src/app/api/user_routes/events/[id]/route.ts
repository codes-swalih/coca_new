import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import events from "../../../../../app/models/admin/Events";

interface EventUpdateRequest {
  eventTitle: string;
  date: string;
  location: string;
  aboutEvent: string;
  eventImage: string;
  club: mongoose.Types.ObjectId;
}

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const body: EventUpdateRequest = await req.json();
  const { eventTitle, date, location, aboutEvent, eventImage, club } = body;
  try {
    await connectToMongoDB();
    const editedEvent = await events.findByIdAndUpdate(
      id,
      {
        eventTitle,
        date,
        location,
        aboutEvent,
        eventImage,
        club,
      },
      { new: true }
    );

    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully updated the event",
        data: editedEvent,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while editing the event", error);
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
    const fetchedEvent = await events.findById(id).populate("club");
    if (!fetchedEvent) {
      return NextResponse.json(
        { status: "failed", message: "There is no event with this id" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "you have succesfully fetched the event",
        data: fetchedEvent,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching an event", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
