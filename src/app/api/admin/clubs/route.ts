import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import clubs from "../../../../app/models/admin/Clubs";

interface clubRequest {
  clubName: string;
  since: string;
  clubManager: string;
  members: mongoose.Types.ObjectId[];
  events: mongoose.Types.ObjectId[];
  image: string;
}

export const POST = async (req: Request) => {
  const body: clubRequest = await req.json();
  const { clubName, since, clubManager, members, events, image } = body;
  if (!clubName || !clubManager) {
    return NextResponse.json(
      { status: "Failed", message: "Please fill the required fields" },
      { status: 404 }
    );
  }
  try {
    await connectToMongoDB();
    const isAlreadyExist = await clubs.findOne({ clubName: clubName });
    if (isAlreadyExist) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "You already added a club with this same name!",
        },
        { status: 409 }
      );
    }

    const newClub = await clubs.create({
      clubName,
      since,
      clubManager,
      members,
      events,
      image,
    });

    return NextResponse.json({
      status: "Success",
      message: "You added a new club",
      data: newClub,
    });
  } catch (error: any) {
    console.log("Error while adding new club", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};

export const GET = async (req: Request) => {
  try {
    await connectToMongoDB();
    const allClubs = await clubs
      .find()
      .populate("clubManager", "nameOfBusinessOwner designation") // Only populate specific fields
      .populate("members", "nameOfBusinessOwner") // Only populate member names
      .populate("events", "eventName"); // Only populate event names
    
    if (allClubs.length === 0) {
      return NextResponse.json(
        { status: "Failed", message: "no clubs found" },
        { status: 404 }
      );
    }

    // Transform the data to match the expected frontend structure
    const transformedClubs = allClubs.map(club => {
      const clubObj = club.toObject();
      return {
        _id: clubObj._id,
        clubName: clubObj.clubName,
        since: clubObj.since,
        clubManager: typeof clubObj.clubManager === 'object' && clubObj.clubManager ? 
          (clubObj.clubManager as any).nameOfBusinessOwner || 'N/A' : 
          (clubObj.clubManager || 'N/A'),
        members: Array.isArray(clubObj.members) ? clubObj.members.length : 0,
        events: Array.isArray(clubObj.events) ? clubObj.events.length : 0,
        image: clubObj.image,
        createdAt: (clubObj as any).createdAt,
        updatedAt: (clubObj as any).updatedAt,
        // Keep the raw populated data for editing
        rawMembers: Array.isArray(clubObj.members) ? clubObj.members : [],
        rawEvents: Array.isArray(clubObj.events) ? clubObj.events : [],
        rawClubManager: clubObj.clubManager
      };
    });

    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully fetched clubs",
        data: transformedClubs,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching all clubs", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
