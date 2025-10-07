import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import State from "@/app/models/admin/State";

interface StateRequest {
  stateName: string;
}

export const POST = async (req: Request) => {
  const body: StateRequest = await req.json();
  const { stateName } = body;

  if (!stateName) {
    return NextResponse.json(
      { status: "Failed", message: "Please provide state name" },
      { status: 400 }
    );
  }

  try {
    await connectToMongoDB();

    // Check if state already exists
    const isAlreadyExist = await State.findOne({ stateName: stateName });
    if (isAlreadyExist) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "State with this name already exists!",
        },
        { status: 409 }
      );
    }

    const newState = await State.create({
      stateName,
    });

    return NextResponse.json({
      status: "Success",
      message: "State created successfully",
      data: newState,
    });
  } catch (error: any) {
    console.log("Error while creating new state", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};

export const GET = async (req: Request) => {
  try {
    await connectToMongoDB();
    const allStates = await State.find().sort({ stateName: 1 });

    if (allStates.length === 0) {
      return NextResponse.json(
        { status: "Failed", message: "No states found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "States fetched successfully",
        data: allStates,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching all states", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
