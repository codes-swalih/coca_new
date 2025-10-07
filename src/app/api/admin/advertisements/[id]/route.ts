import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import advertisements from "../../../../../app/models/admin/Advertisement";

interface AdvertisementUpdateRequest {
  image: string;
  link: string;
}

export const PUT = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const body: AdvertisementUpdateRequest = await req.json();
  const { image, link } = body;
  
  try {
    await connectToMongoDB();
    
    const updatedAdvertisement = await advertisements.findByIdAndUpdate(
      id,
      {
        image,
        link,
      },
      { new: true }
    );

    if (!updatedAdvertisement) {
      return NextResponse.json(
        { status: "Failed", message: "Advertisement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Advertisement updated successfully",
        data: updatedAdvertisement,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error updating advertisement:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  try {
    await connectToMongoDB();
    const advertisement = await advertisements.findById(id);
    
    if (!advertisement) {
      return NextResponse.json(
        { status: "Failed", message: "Advertisement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Advertisement fetched successfully",
        data: advertisement,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error fetching advertisement:", error);
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
  try {
    await connectToMongoDB();
    
    const deletedAd = await advertisements.findByIdAndDelete(params.id);
    
    if (!deletedAd) {
      return NextResponse.json(
        { status: "Error", message: "Advertisement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "Success",
      message: "Advertisement deleted successfully",
    });
  } catch (error: any) {
    console.log("Error deleting advertisement:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};