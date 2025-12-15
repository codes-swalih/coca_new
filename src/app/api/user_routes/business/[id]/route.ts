import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import userBusines from "../../../../../app/models/admin/UserBusiness";

interface BusinessUpdatingRequest {
  nameOfBusiness?: string;
  businessPhoneNumber?: string;
  businessEmailId?: string;
  address?: string;
  businessLocation?: string;
  businessLogo?: string;
  gallaryLink?: string;
  facebookAccount?: string;
  instagramAccount?: string;
  whatsAppLink?: string;
  youtubeChannel?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  branch?: string;
  upiId?: string;
  lat?: string;
  log?: string;
  paymentQrCode?: string;
  mid?: string;
}

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const body: BusinessUpdatingRequest = await req.json();

  try {
    await connectToMongoDB();

    // Prepare update object
    const updateFields: any = { ...body };

    // ✅ Handle lat/log properly (convert to GeoJSON)
    if (body.lat && body.log) {
      const lat = parseFloat(body.lat);
      const log = parseFloat(body.log);

      if (isNaN(lat) || isNaN(log)) {
        return NextResponse.json(
          {
            status: "Failed",
            message: "Invalid latitude or longitude values",
          },
          { status: 400 }
        );
      }

      updateFields.location = {
        type: "Point",
        coordinates: [log, lat], // GeoJSON order: [longitude, latitude]
      };

      // remove old lat/log from object to prevent storing as string
      delete updateFields.lat;
      delete updateFields.log;
    }

    const updatedBusinessDetails = await userBusines.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedBusinessDetails) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "No business found with this ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Business details successfully updated",
        data: updatedBusinessDetails,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in updating business details:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// ✅ GET single business by ID
export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  try {
    await connectToMongoDB();

    const memberBusinessDetails = await userBusines.findById(id);

    if (!memberBusinessDetails) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "No business details found with this ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Fetched business details successfully",
        data: memberBusinessDetails,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching business details:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// ✅ DELETE business by ID
export const DELETE = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  try {
    await connectToMongoDB();

    const deletedBusinessDetails = await userBusines.findByIdAndDelete(id);

    if (!deletedBusinessDetails) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "No business details found with this ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Business details deleted successfully",
        data: deletedBusinessDetails,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting business details:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
