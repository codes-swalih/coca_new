import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import District from "@/app/models/admin/District";
import State from "@/app/models/admin/State";

interface DistrictRequest {
  districtName: string;
  state: string; // This will be the state ObjectId as string
}

export const POST = async (req: Request) => {
  const body: DistrictRequest = await req.json();
  const { districtName, state } = body;

  if (!districtName || !state) {
    return NextResponse.json(
      { status: "Failed", message: "Please provide district name and state" },
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

    // Check if district already exists in this state
    const isAlreadyExist = await District.findOne({
      districtName: districtName,
      state: state,
    });
    if (isAlreadyExist) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "District with this name already exists in this state!",
        },
        { status: 409 }
      );
    }

    const newDistrict = await District.create({
      districtName,
      state,
    });

    return NextResponse.json({
      status: "Success",
      message: "District created successfully",
      data: newDistrict,
    });
  } catch (error: any) {
    console.log("Error while creating new district", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};

export const GET = async (req: Request) => {
  try {
    await connectToMongoDB();
    const allDistricts = await District.find()
      .populate("state", "stateName")
      .sort({ districtName: 1 });

    if (allDistricts.length === 0) {
      return NextResponse.json(
        { status: "Failed", message: "No districts found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Districts fetched successfully",
        data: allDistricts,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching all districts", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
