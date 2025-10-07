import admin from "../../../../../app/models/admin/adminModel";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

interface AdminLoginRequest {
  username: string;
  password: string;
}


export const POST = async (req: Request) => {
  const body: AdminLoginRequest = await req.json();
  const { username, password } = body;
  try {
    await connectToMongoDB();
    const isAlreadyExist = await admin.findOne({ username: username });
    if (!isAlreadyExist) {
      return NextResponse.json(
        { status: "Failed", message: "There is no admin with this username" },
        { status: 404 }
      );
    }
    const isPasswordCorrect = await bcrypt.compare(password, isAlreadyExist.password);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { status: "Failed", message: "Password is incorrect" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        status: "Success",
        message: "You have successfully logged in",
        data: isAlreadyExist,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while logging in", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};