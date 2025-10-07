import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import UsersTestimonial from "@/app/models/admin/UserTestimonial";

interface memberTestimonialUpdatedRequest {
  reviewerName: string;
  testimonial: string;
  reviewerImage: string;
}

export const PUT = async (
  req: Request,
  { params }: { params: { id: String } }
) => {
  const { id } = params;
  const body: memberTestimonialUpdatedRequest = await req.json();

  const { reviewerName, testimonial, reviewerImage } = body;
  try {
    await connectToMongoDB();
    const updatedTestimonial = await UsersTestimonial.findByIdAndUpdate(
      id,
      {
        reviewerName,
        testimonial,
        reviewerImage,
      },
      { new: true }
    );

    if (!updatedTestimonial) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Something wrong with updating this user testimonial",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have succusfully updated the user testimonial",
        data: updatedTestimonial,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while updating member testimonials", error);
    return NextResponse.json(
      {
        message: "Interal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

export const GET = async (
  req: Request,
  { params }: { params: { id: String } }
) => {
  const { id } = params;
  try {
    await connectToMongoDB();
    const memberTestimonial = await UsersTestimonial.findById(id);
    if (!memberTestimonial) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Something wrong with fetching this user testimonial",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully fetched this member testimonial",
        data: memberTestimonial,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error in fetching the user testimonial", error);
    return NextResponse.json({
      message: "Internal server error",
      error: error.message, 
    });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { id: String } }
) => {
  const { id } = params;
  try {
    await connectToMongoDB();
    const deletedTestimonial = await UsersTestimonial.findByIdAndDelete(id);
    if (!deletedTestimonial) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Something wrong with deleting this user testimonial",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have successfully deleted this member testimonial",
        data: deletedTestimonial,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error in deleting the user testimonial", error);
    return NextResponse.json({
      message: "Internal server error",
      error: error.message, 
    });
  }
};
