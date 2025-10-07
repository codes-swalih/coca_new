import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import Zone from "@/app/models/admin/Zone";
import District from "@/app/models/admin/District";
import State from "@/app/models/admin/State";

interface ZoneRequest {
  zoneName: string;
  district: string; // This will be the district ObjectId as string
  state: string; // This will be the state ObjectId as string
}

export const POST = async (req: Request) => {
  const body: ZoneRequest = await req.json();
  const { zoneName, district, state } = body;

  if (!zoneName || !district || !state) {
    return NextResponse.json(
      {
        status: "Failed",
        message: "Please provide zone name, district and state",
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

    // Check if zone already exists in this district
    const isAlreadyExist = await Zone.findOne({
      zoneName: zoneName,
      district: district,
    });
    if (isAlreadyExist) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Zone with this name already exists in this district!",
        },
        { status: 409 }
      );
    }

    const newZone = await Zone.create({
      zoneName,
      district,
      state,
    });

    return NextResponse.json({
      status: "Success",
      message: "Zone created successfully",
      data: newZone,
    });
  } catch (error: any) {
    console.log("Error while creating new zone", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};

export const GET = async (req: Request) => {
  try {
    await connectToMongoDB();
    const allZones = await Zone.find()
      .populate("state", "stateName")
      .populate("district", "districtName")
      .sort({ zoneName: 1 });

    if (allZones.length === 0) {
      return NextResponse.json(
        { status: "Failed", message: "No zones found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Zones fetched successfully",
        data: allZones,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching all zones", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
