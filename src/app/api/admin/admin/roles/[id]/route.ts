import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '../../../../../../../libs/mongodb';
import roles from '../../../../../models/admin/roles';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title, categories } = await request.json();
    const { id } = params;

    // Validate required fields
    if (!title || !categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { 
          status: 'Error', 
          message: 'Missing required fields: title and categories array' 
        },
        { status: 400 }
      );
    }

    await connectToMongoDB();

    // Check if role exists
    const existingRole = await roles.findById(id);
    if (!existingRole) {
      return NextResponse.json(
        { 
          status: 'Error', 
          message: 'Role not found' 
        },
        { status: 404 }
      );
    }

    // Check if new title conflicts with existing roles (excluding current role)
    const nameConflict = await roles.findOne({ 
      title: title.toLowerCase(), 
      _id: { $ne: id } 
    });
    if (nameConflict) {
      return NextResponse.json(
        { 
          status: 'Error', 
          message: 'Role with this title already exists' 
        },
        { status: 409 }
      );
    }

    // Update role
    const updatedRole = await roles.findByIdAndUpdate(
      id,
      {
        title: title.toLowerCase(),
        categories,
        updatedAt: new Date()
      },
      { new: true }
    );

    return NextResponse.json({
      status: 'Success',
      message: 'Role updated successfully',
      data: updatedRole
    });

  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { 
        status: 'Error', 
        message: 'Internal server error' 
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

    // Check if role exists
    const existingRole = await roles.findById(id);
    if (!existingRole) {
      return NextResponse.json(
        { 
          status: 'Error', 
          message: 'Role not found' 
        },
        { status: 404 }
      );
    }

    // Delete role
    await roles.findByIdAndDelete(id);

    return NextResponse.json({
      status: 'Success',
      message: 'Role deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { 
        status: 'Error', 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
