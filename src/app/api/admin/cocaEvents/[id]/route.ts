import CocaEvents from "../../../../../app/models/admin/CocaEvents";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import { NextResponse } from "next/server";

interface CocaEventUpdateRequest {
  eventTitle: string;
  date: string;
  location: string;
  aboutEvent: string;
  eventImage: string;
}

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const body: CocaEventUpdateRequest = await req.json();
  const { eventTitle, date, location, aboutEvent, eventImage } = body;
  try {
    await connectToMongoDB();
    const updatedCocaEvent = await CocaEvents.findByIdAndUpdate(
      id,
      { eventTitle, date, location, aboutEvent, eventImage },
      { new: true }
    );

    if (!updatedCocaEvent) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Something wrong with this coca event id",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have successfully update the coca event",
        data: updatedCocaEvent,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while updating a coca event", error);
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
    const deletedCocaEvent = await CocaEvents.findByIdAndDelete(id);
    if (!deletedCocaEvent) {
      return NextResponse.json(
        { status: "Failed", message: "there is no event this particular id" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully deleted this coca event",
        data: deletedCocaEvent,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while deleting a coca event", error);
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
    const cocaEvent = await CocaEvents.findById(id);
    if (!cocaEvent) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "There is no coca event with this particular id",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "you have succesfully fetched a coca event",
        data: cocaEvent,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching a coca event", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};
