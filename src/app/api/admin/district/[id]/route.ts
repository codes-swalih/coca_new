import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import District from "@/app/models/admin/District";
import State from "@/app/models/admin/State";

interface UpdateDistrictRequest {
  districtName: string;
  state: string;
}

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const body: UpdateDistrictRequest = await req.json();
  const { districtName, state } = body;

  if (!districtName || !state) {
    return NextResponse.json(
      { status: "Failed", message: "Please provide district name and state" },
      { status: 400 }
    );
  }

  try {
    await connectToMongoDB();

    // Check if district exists
    const existingDistrict = await District.findById(id);
    if (!existingDistrict) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "District not found!",
        },
        { status: 404 }
      );
    }

    // Validate if state exists
    const stateExists = await State.findById(state);
    if (!stateExists) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "State not found!",
        },
        { status: 404 }
      );
    }

    // Check if another district already has this name in the same state
    const isNameTaken = await District.findOne({
      districtName: districtName,
      state: state,
      _id: { $ne: id },
    });
    if (isNameTaken) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Another district with this name already exists in this state!",
        },
        { status: 409 }
      );
    }

    const updatedDistrict = await District.findByIdAndUpdate(
      id,
      { districtName, state },
      { new: true, runValidators: true }
    ).populate("state", "stateName");

    return NextResponse.json({
      status: "Success",
      message: "District updated successfully",
      data: updatedDistrict,
    });
  } catch (error: any) {
    console.log("Error while updating district", error);
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

    // Check if district exists
    const existingDistrict = await District.findById(id);
    if (!existingDistrict) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "District not found!",
        },
        { status: 404 }
      );
    }

    // TODO: Add validation to check if district is referenced by zones
    // This would require importing the Zone model and checking references

    await District.findByIdAndDelete(id);

    return NextResponse.json({
      status: "Success",
      message: "District deleted successfully",
    });
  } catch (error: any) {
    console.log("Error while deleting district", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};
