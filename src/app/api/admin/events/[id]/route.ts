import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import events from "../../../../../app/models/admin/Events";
import clubs from "../../../../../app/models/admin/Clubs";

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
    
    // Get the current event to check if club has changed
    const currentEvent = await events.findById(id);
    if (!currentEvent) {
      return NextResponse.json(
        { status: "Failed", message: "Event not found" },
        { status: 404 }
      );
    }
    
    // If club has changed, update the club references
    if (currentEvent.club.toString() !== club.toString()) {
      // Remove event from old club's events array
      await clubs.findByIdAndUpdate(
        currentEvent.club,
        { $pull: { events: id } }
      );
      
      // Add event to new club's events array
      await clubs.findByIdAndUpdate(
        club,
        { $push: { events: id } }
      );
    }
    
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

export const DELETE = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await connectToMongoDB();
    
    // Get the event to find its club
    const eventToDelete = await events.findById(id);
    if (!eventToDelete) {
      return NextResponse.json(
        { status: "Failed", message: "There is no event with this id" },
        { status: 404 }
      );
    }
    
    // Remove the event from the club's events array
    await clubs.findByIdAndUpdate(
      eventToDelete.club,
      { $pull: { events: id } }
    );
    
    // Delete the event
    const deletedEvent = await events.findByIdAndDelete(id);
    
    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully deleted this event",
        data: deletedEvent,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while deleting this event", error);
    return NextResponse.json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
