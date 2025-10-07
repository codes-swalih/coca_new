import { connectToMongoDB } from "../../../../../../libs/mongodb";
import UsersTestimonial from "../../../../../app/models/admin/UserTestimonial";
import { NextResponse } from "next/server";

interface oneMemberTestimonial {
  memberId: string;
}

export const POST = async (req: Request) => {
  const body: oneMemberTestimonial = await req.json();
  const { memberId } = body;

  let memberTestimonial: any;
  try {
    await connectToMongoDB();
    memberTestimonial = await UsersTestimonial.find({
      memberId: memberId,
    });
    if (memberTestimonial.length === 0) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "There is no testimonial with this member id",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { status: "Failed", message: "Something went wrong" },
      { status: 404 }
    );
  }
  return NextResponse.json(
    {
      status: "Success",
      message: "You have successfully fetched all the member testimonial",
      data: memberTestimonial,
    },
    { status: 200 }
  );
};
