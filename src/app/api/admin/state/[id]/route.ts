import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import State from "@/app/models/admin/State";

interface UpdateStateRequest {
  stateName: string;
}

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const body: UpdateStateRequest = await req.json();
  const { stateName } = body;

  if (!stateName) {
    return NextResponse.json(
      { status: "Failed", message: "Please provide state name" },
      { status: 400 }
    );
  }

  try {
    await connectToMongoDB();

    // Check if state exists
    const existingState = await State.findById(id);
    if (!existingState) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "State not found!",
        },
        { status: 404 }
      );
    }

    // Check if another state already has this name
    const isNameTaken = await State.findOne({
      stateName: stateName,
      _id: { $ne: id },
    });
    if (isNameTaken) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Another state with this name already exists!",
        },
        { status: 409 }
      );
    }

    const updatedState = await State.findByIdAndUpdate(
      id,
      { stateName },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      status: "Success",
      message: "State updated successfully",
      data: updatedState,
    });
  } catch (error: any) {
    console.log("Error while updating state", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
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

    // Check if state exists
    const existingState = await State.findById(id);
    if (!existingState) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "State not found!",
        },
        { status: 404 }
      );
    }

    // TODO: Add validation to check if state is referenced by districts
    // This would require importing the District model and checking references

    await State.findByIdAndDelete(id);

    return NextResponse.json({
      status: "Success",
      message: "State deleted successfully",
    });
  } catch (error: any) {
    console.log("Error while deleting state", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};
