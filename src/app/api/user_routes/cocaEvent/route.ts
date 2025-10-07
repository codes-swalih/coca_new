import CocaEvents from "../../../../app/models/admin/CocaEvents";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import { NextResponse } from "next/server";

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
