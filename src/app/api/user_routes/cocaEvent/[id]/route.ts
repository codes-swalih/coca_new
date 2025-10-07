import CocaEvents from "../../../../../app/models/admin/CocaEvents";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import { NextResponse } from "next/server";

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
