import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectToMongoDB } from "../../../../../../../libs/mongodb";
import admin from "../../../../../../app/models/admin/adminModel";
import { NextResponse } from "next/server";
interface adminUpdateRequest {
  username: string;
  password: string;
  role: mongoose.Types.ObjectId;
}

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const body: adminUpdateRequest = await req.json();
  const { username, password, role } = body;

  let hashedPassword = password;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(password, salt);
  }
  try {
    await connectToMongoDB();
    const editedAdmin = await admin.findByIdAndUpdate(
      id,
      {
        username,
        password: hashedPassword,
        role,
      },
      { new: true }
    );

    return NextResponse.json(
      {
        status: "Success",
        message: "You have successfully updated the admin",
        data: editedAdmin,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while updating an admin", error);
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
    const deletedAdmin = await admin.findByIdAndDelete(id);
    if (!deletedAdmin) {
      return NextResponse.json(
        { status: "Failed", message: "There is no admin with this id" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        status: "Success",
        message: "You have successfully deleted this admin",
        data: deletedAdmin,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while deleting this admin", error);
    return NextResponse.json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await connectToMongoDB();
    const fetchedAdmin = await admin.findById(id).populate("role");
    if (!fetchedAdmin) {
      return NextResponse.json(
        { status: "failed", message: "There is no admin with this id" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "you have succesfully fetched the admin",
        data: fetchedAdmin,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching an admin", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
