import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import events from "../../../../app/models/admin/Events";
import clubs from "../../../../app/models/admin/Clubs";

interface EventRequest {
  eventTitle: string;
  date: string;
  location: string;
  aboutEvent: string;
  eventImage: string;
  club: string;
}

export const POST = async (req: Request) => {
  const body: EventRequest = await req.json();
  const { eventTitle, date, location, aboutEvent, eventImage, club } = body;

  if (!eventTitle || !date || !location || !aboutEvent || !club) {
    return NextResponse.json(
      { status: "Failed", message: "Please fill all required fields" },
      { status: 400 }
    );
  }

  try {
    await connectToMongoDB();
    
    // Create the new event
    const newEvent = await events.create({
      eventTitle,
      date,
      location,
      aboutEvent,
      eventImage,
      club,
    });

    // Add the event to the club's events array
    await clubs.findByIdAndUpdate(
      club,
      { $push: { events: newEvent._id } },
      { new: true }
    );

    return NextResponse.json(
      {
        status: "Success",
        message: "Event created successfully",
        data: newEvent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log("Error creating event:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};

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
        message: "Events fetched successfully",
        data: allEvents,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error fetching events:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};
