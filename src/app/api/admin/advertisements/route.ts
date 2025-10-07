import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import advertisements from "../../../../app/models/admin/Advertisement";

interface AdvertisementRequest {
  image: string;
  link: string;
}

export const POST = async (req: Request) => {
  const body: AdvertisementRequest = await req.json();
  const { image, link } = body;
  
  try {
    await connectToMongoDB();
    
    const newAdvertisement = await advertisements.create({
      image,
      link,
    });

    return NextResponse.json({
      status: "Success",
      message: "Advertisement created successfully",
      data: newAdvertisement,
    }, { status: 201 });
  } catch (error: any) {
    console.log("Error creating advertisement:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};

export const GET = async (req: Request) => {
  try {
    await connectToMongoDB();
    const allAdvertisements = await advertisements.find();
    
    if (allAdvertisements.length === 0) {
      return NextResponse.json(
        { status: "Success", message: "No advertisements found", data: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Advertisements fetched successfully",
        data: allAdvertisements,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error fetching advertisements:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};