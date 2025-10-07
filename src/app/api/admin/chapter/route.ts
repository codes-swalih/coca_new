import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import Chapter from "@/app/models/admin/Chapter";
import Zone from "@/app/models/admin/Zone";
import District from "@/app/models/admin/District";
import State from "@/app/models/admin/State";

interface ChapterRequest {
  chapterName: string;
  zone: string; // This will be the zone ObjectId as string
  district: string; // This will be the district ObjectId as string
  state: string; // This will be the state ObjectId as string
}

export const POST = async (req: Request) => {
  const body: ChapterRequest = await req.json();
  const { chapterName, zone, district, state } = body;

  if (!chapterName || !zone || !district || !state) {
    return NextResponse.json(
      {
        status: "Failed",
        message: "Please provide chapter name, zone, district and state",
      },
      { status: 400 }
    );
  }

  try {
    await connectToMongoDB();

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
          message:
            "District not found or does not belong to the specified state!",
        },
        { status: 404 }
      );
    }

    // Validate if zone exists and belongs to the specified district and state
    const zoneExists = await Zone.findOne({
      _id: zone,
      district: district,
      state: state,
    });
    if (!zoneExists) {
      return NextResponse.json(
        {
          status: "Failed",
          message:
            "Zone not found or does not belong to the specified district and state!",
        },
        { status: 404 }
      );
    }

    // Check if chapter already exists in this zone
    const isAlreadyExist = await Chapter.findOne({
      chapterName: chapterName,
      zone: zone,
    });
    if (isAlreadyExist) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Chapter with this name already exists in this zone!",
        },
        { status: 409 }
      );
    }

    const newChapter = await Chapter.create({
      chapterName,
      zone,
      district,
      state,
    });

    return NextResponse.json({
      status: "Success",
      message: "Chapter created successfully",
      data: newChapter,
    });
  } catch (error: any) {
    console.log("Error while creating new chapter", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};

export const GET = async (req: Request) => {
  try {
    await connectToMongoDB();
    const allChapters = await Chapter.find()
      .populate("state", "stateName")
      .populate("district", "districtName")
      .populate("zone", "zoneName")
      .sort({ chapterName: 1 });

    if (allChapters.length === 0) {
      return NextResponse.json(
        { status: "Failed", message: "No chapters found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Chapters fetched successfully",
        data: allChapters,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching all chapters", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
