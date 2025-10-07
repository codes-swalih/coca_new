import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import UsersTestimonial from "@/app/models/admin/UserTestimonial";

interface userTestimonialRequest {
  reviewerName: string;
  testimonial: string;
  reviewerImage: string;
  memberId: string;
}

export const POST = async (req: Request) => {
  const body: userTestimonialRequest = await req.json();

  const { reviewerName, testimonial, reviewerImage, memberId } = body;

  if (!reviewerName || !testimonial || !reviewerImage || !memberId) {
    return NextResponse.json(
      { status: "Failed", message: "Please fill all the required fields" },
      { status: 404 }
    );
  }

  try {
    await connectToMongoDB();
    const uploadedTestimonial = await UsersTestimonial.create({
      reviewerName,
      testimonial,
      reviewerImage,
      memberId,
    });

    if (!uploadedTestimonial) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Somethign wrong when uploading the user testimonial",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "Success",
      message: "You have succesfully uploaded the user testimonials!",
      data: uploadedTestimonial,
    });
  } catch (error: any) {
    console.log("Error in uplaoding a member testimonial", error);
    return NextResponse.json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
