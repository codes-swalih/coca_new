import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import Chapter from "@/app/models/admin/Chapter";
import Zone from "@/app/models/admin/Zone";
import District from "@/app/models/admin/District";
import State from "@/app/models/admin/State";

interface UpdateChapterRequest {
  chapterName: string;
  zone: string;
  district: string;
  state: string;
}

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const body: UpdateChapterRequest = await req.json();
  const { chapterName, zone, district, state } = body;

  if (!chapterName || !zone || !district || !state) {
    return NextResponse.json(
      { status: "Failed", message: "Please provide chapter name, zone, district and state" },
      { status: 400 }
    );
  }

  try {
    await connectToMongoDB();

    // Check if chapter exists
    const existingChapter = await Chapter.findById(id);
    if (!existingChapter) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Chapter not found!",
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

    // Validate if zone exists and belongs to the specified district
    const zoneExists = await Zone.findOne({
      _id: zone,
      district: district,
      state: state,
    });
    if (!zoneExists) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Zone not found or does not belong to the specified district!",
        },
        { status: 404 }
      );
    }

    // Check if another chapter already has this name in the same zone
    const isNameTaken = await Chapter.findOne({
      chapterName: chapterName,
      zone: zone,
      _id: { $ne: id },
    });
    if (isNameTaken) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Another chapter with this name already exists in this zone!",
        },
        { status: 409 }
      );
    }

    const updatedChapter = await Chapter.findByIdAndUpdate(
      id,
      { chapterName, zone, district, state },
      { new: true, runValidators: true }
    ).populate("state", "stateName").populate("district", "districtName").populate("zone", "zoneName");

    return NextResponse.json({
      status: "Success",
      message: "Chapter updated successfully",
      data: updatedChapter,
    });
  } catch (error: any) {
    console.log("Error while updating chapter", error);
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

    // Check if chapter exists
    const existingChapter = await Chapter.findById(id);
    if (!existingChapter) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Chapter not found!",
        },
        { status: 404 }
      );
    }

    // TODO: Add validation to check if chapter is referenced by other entities
    // This would require checking references in other models

    await Chapter.findByIdAndDelete(id);

    return NextResponse.json({
      status: "Success",
      message: "Chapter deleted successfully",
    });
  } catch (error: any) {
    console.log("Error while deleting chapter", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};
