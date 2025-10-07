import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import roles from "../../../../../app/models/admin/roles";

interface roleRequest {
  title: string;
  categories: string[];
}

export const POST = async (req: Request) => {
  const body: roleRequest = await req.json();
  const { title, categories } = body;
  try {
    await connectToMongoDB();
    const isAlreadyExist = await roles.findOne({ title: title });
    if (isAlreadyExist) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "You already added a role with this same title",
        },
        { status: 409 }
      );
    }
    const newRole = await roles.create({ title, categories });
    return NextResponse.json(
      {
        status: "Success",
        message: "You have successfully added a new role",
        data: newRole,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while adding a new role", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};


export const GET = async (req: Request) => {
  try {
    await connectToMongoDB();
    const allRoles = await roles.find();
    if (allRoles.length === 0) {
      return NextResponse.json(
        { status: "Failed", message: "No roles found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully retrieved all roles",
        data: allRoles,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching all roles", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
