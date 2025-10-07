import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import service from "../../../models/admin/services";

interface AddingServiceRequest {
  serviceTitle: string;
  serviceImage: string;
}

export const POST = async (req: Request) => {
  try {
    await connectToMongoDB();
    const body: AddingServiceRequest = await req.json();
    const { serviceTitle, serviceImage } = body;

    if (!serviceTitle || !serviceImage) {
      return NextResponse.json(
        { status: "Failed", message: "Please fill all the required fields" },
        { status: 404 }
      );
    }

    const isAlreadyUploaded = await service.findOne({
      serviceTitle: serviceTitle,
    });

    if (isAlreadyUploaded) {
      return NextResponse.json(
        { status: "Failed", message: "You are already uploaded this service" },
        { status: 409 }
      );
    }

    const newService = await service.create({ serviceTitle, serviceImage });

    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully uploaded the new service",
        data: newService,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log("Error in uploadig new service", error);
    return NextResponse.json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const GET = async (req: Request) => {
  try {
    await connectToMongoDB();
    const allServices = await service.find();
    if (allServices.length === 0) {
      return NextResponse.json(
        { status: "Failed", message: "there is no services uploaded" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "Success",
      message: "You have succesfully uploaded a new service",
      data: allServices,
    });
  } catch (error: any) {
    console.log("Error in fetching services", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
