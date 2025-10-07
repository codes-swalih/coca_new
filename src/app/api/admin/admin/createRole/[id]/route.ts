import roles from "@/app/models/admin/roles";
import { connectToMongoDB } from "../../../../../../../libs/mongodb";
import { NextResponse } from "next/server";

interface roleUpdateRequest {
  title: string;
  categories: string[];
}

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const body: roleUpdateRequest = await req.json();
  const { title, categories } = body;
  try {
    await connectToMongoDB();
    const editedRole = await roles.findByIdAndUpdate(
      id,
      {
        title,
        categories,
      },
      { new: true }
    );

    return NextResponse.json(
      {
        status: "Success",
        message: "You have successfully updated the role",
        data: editedRole,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while updating a role", error);
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
    const deletedRole = await roles.findByIdAndDelete(id);
    if (!deletedRole) {
      return NextResponse.json(
        { status: "Failed", message: "There is no role with this id" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        status: "Success",
        message: "You have successfully deleted this role",
        data: deletedRole,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while deleting this role", error);
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
    const fetchedRole = await roles.findById(id);
    if (!fetchedRole) {
      return NextResponse.json(
        { status: "failed", message: "There is no role with this id" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "you have succesfully fetched the role",
        data: fetchedRole,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching a role", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
