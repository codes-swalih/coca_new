import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '../../../../../../libs/mongodb';
import adminModel from '../../../../models/admin/adminModel';

export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();
    
    const allAdmins = await adminModel.find().select('-password').sort({ createdAt: -1 }).populate('role');
    
    return NextResponse.json({
      status: 'Success',
      message: 'Admins retrieved successfully',
      data: allAdmins
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { 
        status: 'Error', 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
