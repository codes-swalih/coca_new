import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import roles from "../../../../models/admin/roles";

export async function GET(request: NextRequest) {
  try {
    console.log("GET request received for roles");

    await connectToMongoDB();
    console.log("MongoDB connected successfully");

    const allRoles = await roles.find().sort({ createdAt: -1 });
    console.log("Roles found:", allRoles);

    return NextResponse.json({
      status: "Success",
      message: "Roles retrieved successfully",
      data: allRoles,
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      {
        status: "Error",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
