import bcrypt from "bcryptjs";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import admin from "../../../../../app/models/admin/adminModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

interface adminRequest {
  username: string;
  password: string;
  role: mongoose.Types.ObjectId;
}

export const POST = async (req: Request) => {
  const body: adminRequest = await req.json();
  const { username, password, role } = body;
  try {
    await connectToMongoDB();
    const isAlreadyExist = await admin.findOne({ username: username });
    if (isAlreadyExist) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "You already added an admin with this same username",
        },
        { status: 409 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await admin.create({
      username,
      password: hashedPassword,
      role,
    });
    return NextResponse.json(
      {
        status: "Success",
        message: "You have successfully added a new admin",
        data: newAdmin,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while adding a new admin", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};

export const GET = async (req: Request) => {
  try {
    await connectToMongoDB();
    const allAdmins = await admin.find().populate("role");
    if (allAdmins.length === 0) {
      return NextResponse.json(
        { status: "Failed", message: "No admins found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        status: "Success",
        message: "You have successfully retrieved all admins",
        data: allAdmins,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching all admins", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};
