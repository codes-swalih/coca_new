import CocaEvents from "../../../../app/models/admin/CocaEvents";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import { NextResponse } from "next/server";

interface CocaEventRequest {
  eventTitle: string;
  date: string;
  location: string;
  aboutEvent: string;
  eventImage: string;
}

export const POST = async (req: Request) => {
  const body: CocaEventRequest = await req.json();
  const { eventTitle, date, location, aboutEvent, eventImage } = body;

  try {
    await connectToMongoDB();
    const isAlreadyExist = await CocaEvents.findOne({
      eventTitle: eventTitle,
      date: date,
    });

    if (isAlreadyExist) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "You have already added this event with same name and date",
        },
        { status: 409 }
      );
    }

    const newCocaEvent = await CocaEvents.create({
      eventTitle,
      date,
      location,
      aboutEvent,
      eventImage,
    });

    return NextResponse.json({
      status: "Success",
      message: "you have sucessfully added new coca event",
      data: newCocaEvent,
    });
  } catch (error: any) {
    console.log("Error while adding a coca event", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

export const GET = async (req: Request) => {
  try {
    await connectToMongoDB();
    const allCocaEvents = await CocaEvents.find();
    if (allCocaEvents.length === 0) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "No coca events added",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "you sucessfully fetched coca events",
        data: allCocaEvents,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching all coca events", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};
