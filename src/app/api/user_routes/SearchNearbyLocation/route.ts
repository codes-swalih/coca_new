import { NextRequest, NextResponse } from "next/server";
import userBusines from "@/app/models/admin/UserBusiness";
import { connectToMongoDB } from "../../../../../libs/mongodb";

export async function GET(req: NextRequest) {
  try {
    await connectToMongoDB();

    const searchParams = req.nextUrl.searchParams;
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseFloat(searchParams.get("radius") || "10000"); // in meters

    const nearbyBusinesses = await userBusines.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radius, // e.g., 10km radius
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: nearbyBusinesses.length,
      data: nearbyBusinesses,
    });
  } catch (err: any) {
    console.error("Error finding nearby businesses:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
