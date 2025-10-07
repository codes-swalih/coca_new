import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import Zone from "@/app/models/admin/Zone";
import District from "@/app/models/admin/District";
import State from "@/app/models/admin/State";

interface UpdateZoneRequest {
  zoneName: string;
  district: string;
  state: string;
}

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const body: UpdateZoneRequest = await req.json();
  const { zoneName, district, state } = body;

  if (!zoneName || !district || !state) {
    return NextResponse.json(
      { status: "Failed", message: "Please provide zone name, district and state" },
      { status: 400 }
    );
  }

  try {
    await connectToMongoDB();

    // Check if zone exists
    const existingZone = await Zone.findById(id);
    if (!existingZone) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Zone not found!",
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

    // Validate if district exists and belongs to the specified state
    const districtExists = await District.findOne({
      _id: district,
      state: state,
    });
    if (!districtExists) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "District not found or does not belong to the specified state!",
        },
        { status: 404 }
      );
    }

    // Check if another zone already has this name in the same district
    const isNameTaken = await Zone.findOne({
      zoneName: zoneName,
      district: district,
      _id: { $ne: id },
    });
    if (isNameTaken) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Another zone with this name already exists in this district!",
        },
        { status: 409 }
      );
    }

    const updatedZone = await Zone.findByIdAndUpdate(
      id,
      { zoneName, district, state },
      { new: true, runValidators: true }
    ).populate("state", "stateName").populate("district", "districtName");

    return NextResponse.json({
      status: "Success",
      message: "Zone updated successfully",
      data: updatedZone,
    });
  } catch (error: any) {
    console.log("Error while updating zone", error);
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

    // Check if zone exists
    const existingZone = await Zone.findById(id);
    if (!existingZone) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Zone not found!",
        },
        { status: 404 }
      );
    }

    // TODO: Add validation to check if zone is referenced by chapters
    // This would require importing the Chapter model and checking references

    await Zone.findByIdAndDelete(id);

    return NextResponse.json({
      status: "Success",
      message: "Zone deleted successfully",
    });
  } catch (error: any) {
    console.log("Error while deleting zone", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};
