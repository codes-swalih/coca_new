import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import service from "../../../../models/admin/services";

interface serviceUpdatedRequest {
  serviceTitle: string;
  serviceImage: string;
}

export const PUT = async (
  req: Request,
  { params }: { params: { id: String } }
) => {
  const body: serviceUpdatedRequest = await req.json();
  const { serviceImage, serviceTitle } = body;
  const { id } = params;
  try {
    await connectToMongoDB();

    const updatedService = await service.findByIdAndUpdate(
      id,
      {
        serviceImage,
        serviceTitle,
      },
      { new: true }
    );

    if (!updatedService) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "something wrong with uploading services",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have successfully updated a service",
        data: updatedService,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error in updating services", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
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
    const fetchedService = await service.findById(id);
    if (!fetchedService) {
      return NextResponse.json(
        { status: "Failed", message: "there is no service with this id" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully retrieved this service",
        data: fetchedService,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error in fetching this service");
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
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
    const deletedService = await service.findByIdAndDelete(id);
    if (!deletedService) {
      return NextResponse.json(
        { status: "Failed", message: "there is no service with this id" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully deleted this service",
        data: deletedService,
      },
      { status: 200 }
    )
  }catch (error: any) {
    console.log("Error in deleting this service", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    )
  }
}
