import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../../libs/mongodb";
import adminModel from "../../../../../models/admin/adminModel";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { username, password, role } = await request.json();
    const { id } = params;

    // Validate required fields
    if (!username || !role) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Missing required fields: username and role",
        },
        { status: 400 }
      );
    }

    await connectToMongoDB();

    // Check if admin exists
    const existingAdmin = await adminModel.findById(id);
    if (!existingAdmin) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Admin not found",
        },
        { status: 404 }
      );
    }

    // Check if new username conflicts with existing admins (excluding current admin)
    const nameConflict = await adminModel
      .findOne({
        username: username.toLowerCase(),
        _id: { $ne: id },
      })
      .populate("role");
    if (nameConflict) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Admin with this username already exists",
        },
        { status: 409 }
      );
    }

    // Prepare update data
    const updateData: any = {
      username: username.toLowerCase(),
      role,
      updatedAt: new Date(),
    };

    // Only update password if provided
    if (password && password.trim() !== "") {
      updateData.password = password;
    }

    // Update admin
    const updatedAdmin = await adminModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json({
      status: "Success",
      message: "Admin updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    return NextResponse.json(
      {
        status: "Error",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectToMongoDB();

    // Check if admin exists
    const existingAdmin = await adminModel.findById(id);
    if (!existingAdmin) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Admin not found",
        },
        { status: 404 }
      );
    }

    // Delete admin
    await adminModel.findByIdAndDelete(id);

    return NextResponse.json({
      status: "Success",
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      {
        status: "Error",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
